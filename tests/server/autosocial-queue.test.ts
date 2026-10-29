import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { db } from "@/server/db/client";
import {
  companies,
  weekly_schedules,
  posts,
  post_slides,
  photo_assets,
} from "@/server/db/schema";
import {
  enqueuePostForAutoSocial,
  enqueueScheduleForAutoSocial,
  getAutoSocialQueueStatus,
} from "@/server/services/export/autosocial";
import { server } from "@/server/index";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

describe("Motor de Publicação Autônoma AutoSocial (Filesystem Queue)", () => {
  const companyId = "empresa_queue_test";
  const schedId = `sched_${companyId}_20261102`;
  let postId1 = "";
  let postId2 = "";
  let photoId = "";

  beforeAll(async () => {
    // 1. Criar empresa
    await db.delete(companies).where(eq(companies.id, companyId));
    await db.insert(companies).values({
      id: companyId,
      name: "AutoSocial Clinica",
      instagramHandle: "@autosocial_clinica",
      niche: "Estética Avançada",
      toneOfVoice: "Autoridade e Acolhimento",
      whatsappNumber: "5511999991111",
    });

    // 2. Criar cronograma semanal
    await db.delete(weekly_schedules).where(eq(weekly_schedules.id, schedId));
    await db.insert(weekly_schedules).values({
      id: schedId,
      companyId,
      weekStartDate: "2026-11-02",
    });

    // 3. Criar arquivo de foto real em data/uploads para testar cópia para a fila
    const uploadsDir = path.resolve(import.meta.dirname, "../../data/uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const dummyImageFilename = `test_queue_${Date.now()}.png`;
    const dummyImagePath = path.join(uploadsDir, dummyImageFilename);
    await Bun.write(dummyImagePath, "fake-image-bytes-autosocial");

    photoId = `photo_queue_test`;
    await db.delete(photo_assets).where(eq(photo_assets.id, photoId));
    await db.insert(photo_assets).values({
      id: photoId,
      companyId,
      filename: dummyImageFilename,
      originalName: "clinica.png",
      filePath: `data/uploads/${dummyImageFilename}`,
      category: "Produto",
    });

    // 4. Criar posts
    postId1 = `post_${schedId}_segunda`;
    await db.delete(posts).where(eq(posts.id, postId1));
    await db.insert(posts).values({
      id: postId1,
      scheduleId: schedId,
      companyId,
      dayOfWeek: "segunda",
      theme: "O poder do skincare noturno",
      category: "Tutorial",
      slideCount: 3,
      selectedPhotoIds: JSON.stringify([photoId]),
      caption: "Aprenda a cuidar da sua pele antes de dormir! #skincare",
      status: "ready_canva",
    });

    postId2 = `post_${schedId}_terca`;
    await db.delete(posts).where(eq(posts.id, postId2));
    await db.insert(posts).values({
      id: postId2,
      scheduleId: schedId,
      companyId,
      dayOfWeek: "terca",
      theme: "Mitos sobre protetor solar",
      category: "Quebra de Mito",
      slideCount: 4,
      caption: "Não caia nesses erros comuns sobre proteção solar! #beleza",
      status: "ai_generated",
    });
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyId));
    // Limpar pasta de fila de teste
    const queueDir = path.resolve(
      import.meta.dirname,
      `../../data/autosocial/queue/${companyId}`
    );
    await fs.rm(queueDir, { recursive: true, force: true });
  });

  it("deve enfileirar um post individual gerando arquivo .description e copiando mídia em queue/.../pending/", async () => {
    const result = await enqueuePostForAutoSocial(postId1);
    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThanOrEqual(1);

    // Verificar se o arquivo .description foi criado
    const descFile = result.files.find((f) => f.endsWith(".description"));
    expect(descFile).toBeDefined();

    const descContent = await Bun.file(descFile!).text();
    expect(descContent).toContain("Aprenda a cuidar da sua pele antes de dormir!");

    // Verificar se o status no SQLite mudou para 'queued'
    const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId1));
    expect(updatedPost?.status).toBe("queued");
  });

  it("deve consultar o status da fila no sistema de arquivos", async () => {
    const status = await getAutoSocialQueueStatus(companyId);
    expect(status.pendingCount).toBeGreaterThanOrEqual(1);
    expect(status.publishedCount).toBe(0);
    expect(status.failedCount).toBe(0);
  });

  it("POST /api/export/autosocial/queue deve enfileirar via REST API", async () => {
    const req = new Request(`http://localhost:${server.port}/api/export/autosocial/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: postId2 }),
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.queuedCount).toBe(1);

    const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId2));
    expect(updatedPost?.status).toBe("queued");
  });

  it("GET /api/export/autosocial/status deve retornar contagens da fila", async () => {
    const req = new Request(
      `http://localhost:${server.port}/api/export/autosocial/status?companyId=${companyId}`
    );
    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.pendingCount).toBeGreaterThanOrEqual(2);
  });
});
