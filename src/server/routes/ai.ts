import { db } from "../db/client";
import {
  ai_provider_settings,
  companies,
  posts,
  post_slides,
  aiProviderSettingsInsertSchema,
} from "../db/schema";
import { AIProviderFactory } from "../services/ai/factory";
import type { AISettings } from "../services/ai/provider";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

export async function handleAIRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. GET /api/ai/settings?companyId=...
  if (req.method === "GET" && pathname === "/api/ai/settings") {
    const companyId = url.searchParams.get("companyId");

    if (companyId) {
      const [companySetting] = await db
        .select()
        .from(ai_provider_settings)
        .where(eq(ai_provider_settings.id, companyId));

      if (companySetting) {
        return Response.json({ success: true, data: companySetting, isCustom: true });
      }
    }

    // Fallback: Global
    const [globalSetting] = await db
      .select()
      .from(ai_provider_settings)
      .where(eq(ai_provider_settings.id, "global"));

    if (globalSetting) {
      return Response.json({ success: true, data: globalSetting, isCustom: false });
    }

    return Response.json({
      success: true,
      data: {
        id: "global",
        provider: "gemini",
        modelName: "gemini-2.5-flash",
        temperature: 0.7,
        isActive: 1,
      },
      isCustom: false,
    });
  }

  // 2. PUT /api/ai/settings
  if (req.method === "PUT" && pathname === "/api/ai/settings") {
    try {
      const body = await req.json();
      const parsed = aiProviderSettingsInsertSchema.parse(body);

      const [existing] = await db
        .select()
        .from(ai_provider_settings)
        .where(eq(ai_provider_settings.id, parsed.id));

      if (existing) {
        await db.update(ai_provider_settings).set(parsed).where(eq(ai_provider_settings.id, parsed.id));
      } else {
        await db.insert(ai_provider_settings).values(parsed);
      }

      const [saved] = await db
        .select()
        .from(ai_provider_settings)
        .where(eq(ai_provider_settings.id, parsed.id));

      return Response.json({ success: true, data: saved });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return Response.json({ success: false, error: "Dados inválidos", details: err.format() }, { status: 400 });
      }
      const message = err instanceof Error ? err.message : "Erro interno";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  // 3. POST /api/ai/test-connection
  if (req.method === "POST" && pathname === "/api/ai/test-connection") {
    try {
      const body = await req.json();
      const providerInstance = AIProviderFactory.create(body as AISettings);
      const testResult = await providerInstance.testConnection();
      return Response.json(testResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Falha no teste";
      return Response.json({ success: false, message }, { status: 200 });
    }
  }

  // 4. POST /api/ai/generate-post
  if (req.method === "POST" && pathname === "/api/ai/generate-post") {
    try {
      const body = await req.json();
      const postId = body.postId;

      if (!postId) {
        return Response.json({ success: false, error: "postId é obrigatório" }, { status: 400 });
      }

      // Buscar post
      const [post] = await db.select().from(posts).where(eq(posts.id, postId));
      if (!post) {
        return Response.json({ success: false, error: "Post não encontrado" }, { status: 404 });
      }

      // Buscar empresa
      const [company] = await db.select().from(companies).where(eq(companies.id, post.companyId));
      if (!company) {
        return Response.json({ success: false, error: "Empresa não encontrada" }, { status: 404 });
      }

      // Resolver o provedor de IA ativo
      const provider = await AIProviderFactory.getForCompany(company.id);

      // Chamar geração agnóstica
      const generated = await provider.generate({
        theme: post.theme,
        category: post.category,
        slideCount: post.slideCount,
        company,
      });

      // Atualizar o post no SQLite
      await db
        .update(posts)
        .set({
          caption: generated.caption,
          status: "ai_generated",
        })
        .where(eq(posts.id, postId));

      // Atualizar ou criar lâminas
      const currentSlides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, postId))
        .orderBy(asc(post_slides.slideNumber));

      for (const genSlide of generated.slides) {
        const existingSlide = currentSlides.find((s) => s.slideNumber === genSlide.slideNumber);
        if (existingSlide) {
          await db
            .update(post_slides)
            .set({
              title: genSlide.title,
              bodyText: genSlide.bodyText,
              ctaText: genSlide.ctaText || null,
            })
            .where(eq(post_slides.id, existingSlide.id));
        } else {
          await db.insert(post_slides).values({
            id: `slide_${postId}_${genSlide.slideNumber}_${Date.now()}`,
            postId,
            slideNumber: genSlide.slideNumber,
            title: genSlide.title,
            bodyText: genSlide.bodyText,
            ctaText: genSlide.ctaText || null,
          });
        }
      }

      const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId));
      const slides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, postId))
        .orderBy(asc(post_slides.slideNumber));

      return Response.json({
        success: true,
        data: {
          ...updatedPost,
          selectedPhotoIds: updatedPost?.selectedPhotoIds ? JSON.parse(updatedPost.selectedPhotoIds) : [],
          slides,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro na geração";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  return null;
}
