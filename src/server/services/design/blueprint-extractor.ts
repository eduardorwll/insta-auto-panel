import { db } from "@/server/db/client";
import {
  companies,
  company_post_types,
  styleBlueprintSchema,
  type StyleBlueprint,
} from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getFormatSpec } from "@/shared/post-formats";

export interface ExtractBlueprintInput {
  companyId: string;
  name: string;
  formatId?: string;
  styleDescription?: string;
  referenceImageUrls?: string[];
  saveAsPostType?: boolean;
  isDefault?: boolean;
}

/**
 * Extrai e sintetiza um Mapa Detalhado de Estilo do Post (Style Blueprint)
 * validado estritamente via Zod, combinando os dados do Brand Kit da empresa,
 * o formato selecionado (Feed 4:5, Square 1:1 ou Story 9:16) e a análise de estilo/imagens de referência.
 */
export async function extractStyleBlueprint(
  input: ExtractBlueprintInput
): Promise<{
  blueprint: StyleBlueprint;
  postType?: {
    id: string;
    companyId: string;
    name: string;
    formatId: string;
    styleDescription: string | null;
    referenceImageUrls: string[];
    styleBlueprint: StyleBlueprint;
    isDefault: boolean;
  };
}> {
  const companyRows = await db
    .select()
    .from(companies)
    .where(eq(companies.id, input.companyId))
    .limit(1);

  const company = companyRows[0];
  const formatSpec = getFormatSpec(input.formatId || "carousel_feed");
  const descLower = (input.styleDescription || "").toLowerCase();

  const isBotanical =
    descLower.includes("botânic") ||
    descLower.includes("botanic") ||
    descLower.includes("folha") ||
    descLower.includes("nutri") ||
    descLower.includes("orgânic");
  const isTech =
    descLower.includes("tech") ||
    descLower.includes("neon") ||
    descLower.includes("dark");
  const isStory = formatSpec.id === "story_vertical";

  const rawBlueprint: StyleBlueprint = {
    visualMood: {
      backgroundStyle:
        input.styleDescription?.trim() ||
        `Fundo editorial suave (${company?.backgroundColor || "#F5ECE2"}) com iluminação difusa e contraste harmônico com ${company?.primaryColor || "#C58B6B"}`,
      lighting: isTech
        ? "Iluminação de estúdio cinematográfica de alto contraste"
        : "Luz natural difusa suave e acolhedora",
      ornamentStyle: isBotanical
        ? "botanical-line-art"
        : isTech
          ? "tech-grid"
          : "minimal-geometric",
    },
    layoutGrid: {
      negativeSpaceSide: isStory ? "top" : "left",
      negativeSpaceRatio: isStory ? 0.5 : 0.56,
      subjectFraming: isStory
        ? "full-bleed-gradient"
        : descLower.includes("split")
          ? "split-right"
          : "arch-right",
      headerMonogram: true,
    },
    typographyPairing: {
      headlineStyle:
        descLower.includes("sans") && !descLower.includes("serif")
          ? "sans-bold"
          : "serif-editorial",
      bodyStyle: "sans-clean",
      highlightKeywordsInBold: true,
    },
    slideArchetypes: {
      cover:
        "Monograma superior com assinatura da marca + Headline Serifada em caixa alta com palavra-chave em cor de destaque + Subtítulo conciso + Foto da especialista/produto à direita em moldura curva orgânica",
      middle:
        "Texto explicativo com palavras-chave estratégicas em negrito + Lista estruturada de 3 pontos com ícones/bullets alinhados verticalmente + Continuidade visual da especialista/marca à direita",
      closingCta:
        "Frase de síntese emocional + Chamada imperativa em destaque + Card inferior arredondado com localização/clínica, endereço e instrução de agendamento via WhatsApp, Direct ou link na bio + Barra de rodapé institucional",
    },
    immutableStylePrompt: [
      `Editorial ${formatSpec.aspectRatio} (${formatSpec.width}x${formatSpec.height}px) background for ${company?.niche || "specialist brand"}`,
      `matte ${company?.backgroundColor || "#F5ECE2"} surface with subtle ${company?.primaryColor || "#C58B6B"} and ${company?.secondaryColor || "#5C6843"} accents`,
      isStory
        ? "generous negative space on the top and middle safe zones for typography"
        : "generous negative space on the left 56% for editorial typography, organic curved arch framing on the right 44%",
      isBotanical
        ? "delicate minimalist botanical line-art accents"
        : "clean architectural minimalist lines",
      "soft natural daylight, studio photography quality, strictly NO text, NO letters, NO watermarks.",
    ].join(", "),
  };

  const validatedBlueprint = styleBlueprintSchema.parse(rawBlueprint);

  if (input.saveAsPostType !== false) {
    const id = `pt_${input.companyId}_${Date.now()}`;
    const refUrls = input.referenceImageUrls || [];

    if (input.isDefault) {
      await db
        .update(company_post_types)
        .set({ isDefault: 0 })
        .where(eq(company_post_types.companyId, input.companyId));
    }

    await db.insert(company_post_types).values({
      id,
      companyId: input.companyId,
      name: input.name || "Carrossel Editorial Padrão",
      formatId: formatSpec.id,
      styleDescription: input.styleDescription || null,
      referenceImageUrls: JSON.stringify(refUrls),
      styleBlueprintJson: JSON.stringify(validatedBlueprint),
      isDefault: input.isDefault ? 1 : 0,
    });

    return {
      blueprint: validatedBlueprint,
      postType: {
        id,
        companyId: input.companyId,
        name: input.name || "Carrossel Editorial Padrão",
        formatId: formatSpec.id,
        styleDescription: input.styleDescription || null,
        referenceImageUrls: refUrls,
        styleBlueprint: validatedBlueprint,
        isDefault: Boolean(input.isDefault),
      },
    };
  }

  return { blueprint: validatedBlueprint };
}

