import { z } from "zod";
import type { AIProviderName } from "@/server/db/schema";

export interface CompanyProfile {
  name: string;
  instagramHandle: string;
  niche: string;
  toneOfVoice: string;
  whatsappNumber?: string | null;
  whatsappDefaultMessage?: string | null;
  websiteUrl?: string | null;
}

export interface AISettings {
  id: string;
  provider: AIProviderName;
  apiKey?: string | null;
  modelName: string;
  baseUrl?: string | null;
  temperature?: number | null;
  isActive?: number | null;
}

export const carouselSlideSchema = z.object({
  slideNumber: z.number().int().min(1).max(10),
  title: z.string().min(1),
  bodyText: z.string().min(1),
  ctaText: z.string().optional().nullable(),
});

export const carouselResponseSchema = z.object({
  slides: z.array(carouselSlideSchema).min(3).max(10),
  caption: z.string().min(1),
});

export type CarouselSlidesResponse = z.infer<typeof carouselResponseSchema>;

export interface GeneratePostParams {
  theme: string;
  category: string;
  slideCount: number; // 3 a 10 lâminas
  company: CompanyProfile;
}

export interface AIProvider {
  settings: AISettings;
  generate(params: GeneratePostParams): Promise<CarouselSlidesResponse>;
  testConnection(): Promise<{ success: boolean; message: string }>;
}

export abstract class BaseAIProvider implements AIProvider {
  constructor(public settings: AISettings) {}

  abstract generate(params: GeneratePostParams): Promise<CarouselSlidesResponse>;
  abstract testConnection(): Promise<{ success: boolean; message: string }>;

  /**
   * Constrói o prompt de engenharia adaptativo matematicamente calibrado para N slides
   */
  protected buildPrompt(params: GeneratePostParams): string {
    const { theme, category, slideCount, company } = params;

    return `Você é um copywriter de elite especializado em carrosséis virais de alto engajamento no Instagram.
Gere um roteiro completo de carrossel com EXATAMENTE ${slideCount} LÂMINAS e uma legenda magnética.

DADOS DA EMPRESA:
- Nome: ${company.name}
- Perfil: ${company.instagramHandle}
- Nicho: ${company.niche}
- Tom de Voz: ${company.toneOfVoice}
${company.whatsappNumber ? `- WhatsApp: ${company.whatsappNumber}` : ""}
${company.websiteUrl ? `- Site: ${company.websiteUrl}` : ""}

POST A SER CRIADO:
- Tema Central: "${theme}"
- Categoria Editorial: "${category}"
- Quantidade Obrigatória de Lâminas: ${slideCount}

ESTRUTURA DAS LÂMINAS (DE 1 A ${slideCount}):
- Lâmina 1 (Capa): Gancho provocativo (Hook) de alta retenção + subtítulo impactante.
- Lâminas 2 a ${slideCount - 1} (Desenvolvimento): Distribuição matemática e proporcional dos passos práticos, argumentos ou dados sobre "${theme}".
- Lâmina ${slideCount} (Final): Chamada para ação (CTA) persuasiva direcionando para conversa no WhatsApp ou salvamento.

SAÍDA OBRIGATÓRIA EM FORMATO JSON:
Responda EXCLUSIVAMENTE em formato JSON puro, sem marcações markdown ao redor, seguindo o schema:
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Título provocativo da capa",
      "bodyText": "Subtítulo de apoio",
      "ctaText": null
    },
    ...
    {
      "slideNumber": ${slideCount},
      "title": "Chamada final",
      "bodyText": "Texto de conclusão",
      "ctaText": "Texto do botão de ação"
    }
  ],
  "caption": "Legenda completa do post com quebras de linha, emojis, CTA final e 5 a 8 hashtags estratégicas."
}`;
  }

  /**
   * Adiciona links de conversão oficiais (wa.me) e arroba do Instagram à legenda
   */
  public formatCaptionWithConversion(rawCaption: string, company: CompanyProfile): string {
    let caption = rawCaption.trim();

    if (company.whatsappNumber) {
      const cleanPhone = company.whatsappNumber.replace(/\D/g, "");
      const encodedMsg = encodeURIComponent(
        company.whatsappDefaultMessage || `Olá! Vi o post no Instagram sobre ${company.name} e gostaria de mais informações.`
      );
      const waLink = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;

      if (!caption.includes("wa.me")) {
        caption += `\n\n📲 Converse conosco no WhatsApp: ${waLink}`;
      }
    }

    if (!caption.includes(company.instagramHandle)) {
      caption += `\n\nSiga ${company.instagramHandle} para mais conteúdos diários!`;
    }

    return caption;
  }
}
