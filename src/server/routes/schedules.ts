import { db } from "../db/client";
import {
  weekly_schedules,
  posts,
  post_slides,
  DAYS_OF_WEEK,
  postInsertSchema,
  type DayOfWeek,
} from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

const postUpdateSchema = z.object({
  theme: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  slideCount: z.number().int().min(3).max(10).optional(),
  status: z.enum(["draft", "ai_generated", "ready_canva", "queued", "posted"]).optional(),
  caption: z.string().optional().nullable(),
  selectedPhotoIds: z.array(z.string()).optional().nullable(),
});

export async function handleSchedulesRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. GET /api/schedules?companyId=...&weekStartDate=YYYY-MM-DD
  if (req.method === "GET" && pathname === "/api/schedules") {
    const companyId = url.searchParams.get("companyId");
    const weekStartDate = url.searchParams.get("weekStartDate");

    if (!companyId || !weekStartDate) {
      return Response.json(
        { success: false, error: "companyId e weekStartDate são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar cronograma existente
    let [schedule] = await db
      .select()
      .from(weekly_schedules)
      .where(
        and(
          eq(weekly_schedules.companyId, companyId),
          eq(weekly_schedules.weekStartDate, weekStartDate)
        )
      );

    // Se não existir, inicializa automaticamente os 7 dias com 5 lâminas
    if (!schedule) {
      const scheduleId = `sched_${companyId}_${weekStartDate.replace(/-/g, "")}`;
      await db.insert(weekly_schedules).values({
        id: scheduleId,
        companyId,
        weekStartDate,
      });

      for (const day of DAYS_OF_WEEK) {
        const postId = `post_${scheduleId}_${day}`;
        await db.insert(posts).values({
          id: postId,
          scheduleId,
          companyId,
          dayOfWeek: day,
          theme: "Tema a definir",
          category: "Dica Prática",
          slideCount: 5,
          status: "draft",
        });

        // 5 lâminas por padrão
        for (let i = 1; i <= 5; i++) {
          await db.insert(post_slides).values({
            id: `slide_${postId}_${i}`,
            postId,
            slideNumber: i,
            title: i === 1 ? "Capa / Gancho" : i === 5 ? "Chamada para Ação" : `Slide ${i}`,
            bodyText: i === 1 ? "Texto provocativo do gancho" : `Desenvolvimento do passo ${i - 1}`,
            ctaText: i === 5 ? "Comente ou envie mensagem no WhatsApp!" : null,
          });
        }
      }

      const [createdSchedule] = await db
        .select()
        .from(weekly_schedules)
        .where(eq(weekly_schedules.id, scheduleId));
      schedule = createdSchedule;
    }

    if (!schedule) {
      return Response.json({ success: false, error: "Erro ao obter cronograma" }, { status: 500 });
    }

    // Carregar posts e suas lâminas
    const schedulePosts = await db
      .select()
      .from(posts)
      .where(eq(posts.scheduleId, schedule.id));

    // Ordenar posts de acordo com DAYS_OF_WEEK
    const sortedPosts = await Promise.all(
      DAYS_OF_WEEK.map(async (day) => {
        const p = schedulePosts.find((item) => item.dayOfWeek === day);
        if (!p) return null;
        const slides = await db
          .select()
          .from(post_slides)
          .where(eq(post_slides.postId, p.id))
          .orderBy(asc(post_slides.slideNumber));
        return {
          ...p,
          selectedPhotoIds: p.selectedPhotoIds ? JSON.parse(p.selectedPhotoIds) : [],
          slides,
        };
      })
    );

    return Response.json({
      success: true,
      data: {
        schedule,
        posts: sortedPosts.filter(Boolean),
      },
    });
  }

  // 2. PUT /api/posts/:id
  if (req.method === "PUT" && pathname.startsWith("/api/posts/") && !pathname.endsWith("/slides")) {
    const postId = pathname.replace("/api/posts/", "");
    const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));

    if (!existingPost) {
      return Response.json({ success: false, error: "Post não encontrado" }, { status: 404 });
    }

    try {
      const body = await req.json();
      const parsed = postUpdateSchema.parse(body);

      const updateValues: Record<string, any> = {};
      if (parsed.theme !== undefined) updateValues.theme = parsed.theme;
      if (parsed.category !== undefined) updateValues.category = parsed.category;
      if (parsed.status !== undefined) updateValues.status = parsed.status;
      if (parsed.caption !== undefined) updateValues.caption = parsed.caption;
      if (parsed.selectedPhotoIds !== undefined) {
        updateValues.selectedPhotoIds = JSON.stringify(parsed.selectedPhotoIds);
      }

      // Sincronizar quantidade de lâminas dinâmicas (3 a 10)
      if (parsed.slideCount !== undefined && parsed.slideCount !== existingPost.slideCount) {
        updateValues.slideCount = parsed.slideCount;

        const currentSlides = await db
          .select()
          .from(post_slides)
          .where(eq(post_slides.postId, postId))
          .orderBy(asc(post_slides.slideNumber));

        if (parsed.slideCount > currentSlides.length) {
          // Adicionar lâminas faltantes
          for (let i = currentSlides.length + 1; i <= parsed.slideCount; i++) {
            await db.insert(post_slides).values({
              id: `slide_${postId}_${i}_${Date.now()}`,
              postId,
              slideNumber: i,
              title: i === parsed.slideCount ? "Chamada para Ação" : `Slide ${i}`,
              bodyText: `Conteúdo da lâmina ${i}`,
              ctaText: i === parsed.slideCount ? "Entre em contato pelo WhatsApp!" : null,
            });
          }
        } else if (parsed.slideCount < currentSlides.length) {
          // Remover lâminas excedentes
          for (const s of currentSlides) {
            if (s.slideNumber > parsed.slideCount) {
              await db.delete(post_slides).where(eq(post_slides.id, s.id));
            }
          }
        }
      }

      if (Object.keys(updateValues).length > 0) {
        await db.update(posts).set(updateValues).where(eq(posts.id, postId));
      }

      const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId));
      if (!updatedPost) {
        return Response.json({ success: false, error: "Erro ao obter post atualizado" }, { status: 500 });
      }

      const slides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, postId))
        .orderBy(asc(post_slides.slideNumber));

      return Response.json({
        success: true,
        data: {
          ...updatedPost,
          selectedPhotoIds: updatedPost.selectedPhotoIds ? JSON.parse(updatedPost.selectedPhotoIds) : [],
          slides,
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

  // 3. GET /api/posts/:id/slides
  if (req.method === "GET" && pathname.startsWith("/api/posts/") && pathname.endsWith("/slides")) {
    const postId = pathname.replace("/api/posts/", "").replace("/slides", "");
    const slides = await db
      .select()
      .from(post_slides)
      .where(eq(post_slides.postId, postId))
      .orderBy(asc(post_slides.slideNumber));

    return Response.json({ success: true, data: slides });
  }

  // 4. PUT /api/posts/:id/slides
  if (req.method === "PUT" && pathname.startsWith("/api/posts/") && pathname.endsWith("/slides")) {
    const postId = pathname.replace("/api/posts/", "").replace("/slides", "");
    try {
      const body = await req.json();
      const slidesList = body.slides;

      if (!Array.isArray(slidesList)) {
        return Response.json({ success: false, error: "slides deve ser um array" }, { status: 400 });
      }

      for (const item of slidesList) {
        if (item.id) {
          await db
            .update(post_slides)
            .set({
              title: item.title,
              bodyText: item.bodyText,
              ctaText: item.ctaText,
              assignedPhotoId: item.assignedPhotoId || null,
            })
            .where(eq(post_slides.id, item.id));
        }
      }

      const updatedSlides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, postId))
        .orderBy(asc(post_slides.slideNumber));

      return Response.json({ success: true, data: updatedSlides });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro interno";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  return null;
}
