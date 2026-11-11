import { and, asc, eq, gt, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { removePostDiskArtifacts } from "../export/autosocial";
import { assertPostTransition } from "../../../shared/state-machines/post-lifecycle.machine";
import { post_slides, posts, weekly_schedules, type PostStatus } from "../../db/schema";

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
  status?: PostStatus;
  caption?: string;
  altText?: string;
  scheduledTime?: string;
  selectedPhotoIds?: string[];
  slideCount?: number;
  slides?: UpdateSlideItem[];
}

export interface UpdateSlideItem {
  id?: string;
  slideNumber?: number;
  title?: string;
  bodyText?: string;
  ctaText?: string | null;
  assignedPhotoId?: string | null;
}


type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function defaultSlideValues(postId: string, i: number, count: number) {
  return {
    id: `slide_${postId}_${i}`,
    postId,
    slideNumber: i,
    title: i === 1 ? "Capa / Gancho" : i === count ? "Chamada para Ação" : `Slide ${i}`,
    bodyText: i === 1 ? "Texto provocativo do gancho" : `Desenvolvimento do passo ${i - 1}`,
    ctaText: i === count ? "Envie uma mensagem no Direct ou acesse o link na bio!" : null,
  };
}

/** Remove lâminas excedentes (slideNumber > slideCount) — invariante de poda. */
export function pruneExcessSlides(tx: Tx, postId: string, slideCount: number): void {
  tx.delete(post_slides)
    .where(and(eq(post_slides.postId, postId), gt(post_slides.slideNumber, slideCount)))
    .run();
}

/** Recalcula photo_assets.timesUsed a partir das lâminas (fonte de verdade). */
export function recalculatePhotoTimesUsed(companyId: string): void {
  db.run(sql`UPDATE photo_assets SET times_used = (
       SELECT COUNT(*) FROM post_slides WHERE post_slides.assigned_photo_id = photo_assets.id
     ) WHERE company_id = ${companyId}`);
}

function applySlideUpdates(tx: Tx, postId: string, items: UpdateSlideItem[]): void {
  for (const item of items) {
    const values = {
      title: item.title,
      bodyText: item.bodyText,
      ctaText: item.ctaText,
      assignedPhotoId: item.assignedPhotoId || null,
    };
    // Chave natural (postId, slideNumber) tem prioridade: ids temporários (temp_slide_*) nunca casam.
    const isTemp = !item.id || item.id.startsWith("temp_slide_");
    if (!isTemp) {
      const owned = tx
        .select({ id: post_slides.id })
        .from(post_slides)
        .where(and(eq(post_slides.id, item.id!), eq(post_slides.postId, postId)))
        .get();
      if (owned) {
        tx.update(post_slides)
          .set(values)
          .where(and(eq(post_slides.id, item.id!), eq(post_slides.postId, postId)))
          .run();
        continue;
      }
    }
    if (item.slideNumber !== undefined) {
      tx.update(post_slides)
        .set(values)
        .where(and(eq(post_slides.postId, postId), eq(post_slides.slideNumber, item.slideNumber)))
        .run();
    }
  }
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
    // Transação ACID + onConflictDoNothing: requisições concorrentes (TOCTOU) convergem para o mesmo cronograma.
    db.transaction((tx) => {
      tx.insert(weekly_schedules)
        .values({ id: scheduleId, companyId, weekStartDate })
        .onConflictDoNothing()
        .run();

      for (const day of DAYS_OF_WEEK) {
        const postId = `post_${scheduleId}_${day}`;
        tx.insert(posts)
          .values({
            id: postId,
            scheduleId,
            companyId,
            dayOfWeek: day,
            theme: "Tema a definir",
            category: "Dica Prática",
            slideCount: 5,
            status: "draft",
            scheduledTime: "09:00",
          })
          .onConflictDoNothing()
          .run();

        for (let i = 1; i <= 5; i++) {
          tx.insert(post_slides).values(defaultSlideValues(postId, i, 5)).onConflictDoNothing().run();
        }
      }
    });

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
        db.transaction((tx) => {
          for (let i = 1; i <= count; i++) {
            tx.insert(post_slides).values(defaultSlideValues(p.id, i, count)).onConflictDoNothing().run();
          }
        });
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
  if (params.status !== undefined) {
    updateValues.status = assertPostTransition(existingPost.status, params.status);
  }
  if (params.caption !== undefined) updateValues.caption = params.caption;
  if (params.altText !== undefined) updateValues.altText = params.altText;
  if (params.scheduledTime !== undefined) updateValues.scheduledTime = params.scheduledTime;
  if (params.selectedPhotoIds !== undefined) {
    updateValues.selectedPhotoIds = JSON.stringify(params.selectedPhotoIds);
  }

  // Post + lâminas mudam atomicamente: ou tudo ou nada.
  db.transaction((tx) => {
    if (params.slideCount !== undefined && params.slideCount !== existingPost.slideCount) {
      updateValues.slideCount = params.slideCount;
      const count = params.slideCount;
      const current = tx
        .select()
        .from(post_slides)
        .where(eq(post_slides.postId, postId))
        .orderBy(asc(post_slides.slideNumber))
        .all();
      const have = new Set(current.map((c) => c.slideNumber));
      for (let i = 1; i <= count; i++) {
        if (have.has(i)) continue;
        tx.insert(post_slides)
          .values({
            id: `slide_${postId}_${i}_${Date.now()}`,
            postId,
            slideNumber: i,
            title: i === count ? "Chamada para Ação" : `Slide ${i}`,
            bodyText: `Conteúdo da lâmina ${i}`,
            ctaText: i === count ? "Envie uma mensagem no Direct ou acesse o link na bio!" : null,
          })
          .run();
      }
      pruneExcessSlides(tx, postId, count);
    }

    if (Object.keys(updateValues).length > 0) {
      tx.update(posts).set(updateValues).where(eq(posts.id, postId)).run();
    }
    if (params.slides?.length) {
      applySlideUpdates(tx, postId, params.slides);
    }
  });
  if (params.slides?.length) recalculatePhotoTimesUsed(existingPost.companyId);

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
  db.transaction((tx) => applySlideUpdates(tx, postId, slidesList));
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (post) recalculatePhotoTimesUsed(post.companyId);
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

  db.transaction((tx) => {
    tx.insert(posts)
      .values({
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
      })
      .run();
    for (let i = 1; i <= slideCount; i++) {
      tx.insert(post_slides).values(defaultSlideValues(postId, i, slideCount)).run();
    }
  });

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

  db.transaction((tx) => {
    tx.delete(post_slides).where(eq(post_slides.postId, postId)).run();
    tx.delete(posts).where(eq(posts.id, postId)).run();
  });
  recalculatePhotoTimesUsed(existing.companyId);
  await removePostDiskArtifacts(existing.companyId, postId).catch(() => {});
  return true;
}
