import { describe, expect, it } from "bun:test";
import { AIProviderFactory } from "@/server/services/ai/factory";
import { MLStudioProvider } from "@/server/services/ai/mlstudio";
import { GeminiProvider } from "@/server/services/ai/gemini";
import { OpenAIProvider } from "@/server/services/ai/openai";
import { carouselResponseSchema } from "@/server/services/ai/provider";

describe("IA Generativa Agnóstica: Adapters e ML Studio API", () => {
  const dummyCompany = {
    name: "Clínica Dental Pro",
    instagramHandle: "@dentalpro",
    niche: "Odontologia",
    toneOfVoice: "Especialista e Acolhedor",
    whatsappNumber: "5511999991234",
    websiteUrl: "https://dentalpro.com",
  };

  it("AIProviderFactory deve instanciar MLStudioProvider para provedor 'mlstudio' ou 'lmstudio'", () => {
    const mlProvider = AIProviderFactory.create({
      id: "global",
      provider: "mlstudio",
      modelName: "meta-llama-3.1-8b-instruct",
      baseUrl: "http://localhost:1234/v1",
      temperature: 0.7,
      isActive: 1,
    });

    expect(mlProvider).toBeInstanceOf(MLStudioProvider);

    const lmProvider = AIProviderFactory.create({
      id: "global",
      provider: "lmstudio",
      modelName: "qwen2.5-7b-instruct",
      baseUrl: "http://localhost:1234/v1",
      temperature: 0.5,
      isActive: 1,
    });

    expect(lmProvider).toBeInstanceOf(MLStudioProvider);
  });

  it("AIProviderFactory deve instanciar Gemini e OpenAI corretamente", () => {
    const gemini = AIProviderFactory.create({
      id: "global",
      provider: "gemini",
      modelName: "gemini-2.5-flash",
      temperature: 0.7,
      isActive: 1,
    });
    expect(gemini).toBeInstanceOf(GeminiProvider);

    const openai = AIProviderFactory.create({
      id: "global",
      provider: "openai",
      modelName: "gpt-4o",
      temperature: 0.7,
      isActive: 1,
    });
    expect(openai).toBeInstanceOf(OpenAIProvider);
  });

  it("MLStudioProvider deve validar respostas com Zod garantindo estrutura exata para N lâminas", () => {
    // Validar parser Zod para 7 lâminas
    const mockOutput = {
      slides: [
        { slideNumber: 1, title: "Capa Impactante", bodyText: "Texto do gancho" },
        { slideNumber: 2, title: "Passo 1", bodyText: "Explicação 1" },
        { slideNumber: 3, title: "Passo 2", bodyText: "Explicação 2" },
        { slideNumber: 4, title: "Passo 3", bodyText: "Explicação 3" },
        { slideNumber: 5, title: "Passo 4", bodyText: "Explicação 4" },
        { slideNumber: 6, title: "Passo 5", bodyText: "Explicação 5" },
        { slideNumber: 7, title: "Conclusão", bodyText: "Resumo", ctaText: "Agende sua avaliação!" },
      ],
      caption: "Legenda persuasiva com chamada de ação. WhatsApp: https://wa.me/5511999991234 #dentes #saude",
    };

    const parsed = carouselResponseSchema.safeParse(mockOutput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.slides.length).toBe(7);
      expect(parsed.data.slides[0]?.slideNumber).toBe(1);
      expect(parsed.data.slides[6]?.ctaText).toBe("Agende sua avaliação!");
      expect(parsed.data.caption).toContain("wa.me/5511999991234");
    }
  });

  it("MLStudioProvider deve formatar link wa.me na legenda quando a empresa tiver WhatsApp", () => {
    const mlProvider = new MLStudioProvider({
      id: "global",
      provider: "mlstudio",
      modelName: "llama-3",
      baseUrl: "http://localhost:1234/v1",
      temperature: 0.7,
      isActive: 1,
    });

    const caption = mlProvider.formatCaptionWithConversion(
      "Dicas valiosas para seu negócio.",
      dummyCompany
    );

    expect(caption).toContain("https://wa.me/5511999991234");
    expect(caption).toContain(dummyCompany.instagramHandle);
  });
});
