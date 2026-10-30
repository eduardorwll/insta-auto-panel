import { describe, it, expect, beforeEach } from "bun:test";
import { handleSchedulesRoutes } from "../../src/server/routes/schedules";
import { db, createDatabaseConnection } from "../../src/server/db/client";
import { companies, weekly_schedules, posts, post_slides } from "../../src/server/db/schema";
import { eq } from "drizzle-orm";

describe("REST API: Adicionar Posts no Cronograma (/api/posts)", () => {
  const companyId = "test_co_add_posts";
  const weekStartDate = "2026-11-02";

  beforeEach(async () => {
    await db.delete(post_slides);
    await db.delete(posts);
    await db.delete(weekly_schedules);
    await db.delete(companies);

    await db.insert(companies).values({
      id: companyId,
      name: "Empresa Teste Multi Post",
      instagramHandle: "@testemultipost",
      niche: "Tecnologia",
      toneOfVoice: "Inovador",
      primaryColor: "#6366F1",
    });
  });

  it("1. deve criar cronograma e permitir ADICIONAR um novo post via POST /api/posts", async () => {
    // Inicializa cronograma (7 posts padrão)
    const getReq = new Request(`http://localhost/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`, {
      method: "GET",
    });
    const getRes = await handleSchedulesRoutes(getReq, new URL(getReq.url));
    expect(getRes?.status).toBe(200);
    const getJson = await getRes?.json();
    expect(getJson.success).toBe(true);
    expect(getJson.data.posts.length).toBe(7);

    const scheduleId = getJson.data.schedule.id;

    // Adiciona um 2º post na Quarta-feira às 18:30
    const postReq = new Request("http://localhost/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleId,
        companyId,
        dayOfWeek: "quarta",
        scheduledTime: "18:30",
        theme: "Tendências de IA Noturna",
        category: "Autoridade",
        slideCount: 6,
      }),
    });

    const postRes = await handleSchedulesRoutes(postReq, new URL(postReq.url));
    expect(postRes?.status).toBe(201);
    const postJson = await postRes?.json();
    expect(postJson.success).toBe(true);
    expect(postJson.data.dayOfWeek).toBe("quarta");
    expect(postJson.data.scheduledTime).toBe("18:30");
    expect(postJson.data.theme).toBe("Tendências de IA Noturna");
    expect(postJson.data.slides.length).toBe(6);

    // Consulta novamente o cronograma: agora deve conter 8 posts
    const getReq2 = new Request(`http://localhost/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`, {
      method: "GET",
    });
    const getRes2 = await handleSchedulesRoutes(getReq2, new URL(getReq2.url));
    const getJson2 = await getRes2?.json();
    expect(getJson2.data.posts.length).toBe(8);

    // Na quarta-feira deve haver 2 posts (09:00 e 18:30 ordenados)
    const quartaPosts = getJson2.data.posts.filter((p: any) => p.dayOfWeek === "quarta");
    expect(quartaPosts.length).toBe(2);
    expect(quartaPosts[0].scheduledTime).toBe("09:00");
    expect(quartaPosts[1].scheduledTime).toBe("18:30");
  });

  it("2. deve excluir post via DELETE /api/posts/:id e remover lâminas associadas", async () => {
    // Inicializa
    const getReq = new Request(`http://localhost/api/schedules?companyId=${companyId}&weekStartDate=${weekStartDate}`, {
      method: "GET",
    });
    const getRes = await handleSchedulesRoutes(getReq, new URL(getReq.url));
    const getJson = await getRes?.json();
    const scheduleId = getJson.data.schedule.id;

    // Cria post
    const postReq = new Request("http://localhost/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleId,
        companyId,
        dayOfWeek: "sexta",
        scheduledTime: "20:00",
        theme: "Post para Deletar",
      }),
    });
    const postRes = await handleSchedulesRoutes(postReq, new URL(postReq.url));
    const postJson = await postRes?.json();
    const createdId = postJson.data.id;

    // Deleta o post
    const delReq = new Request(`http://localhost/api/posts/${createdId}`, {
      method: "DELETE",
    });
    const delRes = await handleSchedulesRoutes(delReq, new URL(delReq.url));
    expect(delRes?.status).toBe(200);

    // Verifica que post e slides foram removidos
    const [p] = await db.select().from(posts).where(eq(posts.id, createdId));
    expect(p).toBeUndefined();
    const s = await db.select().from(post_slides).where(eq(post_slides.postId, createdId));
    expect(s.length).toBe(0);
  });
});
