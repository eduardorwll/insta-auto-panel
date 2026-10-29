import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import { companies, weekly_schedules, posts, post_slides } from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("REST API: Cronograma Semanal, Posts e Lâminas Dinâmicas (/api/schedules)", () => {
  const testCompanyId = "empresa_sched_test";
  const testWeekDate = "2026-11-02";

  beforeAll(async () => {
    await db.delete(companies).where(eq(companies.id, testCompanyId));
    await db.insert(companies).values({
      id: testCompanyId,
      name: "Empresa Sched Test",
      instagramHandle: "@schedtest",
      niche: "Fitness",
      toneOfVoice: "Motivacional",
    });
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, testCompanyId));
  });

  it("GET /api/schedules deve inicializar automaticamente 7 dias com 5 lâminas padrão", async () => {
    const req = new Request(
      `http://localhost:${server.port}/api/schedules?companyId=${testCompanyId}&weekStartDate=${testWeekDate}`
    );

    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.schedule).toBeDefined();
    expect(body.data.posts.length).toBe(7);

    // Valida dias da semana presentes
    const days = body.data.posts.map((p: any) => p.dayOfWeek);
    expect(days).toEqual(["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]);

    // Valida que cada post possui 5 slides por padrão
    expect(body.data.posts[0].slideCount).toBe(5);
    expect(body.data.posts[0].slides.length).toBe(5);
  });

  it("PUT /api/posts/:id deve atualizar tema, categoria e sincronizar slideCount de 3 a 10", async () => {
    // 1. Obter o post de quarta-feira
    const schedReq = new Request(
      `http://localhost:${server.port}/api/schedules?companyId=${testCompanyId}&weekStartDate=${testWeekDate}`
    );
    const schedRes = await server.fetch(schedReq);
    const schedBody = await schedRes.json();
    const quartaPost = schedBody.data.posts.find((p: any) => p.dayOfWeek === "quarta");
    expect(quartaPost).toBeDefined();

    // 2. Tentar atualizar para slideCount inválido (< 3)
    const invalidReq = new Request(`http://localhost:${server.port}/api/posts/${quartaPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideCount: 2 }),
    });
    const invalidRes = await server.fetch(invalidReq);
    expect(invalidRes.status).toBe(400);

    // 3. Atualizar para 8 lâminas dinâmicas
    const validReq = new Request(`http://localhost:${server.port}/api/posts/${quartaPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: "8 Exercícios Fundamentais",
        category: "Tutorial",
        slideCount: 8,
      }),
    });
    const validRes = await server.fetch(validReq);
    expect(validRes.status).toBe(200);

    const validBody = await validRes.json();
    expect(validBody.success).toBe(true);
    expect(validBody.data.slideCount).toBe(8);
    expect(validBody.data.slides.length).toBe(8);
    expect(validBody.data.theme).toBe("8 Exercícios Fundamentais");
  });

  it("PUT e GET /api/posts/:id/slides deve gerenciar o conteúdo das lâminas", async () => {
    const schedReq = new Request(
      `http://localhost:${server.port}/api/schedules?companyId=${testCompanyId}&weekStartDate=${testWeekDate}`
    );
    const schedRes = await server.fetch(schedReq);
    const schedBody = await schedRes.json();
    const quartaPost = schedBody.data.posts.find((p: any) => p.dayOfWeek === "quarta");

    // Atualizar textos do Slide 1 (Capa) e Slide 8 (CTA)
    const updatedSlides = quartaPost.slides.map((s: any) => {
      if (s.slideNumber === 1) {
        return { ...s, title: "Você Treina Errado?", bodyText: "Descubra os 8 erros mais comuns." };
      }
      if (s.slideNumber === 8) {
        return { ...s, title: "Gostou?", ctaText: "Envie uma mensagem no WhatsApp para consultoria!" };
      }
      return s;
    });

    const putReq = new Request(`http://localhost:${server.port}/api/posts/${quartaPost.id}/slides`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides: updatedSlides }),
    });
    const putRes = await server.fetch(putReq);
    expect(putRes.status).toBe(200);

    // Recuperar e validar
    const getReq = new Request(`http://localhost:${server.port}/api/posts/${quartaPost.id}/slides`);
    const getRes = await server.fetch(getReq);
    expect(getRes.status).toBe(200);

    const getBody = await getRes.json();
    const slide1 = getBody.data.find((s: any) => s.slideNumber === 1);
    const slide8 = getBody.data.find((s: any) => s.slideNumber === 8);

    expect(slide1?.title).toBe("Você Treina Errado?");
    expect(slide8?.ctaText).toBe("Envie uma mensagem no WhatsApp para consultoria!");
  });
});
