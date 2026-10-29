import { db } from "../db/client";
import {
  companies,
  posts,
  post_slides,
  designTemplateSchema,
  imageProviderSchema,
  type DesignTemplateId,
} from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { ImageProviderFactory } from "../services/design/image-provider";
import {
  renderOpenDesignSlideSvg,
  renderSlidePngBuffer,
  type OpenDesignSlideFields,
} from "../services/design/template-engine";
import { enqueuePostForAutoSocial } from "../services/export/autosocial";
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

      const adapter = ImageProviderFactory.create({
        provider: providerName,
        apiKey: body.apiKey || null,
        baseUrl: body.baseUrl || null,
        modelName: body.modelName || null,
      });

      const result = await adapter.generateBackground({
        prompt: body.prompt || "Editorial background 4:5",
        width: 1080,
        height: 1350,
        brandPrimaryColor: body.brandPrimaryColor || "#6366F1",
        brandSecondaryColor: body.brandSecondaryColor || "#EC4899",
        offlineFallback: body.offlineFallback ?? true,
      });

      return Response.json(result);
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
            primaryColor: company.primaryColor || "#6366F1",
            secondaryColor: company.secondaryColor || "#EC4899",
            backgroundColor: company.backgroundColor || "#0F172A",
            accentColor: company.accentColor || "#10B981",
          },
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

      // Atualiza status do post para 'ready_canva' (ou 'queued' se enqueueImmediately for true)
      await db
        .update(posts)
        .set({ status: "ready_canva" })
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

  return null;
}
