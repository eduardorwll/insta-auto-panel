import { db } from "../../db/client";
import {
  companies,
  weekly_schedules,
  posts,
  post_slides,
  photo_assets,
} from "../../db/schema";
import { eq, inArray, and } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import {
  assertPostTransition,
  normalizePostStatus,
} from "../../../shared/state-machines/post-lifecycle.machine";

const BASE_QUEUE_DIR = path.resolve(import.meta.dirname, "../../../../data/autosocial/queue");
const UPLOADS_DIR = path.resolve(import.meta.dirname, "../../../../data/uploads");
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

function escapeRegExp(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Reconhece os arquivos de fila pertencentes a UM post específico.
 * Formato: `<ts>_<dia>_<postId>` + (`.description` | `_slide_NN.png` | `_N.<ext>`).
 * Os sufixos fechados evitam colisão entre ids prefixados (post_X vs post_X_1730).
 */
export function queueFileMatchesPost(filename: string, postId: string): boolean {
  const id = escapeRegExp(postId);
  return new RegExp(
    `^\\d+_[a-z]+_${id}(\\.description|_slide_\\d+\\.png|_\\d+\\.(png|jpe?g|webp|gif))$`
  ).test(filename);
}

async function removePostQueueFiles(dir: string, postId: string): Promise<string[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const removed: string[] = [];
  for (const f of entries) {
    if (queueFileMatchesPost(f, postId)) {
      await fs.rm(path.join(dir, f), { force: true });
      removed.push(f);
    }
  }
  return removed;
}

/** Remove artefatos em disco de um post excluído (renders + fila pendente). */
export async function removePostDiskArtifacts(companyId: string, postId: string): Promise<void> {
  await fs.rm(path.join(RENDERS_DIR, companyId, postId), { recursive: true, force: true });
  await removePostQueueFiles(getCompanyQueueDirs(companyId).pending, postId);
}

/** Remove todos os artefatos em disco de uma empresa excluída (renders, fila, uploads das fotos). */
export async function removeCompanyDiskArtifacts(
  companyId: string,
  photoFilenames: string[]
): Promise<void> {
  await fs.rm(path.join(RENDERS_DIR, companyId), { recursive: true, force: true });
  await fs.rm(path.join(BASE_QUEUE_DIR, companyId), { recursive: true, force: true });
  for (const f of photoFilenames) {
    await fs.rm(path.join(UPLOADS_DIR, path.basename(f)), { force: true });
  }
}

/**
 * Reconcilia disco -> SQLite: posts `queued` cujo sidecar migrou para `published/` ou `failed/`
 * (movido pelo AutoSocial) passam a `published` / `failed` pelas transições canônicas.
 */
export async function reconcileAutoSocialQueueWithDb(
  companyId: string
): Promise<{ published: number; failed: number }> {
  const dirs = await ensureQueueDirs(companyId);
  const [publishedFiles, failedFiles] = await Promise.all([
    fs.readdir(dirs.published).catch(() => [] as string[]),
    fs.readdir(dirs.failed).catch(() => [] as string[]),
  ]);
  const queued = await db
    .select()
    .from(posts)
    .where(and(eq(posts.companyId, companyId), eq(posts.status, "queued")));

  let published = 0;
  let failed = 0;
  for (const post of queued) {
    if (publishedFiles.some((f) => queueFileMatchesPost(f, post.id))) {
      await db.update(posts).set({ status: assertPostTransition(post.status, "published") }).where(eq(posts.id, post.id));
      published++;
    } else if (failedFiles.some((f) => queueFileMatchesPost(f, post.id))) {
      await db.update(posts).set({ status: assertPostTransition(post.status, "failed") }).where(eq(posts.id, post.id));
      failed++;
    }
  }
  return { published, failed };
}

export async function enqueuePostForAutoSocial(postId: string): Promise<{ success: boolean; files: string[] }> {
  // 1. Buscar post
  const [post] = await db.select().from(posts).where(eq(posts.id, postId));
  if (!post) {
    throw new Error(`Post com ID "${postId}" não encontrado.`);
  }

  // Guard da FSM: published não pode voltar para a fila.
  assertPostTransition(post.status, "queued");

  // 2. Garantir diretórios da fila
  const dirs = await ensureQueueDirs(post.companyId);

  // Idempotência por postId: substitui qualquer enfileiramento anterior (duplo clique não duplica).
  await removePostQueueFiles(dirs.pending, post.id);

  const createdFiles: string[] = [];
  try {

  // 3. Gerar sidecar .description com metadados de horário programado
  const timestamp = Date.now();
  const filePrefix = `${timestamp}_${post.dayOfWeek}_${post.id}`;
  const descFilePath = path.join(dirs.pending, `${filePrefix}.description`);

  const scheduledTimeTag = post.scheduledTime ? `[SCHEDULED_TIME: ${post.scheduledTime}]\n` : "";
  const altTextTag = post.altText ? `[ALT_TEXT: ${post.altText}]\n` : "";
  const rawCaption = post.caption || `Post sobre ${post.theme}\n\n#socialpanel #instagram`;
  const captionContent = `${scheduledTimeTag}${altTextTag}${rawCaption}`;
  await Bun.write(descFilePath, captionContent);
  createdFiles.push(descFilePath);

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
    // Buscar exclusivamente fotos pertencentes a esta empresa (Isolamento Estrito de Tenants)
    const photos = await db
      .select()
      .from(photo_assets)
      .where(and(inArray(photo_assets.id, photoIds), eq(photo_assets.companyId, post.companyId)));

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

  // 6. Atualizar status do post no SQLite para 'queued'
  await db
    .update(posts)
    .set({ status: "queued" })
    .where(eq(posts.id, postId));
  } catch (err) {
    // Rollback compensatório: não deixar arquivos órfãos na fila se algo falhar antes do commit no SQLite.
    await Promise.all(createdFiles.map((f) => fs.rm(f, { force: true })));
    throw err;
  }

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
    if (normalizePostStatus(post.status) === "published") continue;
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