export async function listCompanyPostTypes(companyId: string) {
  const rows = await db
    .select()
    .from(company_post_types)
    .where(eq(company_post_types.companyId, companyId))
    .orderBy(desc(company_post_types.isDefault), desc(company_post_types.createdAt));

  return rows.map((r) => {
    let parsedRefs: string[] = [];
    try {
      parsedRefs = r.referenceImageUrls ? JSON.parse(r.referenceImageUrls) : [];
    } catch {}
    let parsedBlueprint: StyleBlueprint;
    try {
      parsedBlueprint = styleBlueprintSchema.parse(JSON.parse(r.styleBlueprintJson));
    } catch {
      parsedBlueprint = styleBlueprintSchema.parse({
        visualMood: {},
        layoutGrid: {},
        typographyPairing: {},
        slideArchetypes: {},
      });
    }
    return {
      id: r.id,
      companyId: r.companyId,
      name: r.name,
      formatId: r.formatId,
      styleDescription: r.styleDescription,
      referenceImageUrls: parsedRefs,
      styleBlueprint: parsedBlueprint,
      isDefault: Boolean(r.isDefault),
    };
  });
}

export async function resolvePostStyleBlueprint(params: {
  companyId?: string | null;
  postTypeId?: string | null;
}): Promise<StyleBlueprint | null> {
  if (!params.companyId) return null;

  if (params.postTypeId) {
    const specific = await db
      .select()
      .from(company_post_types)
      .where(
        and(
          eq(company_post_types.id, params.postTypeId),
          eq(company_post_types.companyId, params.companyId)
        )
      )
      .limit(1);
    if (specific[0]) {
      try {
        return styleBlueprintSchema.parse(JSON.parse(specific[0].styleBlueprintJson));
      } catch {}
    }
  }

  const allTypes = await listCompanyPostTypes(params.companyId);
  return allTypes[0]?.styleBlueprint ?? null;
}
