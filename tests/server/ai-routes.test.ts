import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import {
  companies,
  weekly_schedules,
  posts,
  post_slides,
  ai_provider_settings,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("REST API: Módulo de IA Generativa Agnóstica (/api/ai)", () => {
  const testCompanyId = "empresa_ai_route_test";
  let postId = "";

  beforeAll(async () => {
    // 1. Setup empresa
    await db.delete(companies).where(eq(companies.id, testCompanyId));
    await db.insert(companies).values({
      id: testCompanyId,
      name: "Empresa AI Test",
      instagramHandle: "@empresa_ai",
      niche: "Inteligência Artificial",
      toneOfVoice: "Inovador e Técnico",
      whatsappNumber: "5511999990000",
    });

    // 2. Setup schedule e post com 5 lâminas
    const schedId = `sched_${testCompanyId}_20261102`;
    await db.delete(weekly_schedules).where(eq(weekly_schedules.id, schedId));
    await db.insert(weekly_schedules).values({
      id: schedId,
      companyId: testCompanyId,
      weekStartDate: "2026-11-02",
    });

    postId = `post_${schedId}_segunda`;
    await db.insert(posts).values({
      id: postId,
      scheduleId: schedId,
      companyId: testCompanyId,
      dayOfWeek: "segunda",
      theme: "O Futuro dos Agentes Autônomos",
      category: "Dica Prática",
      slideCount: 5,
      status: "draft",
    });

    for (let i = 1; i <= 5; i++) {
      await db.insert(post_slides).values({
        id: `slide_${postId}_${i}`,
        postId,
        slideNumber: i,
        title: `Slide ${i}`,
        bodyText: `Texto ${i}`,
      });
    }
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, testCompanyId));
  });

  it("GET /api/ai/settings deve retornar configurações ativas", async () => {
    const req = new Request(`http://localhost:${server.port}/api/ai/settings`);
    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.provider).toBeDefined();
  });

  it("PUT /api/ai/settings deve salvar configuração de ML Studio API", async () => {
    const payload = {
      id: "global",
      provider: "mlstudio",
      modelName: "llama-3.1-8b-instruct",
      baseUrl: "http://localhost:1234/v1",
      temperature: 0.6,
      isActive: 1,
    };

    const req = new Request(`http://localhost:${server.port}/api/ai/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.provider).toBe("mlstudio");
    expect(body.data.modelName).toBe("llama-3.1-8b-instruct");
    expect(body.data.baseUrl).toBe("http://localhost:1234/v1");
  });

  it("POST /api/ai/test-connection deve executar teste de conexão com o provedor", async () => {
    const payload = {
      provider: "mlstudio",
      modelName: "llama-3",
      baseUrl: "http://127.0.0.1:9999/v1", // porta inexistente para validar captura do erro de rede
    };

    const req = new Request(`http://localhost:${server.port}/api/ai/test-connection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    // Como porta 9999 não está rodando, espera-se success: false com mensagem tratada
    expect(body.success).toBe(false);
    expect(body.message).toBeDefined();
  });
});
