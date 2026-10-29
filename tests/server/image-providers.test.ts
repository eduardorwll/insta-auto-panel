import { describe, expect, test } from "bun:test";
import {
  IMAGE_PROVIDERS,
  DESIGN_TEMPLATES,
  imageProviderSchema,
  designTemplateSchema,
} from "../../src/server/db/schema";
import {
  ImageProviderFactory,
  PollinationsImageProvider,
  FalFluxImageProvider,
  OpenRouterImageProvider,
  GeminiImagenProvider,
  OpenAIImageProvider,
  ComfyUILocalProvider,
} from "../../src/server/services/design/image-provider";
import {
  renderOpenDesignSlideSvg,
  renderSlidePngBuffer,
  type OpenDesignSlideFields,
} from "../../src/server/services/design/template-engine";

describe("M6-T1: Variable Image AI Adapter & OpenDesign 4:5 Template Engine", () => {
  test("deve validar todos os provedores de imagem de melhor custo-benefício no schema Zod", () => {
    expect(IMAGE_PROVIDERS).toContain("pollinations");
    expect(IMAGE_PROVIDERS).toContain("fal-flux");
    expect(IMAGE_PROVIDERS).toContain("openrouter-image");
    expect(IMAGE_PROVIDERS).toContain("gemini-imagen");
    expect(IMAGE_PROVIDERS).toContain("openai-image");
    expect(IMAGE_PROVIDERS).toContain("comfyui-local");

    for (const p of IMAGE_PROVIDERS) {
      expect(imageProviderSchema.safeParse(p).success).toBe(true);
    }
    expect(imageProviderSchema.safeParse("invalid-provider").success).toBe(false);
  });

  test("deve validar os 4 templates determinísticos 4:5 (OpenDesign Persuade Mode)", () => {
    expect(DESIGN_TEMPLATES).toEqual([
      "modern-bold",
      "editorial-clean",
      "dark-neon",
      "split-photo",
    ]);
    for (const tpl of DESIGN_TEMPLATES) {
      expect(designTemplateSchema.safeParse(tpl).success).toBe(true);
    }
  });

  test("ImageProviderFactory deve instanciar o adapter correto para cada provedor variável", () => {
    expect(ImageProviderFactory.create({ provider: "pollinations" })).toBeInstanceOf(
      PollinationsImageProvider
    );
    expect(
      ImageProviderFactory.create({ provider: "fal-flux", apiKey: "fal-test" })
    ).toBeInstanceOf(FalFluxImageProvider);
    expect(
      ImageProviderFactory.create({ provider: "openrouter-image", apiKey: "or-test" })
    ).toBeInstanceOf(OpenRouterImageProvider);
    expect(
      ImageProviderFactory.create({ provider: "gemini-imagen", apiKey: "gem-test" })
    ).toBeInstanceOf(GeminiImagenProvider);
    expect(
      ImageProviderFactory.create({ provider: "openai-image", apiKey: "oai-test" })
    ).toBeInstanceOf(OpenAIImageProvider);
    expect(
      ImageProviderFactory.create({
        provider: "comfyui-local",
        baseUrl: "http://localhost:8188",
      })
    ).toBeInstanceOf(ComfyUILocalProvider);
  });

  test("PollinationsImageProvider (Zero-Key $0.00) deve construir URL 4:5 determinística e gerar imagem fallback segura", async () => {
    const provider = new PollinationsImageProvider({ provider: "pollinations" });
    const res = await provider.generateBackground({
      prompt: "Consultório odontológico minimalista moderno com iluminação suave",
      width: 1080,
      height: 1350,
      brandPrimaryColor: "#6366F1",
      brandSecondaryColor: "#EC4899",
      offlineFallback: true,
    });

    expect(res.provider).toBe("pollinations");
    expect(res.costEstimateUsd).toBe(0);
    expect(res.imageUrl).toContain("data:image/svg+xml;base64,");
  });

  test("OpenDesignTemplateEngine deve renderizar SVG 1080x1350 (4:5) e PNG válido para os 4 templates", () => {
    const baseFields: OpenDesignSlideFields = {
      templateId: "modern-bold",
      slideNumber: 1,
      totalSlides: 5,
      headline: "5 Segredos do Clareamento Dental Seguro",
      bodyText: "Descubra como conquistar um sorriso iluminado sem sensibilidade com protocolo clínico guiado.",
      ctaText: "Agende sua avaliação pelo link da bio",
      brandKit: {
        companyName: "Clínica Sorriso Prime",
        instagramHandle: "@sorrisoprime",
        primaryColor: "#6366F1",
        secondaryColor: "#EC4899",
        backgroundColor: "#0F172A",
        accentColor: "#10B981",
      },
    };

    for (const templateId of DESIGN_TEMPLATES) {
      const svg = renderOpenDesignSlideSvg({ ...baseFields, templateId });
      expect(svg).toContain('width="1080"');
      expect(svg).toContain('height="1350"');
      expect(svg).toContain("5 Segredos do Clareamento");
      expect(svg).toContain("@sorrisoprime");
      expect(svg).toContain("01 / 05");
    }

    const pngBuffer = renderSlidePngBuffer(baseFields);
    // Verifica assinatura mágica PNG (\x89PNG\r\n\x1a\n)
    expect(pngBuffer[0]).toBe(0x89);
    expect(pngBuffer[1]).toBe(0x50);
    expect(pngBuffer[2]).toBe(0x4e);
    expect(pngBuffer[3]).toBe(0x47);
    expect(pngBuffer.byteLength).toBeGreaterThan(256);
  });
});
