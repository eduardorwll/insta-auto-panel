import { db } from "../../db/client";
import {
  companies,
  weekly_schedules,
  posts,
  post_slides,
  photo_assets,
} from "../../db/schema";
import { eq, inArray } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

const BASE_QUEUE_DIR = path.resolve(import.meta.dirname, "../../../data/autosocial/queue");
const UPLOADS_DIR = path.resolve(import.meta.dirname, "../../../data/uploads");
const RENDERS_DIR = path.resolve(import.meta.dirname, "../../../../data/renders");

export interface QueueStatusResult {
  pendingCount: number;
  publishedCount: number;
  failedCount: number;
  pendingFiles: string[];
}

function getCompanyQueueDirs(companyId: string) {
  const accountBase = path.join(BASE_QUEUE_DIR, companyId, "instagram");
  return {
    pending: path.join(accountBase, "pending"),
    published: path.join(accountBase, "published"),
    failed: path.join(accountBase, "failed"),
  };
}

export async function ensureQueueDirs(companyId: string) {
  const dirs = getCompanyQueueDirs(companyId);
  await fs.mkdir(dirs.pending, { recursive: true });
  await fs.mkdir(dirs.published, { recursive: true });
  await fs.mkdir(dirs.failed, { recursive: true });
  return dirs;
}

export async function enqueuePostForAutoSocial(postId: string): Promise<{ success: boolean; files: string[] }> {
  // 1. Buscar post
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) {
    throw new Error(`Post com ID "${postId}" não encontrado.`);
  }

  // 2. Garantir diretórios da fila
  const dirs = await ensureQueueDirs(post.companyId);

  // 3. Gerar sidecar .description com metadados de horário programado
  const timestamp = Date.now();
  const filePrefix = `${timestamp}_${post.dayOfWeek}_${post.id}`;
  const descFilePath = path.join(dirs.pending, `${filePrefix}.description`);

  const scheduledTimeTag = post.scheduledTime ? `[SCHEDULED_TIME: ${post.scheduledTime}]\n` : "";
  const altTextTag = post.altText ? `[ALT_TEXT: ${post.altText}]\n` : "";
  const rawCaption = post.caption || `Post sobre ${post.theme}\n\n#socialpanel #instagram`;
  const captionContent = `${scheduledTimeTag}${altTextTag}${rawCaption}`;
  await Bun.write(descFilePath, captionContent);

  const createdFiles: string[] = [descFilePath];

  // 4. Copiar lâminas renderizadas pelo Studio OpenDesign (Sem Canva), se existirem
  const postRenderDir = path.join(RENDERS_DIR, post.companyId, post.id);
  try {
    const renderedEntries = (await fs.readdir(postRenderDir))
      .filter((f) => f.endsWith(".png"))
      .sort();
    for (const entry of renderedEntries) {
      const sourceRenderPath = path.join(postRenderDir, entry);
      const targetRenderPath = path.join(dirs.pending, `${filePrefix}_${entry}`);
      if (await Bun.file(sourceRenderPath).exists()) {
        await fs.copyFile(sourceRenderPath, targetRenderPath);
        createdFiles.push(targetRenderPath);
      }
    }
  } catch {
    // Sem renders gerados ainda para este post
  }

  // 5. Copiar mídias vinculadas do banco de fotos (se houver)
  let photoIds: string[] = [];
  if (post.selectedPhotoIds) {
    try {
      photoIds = JSON.parse(post.selectedPhotoIds);
    } catch {
      // Ignora erro de parse
    }
  }

  // Buscar fotos no banco
  if (photoIds.length > 0) {
    const photos = await db
      .select()
      .from(photo_assets)
      .where(inArray(photo_assets.id, photoIds));

    for (const [idx, photo] of photos.entries()) {
      if (!photo) continue;
      const sourcePath = path.join(UPLOADS_DIR, photo.filename);
      const ext = path.extname(photo.filename) || ".png";
      const targetFilename = `${filePrefix}_${idx + 1}${ext}`;
      const targetPath = path.join(dirs.pending, targetFilename);

      if (await Bun.file(sourcePath).exists()) {
        await fs.copyFile(sourcePath, targetPath);
        createdFiles.push(targetPath);
      }
    }
  }

  // 5. Atualizar status do post no SQLite para 'queued'
  await db
    .update(posts)
    .set({ status: "queued" })
    .where(eq(posts.id, postId));

  return { success: true, files: createdFiles };
}

export async function enqueueScheduleForAutoSocial(
  scheduleId: string
): Promise<{ success: boolean; queuedCount: number; files: string[] }> {
  const schedulePosts = await db
    .select()
    .from(posts)
    .where(eq(posts.scheduleId, scheduleId));

  let totalFiles: string[] = [];
  let queuedCount = 0;

  for (const post of schedulePosts) {
    const res = await enqueuePostForAutoSocial(post.id);
    if (res.success) {
      queuedCount++;
      totalFiles.push(...res.files);
    }
  }

  return { success: true, queuedCount, files: totalFiles };
}

export async function getAutoSocialQueueStatus(companyId: string): Promise<QueueStatusResult> {
  const dirs = await ensureQueueDirs(companyId);

  try {
    const pendingEntries = await fs.readdir(dirs.pending);
    const publishedEntries = await fs.readdir(dirs.published);
    const failedEntries = await fs.readdir(dirs.failed);

    return {
      pendingCount: pendingEntries.filter((f) => f.endsWith(".description")).length,
      publishedCount: publishedEntries.filter((f) => f.endsWith(".description")).length,
      failedCount: failedEntries.filter((f) => f.endsWith(".description")).length,
      pendingFiles: pendingEntries,
    };
  } catch (err) {
    return {
      pendingCount: 0,
      publishedCount: 0,
      failedCount: 0,
      pendingFiles: [],
    };
  }
}
