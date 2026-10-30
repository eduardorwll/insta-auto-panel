import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import { companies, weekly_schedules, posts, post_slides, photo_assets } from "@/server/db/schema";
import { enqueuePostForAutoSocial } from "@/server/services/export/autosocial";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

describe("Separação por Horário e Isolamento Estrito de Tenants em Posts e AutoSocial", () => {
  const companyA = "tenant_a_test";
  const companyB = "tenant_b_test";
  const testWeekDate = "2026-11-09";
  let postAId: string;

  beforeAll(async () => {
    // Limpar estado prévio
    await db.delete(companies).where(eq(companies.id, companyA));
    await db.delete(companies).where(eq(companies.id, companyB));

    // Criar Tenant A
    await db.insert(companies).values({
      id: companyA,
      name: "Clínica Dental A",
      instagramHandle: "@clinica_a",
      niche: "Odontologia",
      toneOfVoice: "Profissional",
    });

    // Criar Tenant B
    await db.insert(companies).values({
      id: companyB,
      name: "Restaurante B",
      instagramHandle: "@restaurante_b",
      niche: "Gastronomia",
      toneOfVoice: "Descontraído",
    });

    // Criar foto estrita para Tenant A
    await db.insert(photo_assets).values({
      id: "photo_tenant_a_1",
      companyId: companyA,
      filename: "dentista_dra_a.jpg",
      originalName: "Dra A Atendimento",
      filePath: "/uploads/dentista_dra_a.jpg",
      category: "Especialista",
      tags: JSON.stringify(["dentista", "consultorio"]),
    });

    // Criar foto estrita para Tenant B
    await db.insert(photo_assets).values({
      id: "photo_tenant_b_1",
      companyId: companyB,
      filename: "prato_gourmet_b.jpg",
      originalName: "Prato do Chef",
      filePath: "/uploads/prato_gourmet_b.jpg",
      category: "Produto",
      tags: JSON.stringify(["comida", "chef"]),
    });
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, companyA));
    await db.delete(companies).where(eq(companies.id, companyB));
  });

  it("1. GET /api/schedules deve inicializar posts com scheduledTime padrão '09:00'", async () => {
    const req = new Request(
      `http://localhost:${server.port}/api/schedules?companyId=${companyA}&weekStartDate=${testWeekDate}`
    );
    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { success: boolean; data: any };
    expect(body.success).toBe(true);
    expect(body.data.posts.length).toBe(7);

    // Valida que cada post tem scheduledTime
    for (const post of body.data.posts) {
      expect(post.scheduledTime).toBeDefined();
      expect(post.scheduledTime).toBe("09:00");
    }

    postAId = body.data.posts[0].id;
  });

  it("2. PUT /api/posts/:id deve atualizar o horário programado (scheduledTime)", async () => {
    expect(postAId).toBeDefined();

    const updateReq = new Request(`http://localhost:${server.port}/api/posts/${postAId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: "5 Cuidados com a Saúde Bucal",
        scheduledTime: "18:30",
        category: "Dica Prática",
      }),
    });

    const updateRes = await server.fetch(updateReq);
    expect(updateRes.status).toBe(200);

    const updateBody = (await updateRes.json()) as { success: boolean; data: any };
    expect(updateBody.success).toBe(true);
    expect(updateBody.data.scheduledTime).toBe("18:30");
    expect(updateBody.data.theme).toBe("5 Cuidados com a Saúde Bucal");

    // Verificar persistência no banco
    const [persisted] = await db.select().from(posts).where(eq(posts.id, postAId));
    expect(persisted).toBeDefined();
    expect(persisted?.scheduledTime).toBe("18:30");
  });

  it("3. enqueuePostForAutoSocial deve registrar o horário agendado no arquivo sidecar .description", async () => {
    const result = await enqueuePostForAutoSocial(postAId);
    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThan(0);

    // Encontrar arquivo .description gerado
    const descFile = result.files.find((f) => f.endsWith(".description"));
    expect(descFile).toBeDefined();

    const content = await Bun.file(descFile!).text();
    // Deve conter tag ou menção ao horário agendado
    expect(content).toContain("18:30");
  });

  it("4. Isolamento Estrito de Fotos entre Tenants (Zero Vazamento)", async () => {
    // Tenant A só enxerga fotos de Tenant A
    const reqA = new Request(`http://localhost:${server.port}/api/photos?companyId=${companyA}`);
    const resA = await server.fetch(reqA);
    const bodyA = (await resA.json()) as { success: boolean; data: any[] };
    expect(bodyA.success).toBe(true);
    expect(bodyA.data.every((p) => p.companyId === companyA)).toBe(true);
    expect(bodyA.data.some((p) => p.companyId === companyB)).toBe(false);

    // Tenant B só enxerga fotos de Tenant B
    const reqB = new Request(`http://localhost:${server.port}/api/photos?companyId=${companyB}`);
    const resB = await server.fetch(reqB);
    const bodyB = (await resB.json()) as { success: boolean; data: any[] };
    expect(bodyB.success).toBe(true);
    expect(bodyB.data.every((p) => p.companyId === companyB)).toBe(true);
    expect(bodyB.data.some((p) => p.companyId === companyA)).toBe(false);
  });
});
