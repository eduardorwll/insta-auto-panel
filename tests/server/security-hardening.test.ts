import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { server } from "@/server/index";
import { db } from "@/server/db/client";
import { companies } from "@/server/db/schema";
import { eq } from "drizzle-orm";

describe("Auditoria de Segurança & Security Hardening (OWASP Top 10 + ASVS)", () => {
  const baseUrl = `http://localhost:${server.port}`;
  const testCompanyId = "sec_test_corp";

  beforeAll(async () => {
    // Insere empresa temporária para os testes de segurança
    await db.insert(companies).values({
      id: testCompanyId,
      name: "Security Test Corp",
      instagramHandle: "@sectest",
      niche: "Segurança",
      toneOfVoice: "Formal",
    }).onConflictDoNothing();
  });

  afterAll(async () => {
    await db.delete(companies).where(eq(companies.id, testCompanyId));
  });

  test("OWASP A02: GET /api/settings deve mascarar e não vazar cookies de sessão do Instagram em plaintext", async () => {
    const res = await fetch(`${baseUrl}/api/settings?companyId=${testCompanyId}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: Record<string, unknown>;
    };

    expect(body.success).toBe(true);
    // Deve conter identificadores seguros
    expect(body.data.companyId).toBe(testCompanyId);
    expect(body.data.hasSessionCookie).toBeDefined();

    // NÃO deve conter o sessionid completo em plaintext ou o array de cookies bruto
    expect(body.data.instagramSessionId).toBeUndefined();
    expect(body.data.instagramCookiesJson).toBeUndefined();
    expect(body.data.imageProviderApiKey).toBeUndefined();

    // Se houver máscara, deve ser formatada com reticências
    if (body.data.instagramSessionIdMasked) {
      expect(String(body.data.instagramSessionIdMasked)).toContain("...");
    }
  });

  test("OWASP A02: GET /api/ai/settings deve mascarar chaves de API de terceiros", async () => {
    const res = await fetch(`${baseUrl}/api/ai/settings`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: {
        provider: string;
        apiKey?: string | null;
        hasApiKey?: boolean;
      };
    };

    expect(body.success).toBe(true);
    if (body.data.apiKey) {
      expect(body.data.apiKey).toContain("...");
    }
  });

  test("OWASP A04: POST /api/photos/upload deve rejeitar extensões perigosas (ex: .html, .svg, .js)", async () => {
    const form = new FormData();
    const maliciousBlob = new Blob(["<script>alert(1)</script>"], { type: "text/html" });
    form.append("file", maliciousBlob, "exploit.html");
    form.append("companyId", "demo_corp");
    form.append("category", "INSTITUCIONAL");

    const res = await fetch(`${baseUrl}/api/photos/upload`, {
      method: "POST",
      body: form,
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: string };
    expect(body.success).toBe(false);
    expect(body.error).toContain("Formato de arquivo não permitido");
  });

  test("OWASP A01: Servidor de estáticos deve conter proteção anti-path traversal em /uploads/ e /renders/", async () => {
    const resUpload = await fetch(`${baseUrl}/uploads/../../package.json`);
    const textUpload = await resUpload.text();
    expect(textUpload).not.toContain('"name": "insta-auto-panel"');

    // Testar que acesso com tentativa de escape não expõe arquivos do sistema
    const resRender = await fetch(`${baseUrl}/renders/../../package.json`);
    const textRender = await resRender.text();
    expect(textRender).not.toContain('"name": "insta-auto-panel"');
  });

  test("OWASP A05: Respostas do servidor devem incluir headers de segurança defensivos", async () => {
    const res = await fetch(`${baseUrl}/uploads/nonexistent.png`);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
});
