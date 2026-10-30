import { dayOfWeekSchema } from "../db/schema";
import { z } from "zod";
import {
  getOrCreateWeeklySchedule,
  updatePostWithSlides,
  getPostSlides,
  updatePostSlidesContent,
  createSchedulePost,
  deleteSchedulePost,
} from "../services/schedules/schedule-service";

const postCreateSchema = z.object({
  scheduleId: z.string().min(1, "scheduleId é obrigatório"),
  companyId: z.string().min(1, "companyId é obrigatório"),
  dayOfWeek: dayOfWeekSchema,
  theme: z.string().optional().default("Tema a definir"),
  category: z.string().optional().default("Dica Prática"),
  slideCount: z.number().int().min(3).max(10).optional().default(5),
  scheduledTime: z.string().optional().default("09:00"),
  caption: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
});

const postUpdateSchema = z.object({
  theme: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  slideCount: z.number().int().min(3).max(10).optional(),
  status: z.enum(["draft", "ai_generated", "ready_canva", "queued", "posted"]).optional(),
  caption: z.string().optional().nullable(),
  altText: z.string().optional().nullable(),
  scheduledTime: z.string().optional().nullable(),
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

    try {
      const data = await getOrCreateWeeklySchedule(companyId, weekStartDate);
      return Response.json({
        success: true,
        data,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao obter cronograma";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  // 2. PUT /api/posts/:id
  if (req.method === "PUT" && pathname.startsWith("/api/posts/") && !pathname.endsWith("/slides")) {
    const postId = pathname.replace("/api/posts/", "");

    try {
      const body = await req.json();
      const parsed = postUpdateSchema.parse(body);

      const updated = await updatePostWithSlides(postId, {
        theme: parsed.theme,
        category: parsed.category,
        status: parsed.status as any,
        caption: parsed.caption ?? undefined,
        altText: parsed.altText ?? undefined,
        scheduledTime: parsed.scheduledTime ?? undefined,
        selectedPhotoIds: parsed.selectedPhotoIds ?? undefined,
        slideCount: parsed.slideCount,
      });

      if (!updated) {
        return Response.json({ success: false, error: "Post não encontrado" }, { status: 404 });
      }

      return Response.json({
        success: true,
        data: updated,
      });
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return Response.json(
          { success: false, error: "Dados inválidos", details: err.format() },
          { status: 400 }
        );
      }
      const message = err instanceof Error ? err.message : "Erro interno";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  // 3. GET /api/posts/:id/slides
  if (req.method === "GET" && pathname.startsWith("/api/posts/") && pathname.endsWith("/slides")) {
    const postId = pathname.replace("/api/posts/", "").replace("/slides", "");
    const slides = await getPostSlides(postId);
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

      const updatedSlides = await updatePostSlidesContent(postId, slidesList);
      return Response.json({ success: true, data: updatedSlides });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro interno";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  // 5. POST /api/posts (Criar novo post no cronograma)
  if (req.method === "POST" && pathname === "/api/posts") {
    try {
      const body = await req.json();
      const parsed = postCreateSchema.parse(body);

      const created = await createSchedulePost(parsed);

      return Response.json(
        {
          success: true,
          data: created,
        },
        { status: 201 }
      );
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return Response.json(
          { success: false, error: "Dados inválidos", details: err.format() },
          { status: 400 }
        );
      }
      const message = err instanceof Error ? err.message : "Erro ao criar post";
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  }

  // 6. DELETE /api/posts/:id (Excluir post do cronograma)
  if (req.method === "DELETE" && pathname.startsWith("/api/posts/")) {
    const postId = pathname.replace("/api/posts/", "");
    const deleted = await deleteSchedulePost(postId);
    if (!deleted) {
      return Response.json({ success: false, error: "Post não encontrado" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Post excluído com sucesso" });
  }

  return null;
}
