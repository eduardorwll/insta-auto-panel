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

export interface TenantPhotoSummary {
  id: string;
  originalName: string;
  category: string;
  tags?: string[] | null;
}

export const carouselSlideSchema = z.object({
  slideNumber: z.number().int().min(1).max(10),
  title: z.string().min(1),
  bodyText: z.string().min(1),
  ctaText: z.string().optional().nullable(),
  suggestedPhotoId: z.string().optional().nullable(),
});

export const carouselResponseSchema = z.object({
  suggestedTheme: z.string().optional(),
  suggestedCategory: z.string().optional(),
  suggestedTime: z.string().optional(),
  slides: z.array(carouselSlideSchema).min(3).max(10),
  caption: z.string().min(1),
});

export type CarouselSlidesResponse = z.infer<typeof carouselResponseSchema>;

export interface GeneratePostParams {
  theme?: string;
  category?: string;
  slideCount?: number; // 3 a 10 lâminas (default 5)
  company: CompanyProfile;
  photos?: TenantPhotoSummary[];
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
   * Constrói o prompt de engenharia adaptativo calibrado para N slides, acervo do tenant e horários
   */
  protected buildPrompt(params: GeneratePostParams): string {
    const { company, photos } = params;
    const targetSlideCount = params.slideCount || 5;
    const targetCategory = params.category || "Dica Prática";
    const targetTheme = params.theme?.trim() ? params.theme : `Estratégia prática para ${company.niche}`;

    const photosCatalog =
      photos && photos.length > 0
        ? photos
            .map(
              (p) =>
                `- ID "${p.id}": "${p.originalName}" (Categoria: ${p.category}${
                  p.tags && p.tags.length ? `, Tags: ${p.tags.join(", ")}` : ""
                })`
            )
            .join("\n")
        : "Nenhuma foto previamente cadastrada. Deixe suggestedPhotoId como null.";

    return `Você é um copywriter e estrategista de elite especializado em carrosséis virais de alto engajamento no Instagram.
Gere um roteiro completo de carrossel com EXATAMENTE ${targetSlideCount} LÂMINAS, sugestão de melhor horário de publicação e uma legenda magnética.

DADOS DA EMPRESA (TENANT):
- Nome: ${company.name}
- Perfil: ${company.instagramHandle}
- Nicho: ${company.niche}
- Tom de Voz: ${company.toneOfVoice}
${company.whatsappNumber ? `- WhatsApp de Atendimento: ${company.whatsappNumber}` : ""}
${company.whatsappDefaultMessage ? `- Assunto / Intenção de Contato: "${company.whatsappDefaultMessage}"` : ""}
${company.websiteUrl ? `- Site / Canal: ${company.websiteUrl}` : ""}

ACERVO DE FOTOS DA EMPRESA (SEPARAÇÃO ESTRITA — USE APENAS ESSES IDs):
${photosCatalog}

POST A SER CRIADO:
- Tema Central: "${targetTheme}"
- Categoria Editorial: "${targetCategory}"
- Quantidade Obrigatória de Lâminas: ${targetSlideCount}

DIRETRIZES MANDATÓRIAS DE CONVERSÃO & LINKS (INSTAGRAM):
- ATENÇÃO: Links no corpo da legenda e nas imagens do Instagram NÃO são clicáveis!
- NUNCA insira URLs cruas (como "wa.me/...", "http://...", "https://...") na legenda nem nas lâminas do carrossel.
- As informações de canais de contato (WhatsApp, Site, etc.) devem ser usadas EXCLUSIVAMENTE para orientar o tom do Call-to-Action (CTA).
- O CTA deve direcionar o seguidor para:
  1. Enviar uma mensagem pelo Direct;
  2. Ou acessar os canais / WhatsApp através do link na bio do perfil (${company.instagramHandle}).
- Exemplo de CTA: "Quer agendar uma consulta ou tirar dúvidas? Envie um direct ou acesse os canais no link da bio!"

ESTRUTURA DAS LÂMINAS (DE 1 A ${targetSlideCount}):
- Lâmina 1 (Capa): Gancho provocativo (Hook) de alta retenção + subtítulo impactante. Se houver foto adequada do acervo, indique seu ID em "suggestedPhotoId".
- Lâminas 2 a ${targetSlideCount - 1} (Desenvolvimento): Distribuição matemática e proporcional dos passos práticos, argumentos ou dados sobre o tema.
- Lâmina ${targetSlideCount} (Final): Chamada para ação (CTA) persuasiva direcionando para enviar mensagem no Direct ou acessar o link na bio (sem URLs cruas).

HORÁRIO SUGERIDO DE PUBLICAÇÃO:
Indique o melhor horário em "suggestedTime" (formato "HH:MM", ex: "09:00", "12:30", "18:30", "20:00") baseado nos melhores padrões de engajamento do nicho ${company.niche}.

SAÍDA OBRIGATÓRIA EM FORMATO JSON:
Responda EXCLUSIVAMENTE em formato JSON puro, sem blocos markdown ao redor:
{
  "suggestedTheme": "${targetTheme}",
  "suggestedCategory": "${targetCategory}",
  "suggestedTime": "18:30",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Título provocativo da capa",
      "bodyText": "Subtítulo de apoio",
      "ctaText": null,
      "suggestedPhotoId": null
    },
    ...
    {
      "slideNumber": ${targetSlideCount},
      "title": "Chamada final",
      "bodyText": "Texto de conclusão",
      "ctaText": "Texto do botão de ação (ex: 'Fale Conosco no Direct')",
      "suggestedPhotoId": null
    }
  ],
  "caption": "Legenda completa do post com quebras de linha, emojis, CTA contextual convidando para o direct ou link na bio (SEM URLs cruas) e 5 a 8 hashtags estratégicas."
}`;
  }

  /**
   * Formata e enriquece a legenda com CTA contextual para o Instagram e arroba oficial.
   * Regra Mandatória: No Instagram, links em legendas NÃO são clicáveis. URLs cruas
   * (como https://wa.me/... ou https://...) poluem a experiência visual. Por isso,
   * os dados de WhatsApp/Site servem exclusivamente para subsidiar a redação de CTAs
   * orientando para o Direct ou para o canal no link da Bio.
   */
  public formatCaptionWithConversion(rawCaption: string, company: CompanyProfile): string {
    let caption = rawCaption.trim();

    // 1. Sanitização defensiva: remove URLs cruas (wa.me, http://, https://) que possam ter sido geradas
    caption = caption
      .replace(/https?:\/\/[^\s]+/gi, "")
      .replace(/wa\.me\/[^\s]+/gi, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();

    // 2. Se a legenda ainda não contiver indicação de conversão para direct ou link na bio
    const hasCta = /direct|link na bio|link da bio|link em nossa bio/i.test(caption);
    if (!hasCta) {
      if (company.whatsappNumber || company.websiteUrl) {
        caption += `\n\n📲 Para conversar conosco ou saber mais, envie uma mensagem pelo Direct ou acesse os canais no link da nossa bio!`;
      } else {
        caption += `\n\n💬 Gostou do conteúdo? Envie um Direct para saber mais!`;
      }
    }

    // 3. Garantir presença do perfil oficial do Instagram
    if (!caption.includes(company.instagramHandle)) {
      caption += `\n\nSiga ${company.instagramHandle} para mais conteúdos diários!`;
    }

    return caption;
  }
}
