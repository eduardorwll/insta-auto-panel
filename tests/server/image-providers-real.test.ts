import { afterEach, describe, expect, it } from "bun:test";
import {
  OpenAIImageProvider,
  OpenRouterImageProvider,
  GeminiImagenProvider,
  buildImagePrompt,
} from "@/server/services/design/image-provider";

const realFetch = globalThis.fetch;
const PNG_B64 = "iVBORw0KGgo=";

type Call = { url: string; init: RequestInit };
function mockFetch(responder: (call: Call) => Response | Promise<Response>) {
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const call = { url: String(url), init: init ?? {} };
    calls.push(call);
    return responder(call);
  }) as typeof fetch;
  return calls;
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => {
  globalThis.fetch = realFetch;
});

const base = { prompt: "clínica odontológica moderna", brandPrimaryColor: "#0D9488" };

describe("Provedores de imagem reais (prontos para a chave)", () => {
  it("OpenAI: com chave chama /v1/images/generations e devolve data URI sem fallback", async () => {
    const calls = mockFetch(() => json({ data: [{ b64_json: PNG_B64 }] }));
    const res = await new OpenAIImageProvider({ provider: "openai-image", apiKey: "sk-test" }).generateBackground(base);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe("https://api.openai.com/v1/images/generations");
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe("Bearer sk-test");
    const body = JSON.parse(String(calls[0]!.init.body));
    expect(body.model).toBe("gpt-image-1");
    expect(body.size).toBe("1024x1536");
    expect(body).not.toHaveProperty("response_format");
    expect(res.imageUrl).toBe(`data:image/png;base64,${PNG_B64}`);
    expect(res.isFallback).toBeFalsy();
  });

  it("OpenRouter: usa chat/completions com modalities image e lê message.images", async () => {
    const calls = mockFetch(() =>
      json({ choices: [{ message: { images: [{ type: "image_url", image_url: { url: `data:image/png;base64,${PNG_B64}` } }] } }] })
    );
    const res = await new OpenRouterImageProvider({ provider: "openrouter-image", apiKey: "or-test" }).generateBackground(base);
    expect(calls[0]!.url).toBe("https://openrouter.ai/api/v1/chat/completions");
    const body = JSON.parse(String(calls[0]!.init.body));
    expect(body.modalities).toEqual(["image", "text"]);
    expect(body.messages[0].content).toContain("clínica odontológica moderna");
    expect(res.imageUrl).toBe(`data:image/png;base64,${PNG_B64}`);
    expect(res.isFallback).toBeFalsy();
  });

  it("Gemini Imagen: chama :predict com x-goog-api-key, aspecto 3:4 e lê bytesBase64Encoded", async () => {
    const calls = mockFetch(() => json({ predictions: [{ bytesBase64Encoded: PNG_B64, mimeType: "image/png" }] }));
    const res = await new GeminiImagenProvider({ provider: "gemini-imagen", apiKey: "g-test" }).generateBackground(base);
    expect(calls[0]!.url).toContain("/v1beta/models/imagen-3.0-generate-002:predict");
    expect((calls[0]!.init.headers as Record<string, string>)["x-goog-api-key"]).toBe("g-test");
    const body = JSON.parse(String(calls[0]!.init.body));
    expect(body.parameters.aspectRatio).toBe("3:4");
    expect(res.imageUrl).toBe(`data:image/png;base64,${PNG_B64}`);
    expect(res.isFallback).toBeFalsy();
  });

  it("sem chave: nenhuma chamada de rede e fallback SVG marcado", async () => {
    const calls = mockFetch(() => json({}));
    for (const p of [
      new OpenAIImageProvider({ provider: "openai-image" }),
      new OpenRouterImageProvider({ provider: "openrouter-image" }),
      new GeminiImagenProvider({ provider: "gemini-imagen" }),
    ]) {
      const res = await p.generateBackground(base);
      expect(res.isFallback).toBe(true);
      expect(res.imageUrl.startsWith("data:image/svg+xml")).toBe(true);
    }
    expect(calls).toHaveLength(0);
  });

  it("com chave mas offlineFallback explícito: não chama a rede", async () => {
    const calls = mockFetch(() => json({}));
    const res = await new OpenAIImageProvider({ provider: "openai-image", apiKey: "sk" }).generateBackground({
      ...base,
      offlineFallback: true,
    });
    expect(res.isFallback).toBe(true);
    expect(calls).toHaveLength(0);
  });

  it("erro HTTP, resposta inválida ou timeout: cai no fallback sem lançar exceção", async () => {
    mockFetch(() => json({ error: "boom" }, 500));
    const a = await new OpenAIImageProvider({ provider: "openai-image", apiKey: "sk" }).generateBackground(base);
    expect(a.isFallback).toBe(true);

    mockFetch(() => json({ choices: [{ message: {} }] }));
    const b = await new OpenRouterImageProvider({ provider: "openrouter-image", apiKey: "k" }).generateBackground(base);
    expect(b.isFallback).toBe(true);

    mockFetch(() => {
      throw new Error("network down");
    });
    const c = await new GeminiImagenProvider({ provider: "gemini-imagen", apiKey: "k" }).generateBackground(base);
    expect(c.isFallback).toBe(true);
  });
});

describe("buildImagePrompt (MATCH: fundo coerente com tema e marca)", () => {
  it("inclui tema, nicho, restrições visuais e proporção 4:5", () => {
    const p = buildImagePrompt({ theme: "Clareamento dental seguro", niche: "Odontologia", userPrompt: "consultório moderno" });
    expect(p).toContain("Clareamento dental seguro");
    expect(p).toContain("Odontologia");
    expect(p).toContain("consultório moderno");
    expect(p).toMatch(/no text/i);
    expect(p).toMatch(/4:5/);
  });
});
