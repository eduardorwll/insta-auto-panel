import { describe, expect, it } from "bun:test";
import { AIProviderFactory } from "@/server/services/ai/factory";
import { MLStudioProvider } from "@/server/services/ai/mlstudio";
import { GeminiProvider } from "@/server/services/ai/gemini";
import { OpenAIProvider } from "@/server/services/ai/openai";
import { ClaudeProvider } from "@/server/services/ai/claude";
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

    const claude = AIProviderFactory.create({
      id: "global",
      provider: "claude",
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.7,
      isActive: 1,
    });
    expect(claude).toBeInstanceOf(ClaudeProvider);
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
      caption: "Legenda persuasiva com chamada de ação para direct ou link na bio. #dentes #saude",
    };

    const parsed = carouselResponseSchema.safeParse(mockOutput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.slides.length).toBe(7);
      expect(parsed.data.slides[0]?.slideNumber).toBe(1);
      expect(parsed.data.slides[6]?.ctaText).toBe("Agende sua avaliação!");
      expect(parsed.data.caption).toContain("direct ou link na bio");
    }
  });

  it("MLStudioProvider deve formatar CTA contextual para direct/link na bio SEM urls cruas ou wa.me", () => {
    const mlProvider = new MLStudioProvider({
      id: "global",
      provider: "mlstudio",
      modelName: "llama-3",
      baseUrl: "http://localhost:1234/v1",
      temperature: 0.7,
      isActive: 1,
    });

    const caption = mlProvider.formatCaptionWithConversion(
      "Dicas valiosas para seu negócio. Acesse https://wa.me/5511999991234 para falar conosco.",
      dummyCompany
    );

    // No Instagram, links na legenda não são clicáveis
    expect(caption).not.toContain("https://wa.me/");
    expect(caption).not.toContain("wa.me/");
    expect(caption).toMatch(/direct|link na bio/i);
    expect(caption).toContain(dummyCompany.instagramHandle);
  });

  it("deve validar o schema Zod e suporte ao framework MATCH (Instagram SEO 2026: altText, suggestedImagePrompt e keywordCluster)", () => {
    const seoOutput = {
      suggestedTheme: "Clareamento Dental Seguro em Consultório",
      suggestedCategory: "Dica Prática",
      suggestedTime: "18:30",
      altText: "Dentista especialista realizando procedimento de clareamento dental seguro em paciente na clínica",
      suggestedImagePrompt: "Modern dental clinic treatment room, soft natural lighting, pristine aesthetic, professional atmosphere, no text, 4:5 vertical",
      keywordCluster: ["clareamento dental seguro", "clareamento em consultorio", "estetica dental", "dentes brancos"],
      slides: [
        { slideNumber: 1, title: "Clareamento Dental Seguro: O Que Saber", bodyText: "Tire suas dúvidas antes de começar" },
        { slideNumber: 2, title: "Como Funciona o Gel Clareador", bodyText: "Ação nas camadas do esmalte sem agredir a gengiva" },
        { slideNumber: 3, title: "Salve para Consultar e Chame no Direct", bodyText: "Tire dúvidas sobre sensibilidade pelo direct ou acesse o link na bio", ctaText: "Fale no Direct" },
      ],
      caption: "Clareamento dental seguro em consultório: confira as principais recomendações para manter o sorriso radiante e sem sensibilidade. Salve este post para consultar quando precisar! Para saber mais, envie um direct ou acesse os canais no link da nossa bio! #clareamentodental #odontologiaestetica #saudebucal",
    };

    const parsed = carouselResponseSchema.safeParse(seoOutput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.altText).toBeDefined();
      expect(parsed.data.altText).toContain("clareamento dental seguro");
      expect(parsed.data.suggestedImagePrompt).toBeDefined();
      expect(parsed.data.keywordCluster?.length).toBe(4);
      expect(parsed.data.slides.length).toBe(3);
    }
  });
});
