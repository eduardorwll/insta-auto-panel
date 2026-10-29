import { describe, expect, it, beforeAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import { companies } from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("REST API: Gestão de Empresas (/api/companies)", () => {
  beforeAll(async () => {
    // Limpeza prévia para idempotência do teste
    await db.delete(companies).where(eq(companies.id, "clinica_api_test"));
  });

  it("POST /api/companies deve criar uma nova empresa com validação de Brand Kit", async () => {
    const payload = {
      id: "clinica_api_test",
      name: "Clínica API Teste",
      instagramHandle: "@clinica_api",
      niche: "Dermatologia",
      toneOfVoice: "Científico e Elegante",
      primaryColor: "#4F46E5",
      secondaryColor: "#E11D48",
      backgroundColor: "#0F172A",
      accentColor: "#10B981",
      whatsappNumber: "5511988887777",
      whatsappDefaultMessage: "Olá! Gostaria de agendar uma consulta.",
      websiteUrl: "https://clinicaapi.com.br",
      canvaTemplateId: "DAG12345678",
    };

    const req = new Request(`http://localhost:${server.port}/api/companies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(201);

    const body = (await res.json()) as { success: boolean; data: typeof payload };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("clinica_api_test");
    expect(body.data.name).toBe("Clínica API Teste");
  });

  it("POST /api/companies deve rejeitar payload com campos obrigatórios ausentes", async () => {
    const invalidPayload = {
      id: "invalida",
    };

    const req = new Request(`http://localhost:${server.port}/api/companies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidPayload),
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(400);

    const body = (await res.json()) as { success: boolean; error: string; details: unknown };
    expect(body.success).toBe(false);
    expect(body.error).toBe("Dados inválidos");
  });

  it("GET /api/companies deve listar as empresas cadastradas", async () => {
    const req = new Request(`http://localhost:${server.port}/api/companies`);
    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { success: boolean; data: Array<{ id: string; name: string }> };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.some((c) => c.id === "clinica_api_test")).toBe(true);
  });

  it("GET /api/companies/:id deve retornar os detalhes da empresa especificada", async () => {
    const req = new Request(`http://localhost:${server.port}/api/companies/clinica_api_test`);
    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { success: boolean; data: { id: string; niche: string } };
    expect(body.success).toBe(true);
    expect(body.data.niche).toBe("Dermatologia");
  });

  it("PUT /api/companies/:id deve atualizar dados e cores do Brand Kit", async () => {
    const updatePayload = {
      name: "Clínica API Atualizada",
      primaryColor: "#2563EB",
    };

    const req = new Request(`http://localhost:${server.port}/api/companies/clinica_api_test`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as { success: boolean; data: { name: string; primaryColor: string } };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Clínica API Atualizada");
    expect(body.data.primaryColor).toBe("#2563EB");
  });

  it("DELETE /api/companies/:id deve remover a empresa", async () => {
    const req = new Request(`http://localhost:${server.port}/api/companies/clinica_api_test`, {
      method: "DELETE",
    });

    const res = await server.fetch(req);
    expect(res.status).toBe(200);

    // Conferir se GET subsequente retorna 404
    const checkReq = new Request(`http://localhost:${server.port}/api/companies/clinica_api_test`);
    const checkRes = await server.fetch(checkReq);
    expect(checkRes.status).toBe(404);
  });
});
