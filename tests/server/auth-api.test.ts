import { describe, expect, it, beforeEach } from "bun:test";
import { server } from "@/server/index";
import { resetLoginRateLimiter } from "@/server/services/auth/session";

describe("Home Server Security & Authentication (/api/auth - SEC-01)", () => {
  beforeEach(() => {
    resetLoginRateLimiter();
  });

  it("deve bloquear acesso a rotas protegidas (/api/companies) com 401 quando autenticação está ativa e sem cookie", async () => {
    const res = await server.fetch(
      new Request(`http://localhost:${server.port}/api/companies`, {
        headers: { "x-enforce-auth": "1" },
      })
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as { success: boolean; error: string };
    expect(body.success).toBe(false);
  });

  it("GET /api/auth/me deve retornar authenticated: false sem cookie válido", async () => {
    const res = await server.fetch(
      new Request(`http://localhost:${server.port}/api/auth/me`)
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { authenticated: boolean; username: string | null };
    };
    expect(body.success).toBe(true);
    expect(body.data.authenticated).toBe(false);
  });

  it("POST /api/auth/login deve autenticar com credenciais válidas, emitir cookie HttpOnly e liberar rotas protegidas", async () => {
    const loginRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: process.env.PANEL_ADMIN_USER || "admin",
          password: process.env.PANEL_ADMIN_PASSWORD || "admin123",
        }),
      })
    );
    expect(loginRes.status).toBe(200);
    const setCookie = loginRes.headers.get("set-cookie") || "";
    expect(setCookie).toContain("social_panel_session=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");

    const cookiePair = setCookie.split(";")[0] || "";

    // Verificar /api/auth/me com o cookie
    const meRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/auth/me`, {
        headers: { Cookie: cookiePair },
      })
    );
    const meBody = (await meRes.json()) as {
      success: boolean;
      data: { authenticated: boolean; username: string | null };
    };
    expect(meBody.data.authenticated).toBe(true);
    expect(meBody.data.username).toBe("admin");

    // Verificar acesso à rota protegida com cookie + x-enforce-auth
    const protectedRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/companies`, {
        headers: {
          "x-enforce-auth": "1",
          Cookie: cookiePair,
        },
      })
    );
    expect(protectedRes.status).toBe(200);

    // POST /api/auth/logout deve limpar o cookie
    const logoutRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/auth/logout`, {
        method: "POST",
        headers: { Cookie: cookiePair },
      })
    );
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("POST /api/auth/login deve rejeitar senha incorreta (401) e aplicar rate-limit (429) após 5 tentativas falhas", async () => {
    for (let i = 1; i <= 5; i++) {
      const failRes = await server.fetch(
        new Request(`http://localhost:${server.port}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "192.168.1.50",
          },
          body: JSON.stringify({ username: "admin", password: "wrong-password" }),
        })
      );
      expect(failRes.status).toBe(401);
    }

    // 6ª tentativa deve retornar 429 Too Many Requests
    const blockedRes = await server.fetch(
      new Request(`http://localhost:${server.port}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "192.168.1.50",
        },
        body: JSON.stringify({ username: "admin", password: "wrong-password" }),
      })
    );
    expect(blockedRes.status).toBe(429);
  });
});
