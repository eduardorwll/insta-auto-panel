import { db } from "../db/client";
import {
  companies,
  company_settings,
  posts,
  post_slides,
  designTemplateSchema,
  imageProviderSchema,
  type DesignTemplateId,
} from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { ImageProviderFactory, buildImagePrompt } from "../services/design/image-provider";
import {
  renderOpenDesignSlideSvg,
  renderSlidePngBuffer,
  type OpenDesignSlideFields,
} from "../services/design/template-engine";
import { enqueuePostForAutoSocial } from "../services/export/autosocial";
import { AIProviderFactory } from "../services/ai/factory";
import { CURATED_OPENROUTER_IMAGE_MODELS } from "../services/ai/openrouter-client";
import {
  enforceApiQuotaAndRateLimit,
  recordApiUsage,
} from "../services/ai/quota-guard";
import { resolvePostStyleBlueprint } from "../services/design/blueprint-extractor";
import { getFormatSpec, type PostFormatId } from "../../shared/post-formats";
import fs from "node:fs/promises";
import path from "node:path";

const RENDERS_DIR = path.resolve(import.meta.dirname, "../../../data/renders");

export async function handleDesignRoutes(
  req: Request,
  url: URL
): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/design")) return null;

  // 1. POST /api/design/generate-background
  if (url.pathname === "/api/design/generate-background" && req.method === "POST") {
    try {
      const body = (await req.json()) as {
        provider?: string;
        prompt?: string;
        theme?: string;
        companyId?: string;
        apiKey?: string;
        baseUrl?: string;
        modelName?: string;
        brandPrimaryColor?: string;
        brandSecondaryColor?: string;
        offlineFallback?: boolean;
      };

      const parsedProvider = imageProviderSchema.safeParse(
        body.provider || "pollinations"
      );
      const providerName = parsedProvider.success
        ? parsedProvider.data
        : "pollinations";

      // A chave nunca trafega pelo navegador: é lida server-side das configurações da empresa
      // (Settings Hub), e só vale para o provedor que a empresa configurou como preferido.
      let apiKey = body.apiKey || null;
      let baseUrl = body.baseUrl || null;
      let niche: string | null = null;
      if (body.companyId) {
        const [settings] = await db
          .select()
          .from(company_settings)
          .where(eq(company_settings.companyId, body.companyId));
        if (settings && settings.preferredImageProvider === providerName) {
          apiKey = apiKey || settings.imageProviderApiKey || null;
          baseUrl = baseUrl || settings.imageProviderBaseUrl || null;
        }
        const [tenant] = await db
          .select()
          .from(companies)
          .where(eq(companies.id, body.companyId));
        niche = tenant?.niche ?? null;
      }

      const adapter = ImageProviderFactory.create({
        provider: providerName,
        apiKey,
        baseUrl,
        modelName: body.modelName || null,
      });

      const primary = body.brandPrimaryColor || "#0D9488";
      const quotaCompanyId = body.companyId || "global";
      let forceSvgByQuota = false;

      if (providerName !== "pollinations" && providerName !== "comfyui-local") {
        const quotaCheck = await enforceApiQuotaAndRateLimit(quotaCompanyId, "image_generation");
        if (!quotaCheck.allowed) {
          if (quotaCheck.fallbackToSvg) {
            forceSvgByQuota = true;
          } else {
            return Response.json(
              { error: quotaCheck.reason || "Limite de geração de imagem atingido." },
              { status: 429 }
            );
          }
        }
      }

      const result = await adapter.generateBackground({
        prompt: buildImagePrompt({
          theme: body.theme,
          niche,
          userPrompt: body.prompt || "Editorial background 4:5",
          brandPrimaryColor: primary,
        }),
        width: 1080,
        height: 1350,
        brandPrimaryColor: primary,
        brandSecondaryColor: body.brandSecondaryColor || "#0284C7",
        // Pollinations/ComfyUI não usam chave (mantém modo offline por padrão); provedores
        // pagos chamam a API real assim que existir uma chave configurada.
        offlineFallback:
          forceSvgByQuota ||
          (body.offlineFallback ??
            (providerName === "pollinations" || providerName === "comfyui-local" || !apiKey)),
      });

      if (!result.isFallback && result.costEstimateUsd > 0) {
        await recordApiUsage({
          companyId: quotaCompanyId,
          operationType: "image_generation",
          provider: result.provider,
          modelName: result.model,
          estimatedCostUsd: result.costEstimateUsd,
        });
      }

      return Response.json({ success: true, ...result });
    } catch (err) {
      return Response.json(
        {
          error: "Falha ao gerar background com IA",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }
  }

  // 2. POST /api/design/render-post
  if (url.pathname === "/api/design/render-post" && req.method === "POST") {
    try {
      const body = (await req.json()) as {
        postId?: string;
        templateId?: string;
        backgroundImageUrl?: string | null;
        imagePrompt?: string | null;
        enqueueImmediately?: boolean;
        clientSlidePngs?: Record<number, string>;
      };

      if (!body.postId) {
        return Response.json({ error: "postId é obrigatório." }, { status: 400 });
      }

      const parsedTemplate = designTemplateSchema.safeParse(
        body.templateId || "modern-bold"
      );
      const templateId: DesignTemplateId = parsedTemplate.success
        ? parsedTemplate.data
        : "modern-bold";

      const [post] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, body.postId));
      if (!post) {
        return Response.json({ error: "Post não encontrado." }, { status: 404 });
      }

      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, post.companyId));
      if (!company) {
        return Response.json({ error: "Empresa não encontrada." }, { status: 404 });
      }

      const slides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, post.id))
        .orderBy(asc(post_slides.slideNumber));

      const targetDir = path.join(RENDERS_DIR, post.companyId, post.id);
      await fs.mkdir(targetDir, { recursive: true });

      const renderedSlides: Array<{
        slideNumber: number;
        renderedImageUrl: string;
        svgPreviewUrl: string;
      }> = [];

      const totalSlides = Math.max(slides.length, post.slideCount || 5);
      const styleBlueprint = await resolvePostStyleBlueprint({
        companyId: company.id,
        postTypeId: post.postTypeId,
      });

      for (const slide of slides) {
        const slidePad = String(slide.slideNumber).padStart(2, "0");
        const fields: OpenDesignSlideFields = {
          templateId,
          slideNumber: slide.slideNumber,
          totalSlides,
          headline: slide.title || `${post.theme} (#${slide.slideNumber})`,
          bodyText:
            slide.bodyText ||
            `Conteúdo estratégico da lâmina ${slide.slideNumber} para ${company.name}.`,
          ctaText: slide.ctaText,
          backgroundImageUrl: body.backgroundImageUrl || null,
          brandKit: {
            companyName: company.name,
            instagramHandle: company.instagramHandle,
            primaryColor: company.primaryColor || "#0D9488",
            secondaryColor: company.secondaryColor || "#0284C7",
            backgroundColor: company.backgroundColor || "#0F172A",
            accentColor: company.accentColor || "#10B981",
          },
          styleBlueprint,
          clientCanvasDataUrl: body.clientSlidePngs?.[slide.slideNumber] || null,
        };

        const svgString = renderOpenDesignSlideSvg(fields);
        const pngBuffer = renderSlidePngBuffer(fields);

        const pngFilename = `slide_${slidePad}.png`;
        const svgFilename = `slide_${slidePad}.svg`;

        await Bun.write(path.join(targetDir, pngFilename), pngBuffer);
        await Bun.write(path.join(targetDir, svgFilename), svgString);

        const renderedImageUrl = `/renders/${post.companyId}/${post.id}/${pngFilename}`;
        const svgPreviewUrl = `/renders/${post.companyId}/${post.id}/${svgFilename}`;

        await db
          .update(post_slides)
          .set({
            templateId,
            renderedImageUrl,
            imagePrompt: body.imagePrompt ?? slide.imagePrompt ?? null,
          })
          .where(eq(post_slides.id, slide.id));

        renderedSlides.push({
          slideNumber: slide.slideNumber,
          renderedImageUrl,
          svgPreviewUrl,
        });
      }

      // Atualiza status do post para 'ready_design' (ou 'queued' se enqueueImmediately for true)
      await db
        .update(posts)
        .set({ status: "ready_design" })
        .where(eq(posts.id, post.id));

      let queuedFiles: string[] = [];
      if (body.enqueueImmediately) {
        const queueRes = await enqueuePostForAutoSocial(post.id);
        queuedFiles = queueRes.files;
      }

      return Response.json({
        success: true,
        postId: post.id,
        templateId,
        renderedCount: renderedSlides.length,
        renderedSlides,
        queuedFiles,
      });
    } catch (err) {
      return Response.json(
        {
          error: "Falha ao renderizar carrossel no Studio OpenDesign",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 500 }
      );
    }
  }

  // 3. POST /api/design/preview-payloads (Prompt Inspector Dry-Run — US$ 0.00)
  if (url.pathname === "/api/design/preview-payloads" && req.method === "POST") {
    try {
      const body = (await req.json()) as {
        postId?: string;
        companyId?: string;
        slideNumber?: number;
        templateId?: string;
        formatId?: PostFormatId;
        imageProvider?: string;
        imageModel?: string;
        userImagePrompt?: string;
        headline?: string;
        bodyText?: string;
        ctaText?: string | null;
      };

      let targetCompanyId = body.companyId;
      let targetPost: typeof posts.$inferSelect | undefined;

      if (body.postId) {
        const [found] = await db.select().from(posts).where(eq(posts.id, body.postId));
        if (!found) {
          return Response.json({ success: false, error: "Post não encontrado" }, { status: 404 });
        }
        targetPost = found;
        targetCompanyId = found.companyId;
      }

      if (!targetCompanyId) {
        return Response.json({ success: false, error: "postId ou companyId é obrigatório" }, { status: 400 });
      }

      const [company] = await db.select().from(companies).where(eq(companies.id, targetCompanyId));
      if (!company) {
        return Response.json({ success: false, error: "Empresa não encontrada" }, { status: 404 });
      }

      const slides = targetPost
        ? await db
            .select()
            .from(post_slides)
            .where(eq(post_slides.postId, targetPost.id))
            .orderBy(asc(post_slides.slideNumber))
        : [];

      const slideNum = body.slideNumber || 1;
      const targetSlide = slides.find((s) => s.slideNumber === slideNum) || slides[0];

      const parsedTemplate = designTemplateSchema.safeParse(body.templateId || "modern-bold");
      const templateId: DesignTemplateId = parsedTemplate.success
        ? parsedTemplate.data
        : "modern-bold";

      const format = getFormatSpec(body.formatId);
      const styleBlueprint = await resolvePostStyleBlueprint({
        companyId: company.id,
        postTypeId: targetPost?.postTypeId,
      });

      // 1. Prompt de Texto/Roteiro
      const aiProvider = await AIProviderFactory.getForCompany(company.id);
      const textPromptPreview = aiProvider.buildPreviewPrompt({
        theme: targetPost?.theme || "Tema editorial",
        category: targetPost?.category || "Dica Prática",
        slideCount: targetPost?.slideCount || format.defaultSlides,
        company,
        styleBlueprint,
      });

      // 2. Payload da API de Imagem
      const imageProvider = body.imageProvider || "openrouter-image";
      const imageModel = body.imageModel || "black-forest-labs/flux.2-klein-4b";
      const compiledImagePrompt = buildImagePrompt({
        theme: targetPost?.theme,
        niche: company.niche,
        userPrompt:
          body.userImagePrompt ||
          targetSlide?.imagePrompt ||
          `Fundo editorial para ${company.name}`,
        brandPrimaryColor: company.primaryColor || "#0D9488",
        styleBlueprint,
      });
      const curatedImg = CURATED_OPENROUTER_IMAGE_MODELS.find((m) => m.id === imageModel);
      const estimatedImageCostUsd =
        imageProvider === "pollinations" || imageProvider === "comfyui-local"
          ? 0
          : curatedImg?.pricePerImageUsd ?? 0.03;

      const imageApiPayload = {
        provider: imageProvider,
        model: imageModel,
        endpoint:
          imageProvider === "openrouter-image"
            ? "https://openrouter.ai/api/v1/chat/completions"
            : imageProvider === "gemini-imagen"
              ? `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:predict`
              : "https://api.openai.com/v1/images/generations",
        compiledPrompt: compiledImagePrompt,
        aspectRatio: format.aspectRatio,
        width: format.width,
        height: format.height,
        estimatedCostUsd: estimatedImageCostUsd,
      };

      // 3. Payload do Motor OpenDesign
      const openDesignEnginePayload: OpenDesignSlideFields = {
        templateId,
        formatId: format.id,
        slideNumber: slideNum,
        totalSlides: targetPost?.slideCount || Math.max(slides.length, 5),
        headline:
          body.headline ||
          targetSlide?.title ||
          targetPost?.theme ||
          "Título Principal da Lâmina",
        bodyText:
          body.bodyText ||
          targetSlide?.bodyText ||
          `Desenvolvimento editorial para ${company.name}.`,
        ctaText: body.ctaText !== undefined ? body.ctaText : targetSlide?.ctaText || null,
        brandKit: {
          companyName: company.seoDisplayName || company.name,
          instagramHandle: company.instagramHandle,
          primaryColor: company.primaryColor || "#0D9488",
          secondaryColor: company.secondaryColor || "#0284C7",
          backgroundColor: company.backgroundColor || "#0F172A",
          accentColor: company.accentColor || "#10B981",
        },
        styleBlueprint,
      };

      const svgPreview = renderOpenDesignSlideSvg(openDesignEnginePayload);

      return Response.json({
        success: true,
        data: {
          textPromptPreview,
          imageApiPayload,
          openDesignEnginePayload,
          svgPreview,
          styleBlueprint,
        },
      });
    } catch (err) {
      return Response.json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao gerar preview de payloads",
        },
        { status: 500 }
      );
    }
  }

  return null;
}
