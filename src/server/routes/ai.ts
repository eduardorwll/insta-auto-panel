import { db } from "../db/client";
import {
  ai_provider_settings,
  companies,
  posts,
  post_slides,
  photo_assets,
  aiProviderSettingsInsertSchema,
} from "../db/schema";
import { AIProviderFactory } from "../services/ai/factory";
import type { AISettings } from "../services/ai/provider";
import { auditPost } from "../services/ai/seo-quality";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

export async function handleAIRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. GET /api/ai/settings?companyId=...
  if (req.method === "GET" && pathname === "/api/ai/settings") {
    const companyId = url.searchParams.get("companyId");

    const sanitizeSetting = (setting: typeof globalSetting) => {
      if (!setting) return null;
      const { apiKey, ...safe } = setting;
      return {
        ...safe,
        apiKey: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : null,
        hasApiKey: Boolean(apiKey),
      };
    };

    if (companyId) {
      const [companySetting] = await db
        .select()
        .from(ai_provider_settings)
        .where(eq(ai_provider_settings.id, companyId));

      if (companySetting) {
        return Response.json({ success: true, data: sanitizeSetting(companySetting), isCustom: true });
      }
    }

    // Fallback: Global
    const [globalSetting] = await db
      .select()
      .from(ai_provider_settings)
      .where(eq(ai_provider_settings.id, "global"));

    if (globalSetting) {
      return Response.json({ success: true, data: sanitizeSetting(globalSetting), isCustom: false });
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
        const updateData = { ...parsed };
        if (parsed.apiKey?.includes("...") && existing.apiKey) {
          updateData.apiKey = existing.apiKey;
        }
        await db.update(ai_provider_settings).set(updateData).where(eq(ai_provider_settings.id, parsed.id));
      } else {
        await db.insert(ai_provider_settings).values(parsed);
      }

      const [saved] = await db
        .select()
        .from(ai_provider_settings)
        .where(eq(ai_provider_settings.id, parsed.id));

      if (!saved) {
        return Response.json({ success: false, error: "Erro ao recuperar configuração salva" }, { status: 500 });
      }

      const { apiKey, ...safeSaved } = saved;
      return Response.json({
        success: true,
        data: {
          ...safeSaved,
          apiKey: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : null,
          hasApiKey: Boolean(apiKey),
        },
      });
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

      // Buscar acervo de fotos EXCLUSIVO da empresa ativa (Isolamento Estrito de Tenants)
      const companyPhotos = await db
        .select()
        .from(photo_assets)
        .where(eq(photo_assets.companyId, company.id));

      const photosPayload = companyPhotos.map((p) => {
        let parsedTags: string[] = [];
        if (p.tags) {
          try {
            parsedTags = JSON.parse(p.tags);
          } catch {}
        }
        return {
          id: p.id,
          originalName: p.originalName,
          category: p.category,
          tags: parsedTags,
        };
      });

      // Resolver o provedor de IA ativo
      const provider = await AIProviderFactory.getForCompany(company.id);

      const targetTheme = body.theme || post.theme;
      const targetCategory = body.category || post.category;
      const targetSlideCount = body.slideCount || post.slideCount;

      // Keywords principais já usadas em outros posts da mesma semana (diversidade de busca)
      const siblingPosts = await db.select().from(posts).where(eq(posts.scheduleId, post.scheduleId));
      const usedKeywords = siblingPosts
        .filter((p) => p.id !== postId && p.keywordCluster)
        .flatMap((p) => {
          try {
            const parsed: unknown = JSON.parse(p.keywordCluster as string);
            return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
          } catch {
            return [];
          }
        });

      // Chamar geração agnóstica calibrada com dados do tenant e fotos
      const generated = await provider.generate({
        usedKeywords,
        theme: targetTheme,
        category: targetCategory,
        slideCount: targetSlideCount,
        company,
        photos: photosPayload,
      });

      // Atualizar o post no SQLite com sugestões da IA
      const postUpdates: Record<string, unknown> = {
        caption: generated.caption,
        status: "ai_generated",
      };

      if (generated.altText) {
        postUpdates.altText = generated.altText;
      }
      if (generated.keywordCluster?.length) {
        postUpdates.keywordCluster = JSON.stringify(generated.keywordCluster);
      }
      if (generated.suggestedTime) {
        postUpdates.scheduledTime = generated.suggestedTime;
      }
      if (generated.suggestedTheme && (!post.theme || post.theme === "Tema a definir")) {
        postUpdates.theme = generated.suggestedTheme;
      }
      if (generated.suggestedCategory && (!post.category || post.category === "Dica Prática")) {
        postUpdates.category = generated.suggestedCategory;
      }

      await db
        .update(posts)
        .set(postUpdates)
        .where(eq(posts.id, postId));

      // Atualizar ou criar lâminas
      const currentSlides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, postId))
        .orderBy(asc(post_slides.slideNumber));

      const validPhotoIds = new Set(companyPhotos.map((p) => p.id));

      for (const genSlide of generated.slides) {
        const assignedPhoto = genSlide.suggestedPhotoId && validPhotoIds.has(genSlide.suggestedPhotoId)
          ? genSlide.suggestedPhotoId
          : null;

        const slideImagePrompt =
          genSlide.slideNumber === 1 && generated.suggestedImagePrompt
            ? generated.suggestedImagePrompt
            : undefined;

        const existingSlide = currentSlides.find((s) => s.slideNumber === genSlide.slideNumber);
        if (existingSlide) {
          await db
            .update(post_slides)
            .set({
              title: genSlide.title,
              bodyText: genSlide.bodyText,
              ctaText: genSlide.ctaText || null,
              ...(assignedPhoto ? { assignedPhotoId: assignedPhoto } : {}),
              ...(slideImagePrompt ? { imagePrompt: slideImagePrompt } : {}),
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
            assignedPhotoId: assignedPhoto,
            imagePrompt: slideImagePrompt || null,
          });
        }
      }

      const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId));
      const slides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, postId))
        .orderBy(asc(post_slides.slideNumber));

      const seoWarnings = auditPost({
        caption: generated.caption,
        altText: generated.altText,
        keywordCluster: generated.keywordCluster,
      });

      return Response.json({
        success: true,
        data: {
          ...updatedPost,
          selectedPhotoIds: updatedPost?.selectedPhotoIds ? JSON.parse(updatedPost.selectedPhotoIds) : [],
          slides,
          suggestedImagePrompt: generated.suggestedImagePrompt ?? null,
          keywordCluster: generated.keywordCluster ?? [],
          seoWarnings,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro na geração";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  return null;
}
