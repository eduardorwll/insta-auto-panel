import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/client";
import { post_slides, posts, weekly_schedules } from "../../db/schema";

export const DAYS_OF_WEEK = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;

export const DAY_ORDER: Record<string, number> = {
  segunda: 0,
  terca: 1,
  quarta: 2,
  quinta: 3,
  sexta: 4,
  sabado: 5,
  domingo: 6,
};

export interface PostWithSlides extends Omit<typeof posts.$inferSelect, "selectedPhotoIds"> {
  selectedPhotoIds: string[];
  slides: (typeof post_slides.$inferSelect)[];
}

export interface WeeklyScheduleResult {
  schedule: typeof weekly_schedules.$inferSelect;
  posts: PostWithSlides[];
}

export interface CreatePostParams {
  scheduleId: string;
  companyId: string;
  dayOfWeek: string;
  theme?: string;
  category?: string;
  slideCount?: number;
  scheduledTime?: string;
  caption?: string | null;
}

export interface UpdatePostParams {
  theme?: string;
  category?: string;
  status?: "draft" | "ready" | "scheduled" | "published";
  caption?: string;
  altText?: string;
  scheduledTime?: string;
  selectedPhotoIds?: string[];
  slideCount?: number;
}

export interface UpdateSlideItem {
  id: string;
  title?: string;
  bodyText?: string;
  ctaText?: string | null;
  assignedPhotoId?: string | null;
}

/**
 * Obtém ou inicializa o cronograma semanal com 7 dias e 5 lâminas por padrão.
 */
export async function getOrCreateWeeklySchedule(
  companyId: string,
  weekStartDate: string
): Promise<WeeklyScheduleResult> {
  let [schedule] = await db
    .select()
    .from(weekly_schedules)
    .where(
      and(
        eq(weekly_schedules.companyId, companyId),
        eq(weekly_schedules.weekStartDate, weekStartDate)
      )
    );

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
        scheduledTime: "09:00",
      });

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

    const [created] = await db
      .select()
      .from(weekly_schedules)
      .where(eq(weekly_schedules.id, scheduleId));
    schedule = created;
  }

  if (!schedule) {
    throw new Error("Erro ao obter cronograma semanal");
  }

  const schedulePosts = await db
    .select()
    .from(posts)
    .where(eq(posts.scheduleId, schedule.id));

  const postsWithSlides: PostWithSlides[] = await Promise.all(
    schedulePosts.map(async (p) => {
      let slides = await db
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, p.id))
        .orderBy(asc(post_slides.slideNumber));

      if (slides.length === 0) {
        const count = p.slideCount || 5;
        for (let i = 1; i <= count; i++) {
          await db.insert(post_slides).values({
            id: `slide_${p.id}_${i}`,
            postId: p.id,
            slideNumber: i,
            title: i === 1 ? "Capa / Gancho" : i === count ? "Chamada para Ação" : `Slide ${i}`,
            bodyText: i === 1 ? "Texto provocativo do gancho" : `Desenvolvimento do passo ${i - 1}`,
            ctaText: i === count ? "Comente ou envie mensagem no WhatsApp!" : null,
          });
        }
        slides = await db
          .select()
          .from(post_slides)
          .where(eq(post_slides.postId, p.id))
          .orderBy(asc(post_slides.slideNumber));
      }

      return {
        ...p,
        selectedPhotoIds: p.selectedPhotoIds ? JSON.parse(p.selectedPhotoIds) : [],
        slides,
      };
    })
  );

  postsWithSlides.sort((a, b) => {
    const dayDiff = (DAY_ORDER[a.dayOfWeek] ?? 0) - (DAY_ORDER[b.dayOfWeek] ?? 0);
    if (dayDiff !== 0) return dayDiff;
    return (a.scheduledTime || "09:00").localeCompare(b.scheduledTime || "09:00");
  });

  return { schedule, posts: postsWithSlides };
}

/**
 * Atualiza um post e sincroniza dinamicamente a contagem de lâminas (3 a 10).
 */
