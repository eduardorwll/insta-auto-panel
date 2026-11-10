import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import { companies, weekly_schedules, posts, post_slides } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { renderOpenDesignSlideSvg } from "@/server/services/design/template-engine";
import { buildImagePrompt } from "@/server/services/design/image-provider";

describe("Marco M11: Style Blueprints por Empresa (Visão IA) & Motor Multi-Camadas", () => {
  const companyId = "empresa_m11_blueprint";
  const scheduleId = "sched_m11_20261109";
  const postId = "post_m11_carrossel";
  let createdPostTypeId = "";

  beforeAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
    await db.insert(companies).values({
      id: companyId,
      name: "Etiene Rewell | Nutricionista",
      instagramHandle: "@etienerewell",
      niche: "Nutrição Clínica e Emagrecimento",
      toneOfVoice: "Acolhedor, elegante e científico",
      primaryColor: "#C58B6B",
      secondaryColor: "#5C6843",
      backgroundColor: "#F5ECE2",
      accentColor: "#5C6843",
      whatsappNumber: "5511988887777",
      websiteUrl: "Clínica Prontocor — Rua Armando Sica, 225",
      whatsappDefaultMessage: "Agendamentos via WhatsApp, Direct ou link na bio.",
      seoDisplayName: "Etiene Rewell | Nutricionista",
      targetKeywords: JSON.stringify(["nutricionista clinica", "habitos saudaveis"]),
    });

    await db.insert(weekly_schedules).values({
      id: scheduleId,
      companyId,
      weekStartDate: "2026-11-09",
    });

    await db.insert(posts).values({
      id: postId,
      scheduleId,
      companyId,
      dayOfWeek: "segunda",
      theme: "Sua saúde não precisa esperar novembro",
      category: "Conscientização",
      slideCount: 3,
      status: "draft",
    });

    await db.insert(post_slides).values([
      {
        id: `${postId}_s1`,
        postId,
        slideNumber: 1,
        title: "SUA SAÚDE NÃO PRECISA ESPERAR NOVEMBRO.",
        bodyText: "Você não precisa esperar a próxima segunda-feira para começar.",
        ctaText: null,
      },
      {
        id: `${postId}_s2`,
        postId,
        slideNumber: 2,
        title: "Pequenas escolhas feitas hoje podem transformar sua relação com a alimentação",
        bodyText: "🥗 Mais equilíbrio.\n💚 Mais saúde.\n✨ Mais constância, menos culpa.",
        ctaText: null,
      },
      {
        id: `${postId}_s3`,
        postId,
        slideNumber: 3,
        title: "O segredo não é buscar a perfeição, mas construir hábitos que façam sentido para a sua vida.",
        bodyText: "Comece hoje. Seu futuro agradece!",
        ctaText: "Clínica Prontocor — Rua Armando Sica, 225 | Agendamentos via WhatsApp, direct ou link na bio.",
      },
    ]);
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
  });

  it("M11-T1: POST /api/ai/extract-post-blueprint deve extrair um Style Blueprint detalhado e salvar em company_post_types", async () => {
    const extractRes = await server.fetch(
      new Request("http://localhost/api/ai/extract-post-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          name: "Carrossel Editorial Especialista (4:5)",
          formatId: "carousel_feed",
          styleDescription:
            "Fundo areia suave matte, tipografia serifada elegante combinada com sans-serif limpa, foto da especialista à direita com moldura curva orgânica, ornamentos botânicos line-art, lâminas intermediárias com bullets e ícones, e lâmina final com card estruturado de endereço e contato.",
          referenceImageUrls: ["/uploads/ref-slide-1.jpg", "/uploads/ref-slide-2.jpg", "/uploads/ref-slide-3.jpg"],
          saveAsPostType: true,
          isDefault: true,
        }),
      })
    );

    expect(extractRes.status).toBe(200);
    const extractJson = await extractRes.json();
    expect(extractJson.success).toBe(true);
    expect(extractJson.data.blueprint).toBeDefined();
    expect(extractJson.data.blueprint.visualMood).toBeDefined();
    expect(extractJson.data.blueprint.layoutGrid.negativeSpaceSide).toBe("left");
    expect(extractJson.data.blueprint.slideArchetypes.cover).toBeDefined();
    expect(extractJson.data.blueprint.slideArchetypes.middle).toBeDefined();
    expect(extractJson.data.blueprint.slideArchetypes.closingCta).toBeDefined();
    expect(extractJson.data.blueprint.immutableStylePrompt).toContain("negative space");
    expect(extractJson.data.postType?.id).toBeDefined();
    createdPostTypeId = extractJson.data.postType.id;

    // Listar tipos de post da empresa
    const listRes = await server.fetch(
      new Request(`http://localhost/api/companies/${companyId}/post-types`)
    );
    expect(listRes.status).toBe(200);
    const listJson = await listRes.json();
    expect(listJson.success).toBe(true);
    expect(listJson.data.length).toBeGreaterThanOrEqual(1);
    expect(listJson.data[0].name).toBe("Carrossel Editorial Especialista (4:5)");
  });

  it("M11-T2: Compilador de Prompt de 3 Camadas e Renderizador Multi-Camadas devem aplicar o Style Blueprint nos 3 arquétipos de lâmina", async () => {
    // vincular o postTypeId ao post
    await db
      .update(posts)
      .set({ postTypeId: createdPostTypeId })
      .where(eq(posts.id, postId));

    // Verificar se o Preview do Prompt (Dry-Run) injeta o Style Blueprint no prompt de texto e de imagem
    const previewRes = await server.fetch(
      new Request("http://localhost/api/design/preview-payloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          companyId,
          slideNumber: 1,
          templateId: "editorial-clean",
        }),
      })
    );
    expect(previewRes.status).toBe(200);
    const previewJson = await previewRes.json();
    expect(previewJson.data.textPromptPreview).toContain("MAPA DE ESTILO DO TIPO DE POST");
    expect(previewJson.data.imageApiPayload.compiledPrompt).toContain("negative space");

    // Verificar renderização SVG multi-camadas para Capa (Slide 1), Meio com Bullets (Slide 2) e Final com Card de Contato (Slide 3)
    const svgCover = renderOpenDesignSlideSvg({
      templateId: "editorial-clean",
      formatId: "carousel_feed",
      slideNumber: 1,
      totalSlides: 3,
      headline: "SUA SAÚDE NÃO PRECISA ESPERAR NOVEMBRO.",
      bodyText: "Você não precisa esperar a próxima segunda-feira para começar.",
      brandName: "Etiene Rewell | Nutricionista",
      instagramHandle: "@etienerewell",
      primaryColor: "#C58B6B",
      secondaryColor: "#5C6843",
      backgroundColor: "#F5ECE2",
      accentColor: "#5C6843",
      fontFamily: "Cormorant Garamond",
      subjectPhotoUrl: "https://example.com/specialist.jpg",
      styleBlueprint: previewJson.data.styleBlueprint,
    });
    expect(svgCover).toContain('viewBox="0 0 1080 1350"');
    expect(svgCover).toContain("SUA SAÚDE");
    expect(svgCover).toContain("https://example.com/specialist.jpg");

    const svgMiddle = renderOpenDesignSlideSvg({
      templateId: "editorial-clean",
      formatId: "carousel_feed",
      slideNumber: 2,
      totalSlides: 3,
      headline: "Pequenas escolhas feitas hoje podem transformar sua relação com a alimentação",
      bodyText: "🥗 Mais equilíbrio.\n💚 Mais saúde.\n✨ Mais constância, menos culpa.",
      brandName: "Etiene Rewell | Nutricionista",
      instagramHandle: "@etienerewell",
      primaryColor: "#C58B6B",
      secondaryColor: "#5C6843",
      backgroundColor: "#F5ECE2",
      accentColor: "#5C6843",
      fontFamily: "Cormorant Garamond",
      subjectPhotoUrl: "https://example.com/specialist.jpg",
      styleBlueprint: previewJson.data.styleBlueprint,
    });
    expect(svgMiddle).toContain("Mais equilíbrio.");
    expect(svgMiddle).toContain("Mais constância, menos culpa.");

    const svgClosing = renderOpenDesignSlideSvg({
      templateId: "editorial-clean",
      formatId: "carousel_feed",
      slideNumber: 3,
      totalSlides: 3,
      headline: "O segredo não é buscar a perfeição, mas construir hábitos que façam sentido para a sua vida.",
      bodyText: "Comece hoje. Seu futuro agradece!",
      ctaText: "Clínica Prontocor — Rua Armando Sica, 225 | Agendamentos via WhatsApp, direct ou link na bio.",
      brandName: "Etiene Rewell | Nutricionista",
      instagramHandle: "@etienerewell",
      primaryColor: "#C58B6B",
      secondaryColor: "#5C6843",
      backgroundColor: "#F5ECE2",
      accentColor: "#5C6843",
      fontFamily: "Cormorant Garamond",
      subjectPhotoUrl: "https://example.com/specialist.jpg",
      styleBlueprint: previewJson.data.styleBlueprint,
    });
    expect(svgClosing).toContain("Clínica Prontocor");
    expect(svgClosing).toContain("Agendamentos via WhatsApp");
  });
});
