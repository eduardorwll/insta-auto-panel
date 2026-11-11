import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { db } from "../../src/server/db/client";
import { companies, weekly_schedules, posts } from "../../src/server/db/schema";
import {
  enqueuePostForAutoSocial,
  reconcileAutoSocialQueueWithDb,
  queueFileMatchesPost,
  removePostDiskArtifacts,
  ensureQueueDirs,
} from "../../src/server/services/export/autosocial";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

const companyId = "empresa_m14";
const schedId = `sched_${companyId}_20261109`;
const idA = `post_${schedId}_segunda`;
const idB = `post_${schedId}_segunda_1730`;
const queueRoot = path.resolve(import.meta.dirname, `../../data/autosocial/queue/${companyId}`);
const rendersRoot = path.resolve(import.meta.dirname, `../../data/renders/${companyId}`);

async function seedPost(id: string, status: "draft" | "published" = "draft") {
  await db.insert(posts).values({
    id, scheduleId: schedId, companyId, dayOfWeek: "segunda", theme: "t", category: "c",
    slideCount: 3, caption: "Legenda", status,
  });
}

describe("Marco M14: idempotência e reconciliação AutoSocial", () => {
  beforeAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
    await db.insert(companies).values({ id: companyId, name: "M14", instagramHandle: "@m14", niche: "n", toneOfVoice: "t" });
    await db.insert(weekly_schedules).values({ id: schedId, companyId, weekStartDate: "2026-11-09" });
    await seedPost(idA);
    await seedPost(idB);
  });
  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
    await fs.rm(queueRoot, { recursive: true, force: true });
    await fs.rm(rendersRoot, { recursive: true, force: true });
  });

  it("matcher não confunde ids com prefixo comum", () => {
    expect(queueFileMatchesPost(`1_segunda_${idB}.description`, idA)).toBe(false);
    expect(queueFileMatchesPost(`1_segunda_${idA}.description`, idA)).toBe(true);
    expect(queueFileMatchesPost(`1_segunda_${idA}_slide_01.png`, idA)).toBe(true);
    expect(queueFileMatchesPost(`1_segunda_${idB}_1.png`, idA)).toBe(false);
  });

  it("duplo enfileiramento mantém um único .description por post", async () => {
    await enqueuePostForAutoSocial(idA);
    await enqueuePostForAutoSocial(idA);
    await enqueuePostForAutoSocial(idB);
    const pending = path.join(queueRoot, "instagram/pending");
    const files = await fs.readdir(pending);
    expect(files.filter((f) => queueFileMatchesPost(f, idA) && f.endsWith(".description")).length).toBe(1);
    expect(files.filter((f) => queueFileMatchesPost(f, idB) && f.endsWith(".description")).length).toBe(1);
  });

  it("reconcilia published/ e failed/ de volta ao SQLite", async () => {
    const dirs = await ensureQueueDirs(companyId);
    const pending = await fs.readdir(dirs.pending);
    const fileA = pending.find((f) => queueFileMatchesPost(f, idA))!;
    const fileB = pending.find((f) => queueFileMatchesPost(f, idB))!;
    await fs.rename(path.join(dirs.pending, fileA), path.join(dirs.published, fileA));
    await fs.rename(path.join(dirs.pending, fileB), path.join(dirs.failed, fileB));
    const r = await reconcileAutoSocialQueueWithDb(companyId);
    expect(r).toEqual({ published: 1, failed: 1 });
    const [a] = await db.select().from(posts).where(eq(posts.id, idA));
    const [b] = await db.select().from(posts).where(eq(posts.id, idB));
    expect(a!.status).toBe("published");
    expect(b!.status).toBe("failed");
  });

  it("post publicado não pode ser re-enfileirado", async () => {
    await expect(enqueuePostForAutoSocial(idA)).rejects.toThrow(/Transição de status inválida/);
  });

  it("removePostDiskArtifacts apaga renders e fila pendente do post", async () => {
    const dir = path.join(rendersRoot, idB);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "slide_01.png"), "x");
    await enqueuePostForAutoSocial(idB); // failed -> queued permitido
    await removePostDiskArtifacts(companyId, idB);
    await expect(fs.access(dir)).rejects.toBeDefined();
    const pending = await fs.readdir(path.join(queueRoot, "instagram/pending"));
    expect(pending.some((f) => queueFileMatchesPost(f, idB))).toBe(false);
  });
});