export async function updatePostWithSlides(
  postId: string,
  params: UpdatePostParams
): Promise<PostWithSlides | null> {
  const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!existingPost) return null;

  const updateValues: Partial<typeof posts.$inferInsert> = {};
  if (params.theme !== undefined) updateValues.theme = params.theme;
  if (params.category !== undefined) updateValues.category = params.category;
  if (params.status !== undefined) updateValues.status = params.status;
  if (params.caption !== undefined) updateValues.caption = params.caption;
  if (params.altText !== undefined) updateValues.altText = params.altText;
  if (params.scheduledTime !== undefined) updateValues.scheduledTime = params.scheduledTime;
  if (params.selectedPhotoIds !== undefined) {
    updateValues.selectedPhotoIds = JSON.stringify(params.selectedPhotoIds);
  }

  if (params.slideCount !== undefined && params.slideCount !== existingPost.slideCount) {
    updateValues.slideCount = params.slideCount;

    const currentSlides = await db
      .select()
      .from(post_slides)
      .where(eq(post_slides.postId, postId))
      .orderBy(asc(post_slides.slideNumber));

    if (params.slideCount > currentSlides.length) {
      for (let i = currentSlides.length + 1; i <= params.slideCount; i++) {
        await db.insert(post_slides).values({
          id: `slide_${postId}_${i}_${Date.now()}`,
          postId,
          slideNumber: i,
          title: i === params.slideCount ? "Chamada para Ação" : `Slide ${i}`,
          bodyText: `Conteúdo da lâmina ${i}`,
          ctaText: i === params.slideCount ? "Entre em contato pelo WhatsApp!" : null,
        });
      }
    } else if (params.slideCount < currentSlides.length) {
      for (const s of currentSlides) {
        if (s.slideNumber > params.slideCount) {
          await db.delete(post_slides).where(eq(post_slides.id, s.id));
        }
      }
    }
  }

  if (Object.keys(updateValues).length > 0) {
    await db.update(posts).set(updateValues).where(eq(posts.id, postId));
  }

  const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!updatedPost) return null;

  const slides = await db
    .select()
    .from(post_slides)
    .where(eq(post_slides.postId, postId))
    .orderBy(asc(post_slides.slideNumber));

  return {
    ...updatedPost,
    selectedPhotoIds: updatedPost.selectedPhotoIds ? JSON.parse(updatedPost.selectedPhotoIds) : [],
    slides,
  };
}

/**
 * Obtém lâminas de um post ordenadas por slideNumber.
 */
export async function getPostSlides(postId: string) {
  return db
    .select()
    .from(post_slides)
    .where(eq(post_slides.postId, postId))
    .orderBy(asc(post_slides.slideNumber));
}

/**
 * Atualiza o conteúdo textual e foto de um conjunto de lâminas.
 */
export async function updatePostSlidesContent(
  postId: string,
  slidesList: UpdateSlideItem[]
) {
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

  return getPostSlides(postId);
}

/**
 * Cria um novo post e suas N lâminas no cronograma.
 */
export async function createSchedulePost(
  params: CreatePostParams
): Promise<PostWithSlides> {
  const slideCount = params.slideCount || 5;
  const postId = `post_${params.scheduleId}_${params.dayOfWeek}_${Date.now()}`;

  await db.insert(posts).values({
    id: postId,
    scheduleId: params.scheduleId,
    companyId: params.companyId,
    dayOfWeek: params.dayOfWeek,
    theme: params.theme || "Tema a definir",
    category: params.category || "Dica Prática",
    slideCount,
    status: "draft",
    scheduledTime: params.scheduledTime || "09:00",
    caption: params.caption || null,
  });

  for (let i = 1; i <= slideCount; i++) {
    await db.insert(post_slides).values({
      id: `slide_${postId}_${i}`,
      postId,
      slideNumber: i,
      title: i === 1 ? "Capa / Gancho" : i === slideCount ? "Chamada para Ação" : `Slide ${i}`,
      bodyText: i === 1 ? "Texto provocativo do gancho" : `Desenvolvimento do passo ${i - 1}`,
      ctaText: i === slideCount ? "Comente ou envie mensagem no WhatsApp!" : null,
    });
  }

  const [createdPost] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!createdPost) {
    throw new Error("Erro ao recuperar o post recém-criado");
  }
  const slides = await getPostSlides(postId);

  return {
    ...createdPost,
    selectedPhotoIds: [],
    slides,
  };
}

/**
 * Exclui um post e todas as suas lâminas vinculadas.
 */
export async function deleteSchedulePost(postId: string): Promise<boolean> {
  const [existing] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!existing) return false;

  await db.delete(post_slides).where(eq(post_slides.postId, postId));
  await db.delete(posts).where(eq(posts.id, postId));
  return true;
}
