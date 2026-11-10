import { z } from "zod";
import {
  buildLogoutCookieHeader,
  buildSessionCookieHeader,
  checkLoginRateLimit,
  clearLoginFailures,
  createSessionToken,
  extractSessionFromRequest,
  isAuthEnforced,
  recordLoginFailure,
  verifyAdminCredentials,
} from "../services/auth/session";

const loginSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function handleAuthRoutes(req: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. GET /api/auth/me
  if (req.method === "GET" && pathname === "/api/auth/me") {
    const session = extractSessionFromRequest(req);
    return Response.json({
      success: true,
      data: {
        authenticated: session.valid,
        username: session.username,
        authRequired: isAuthEnforced(req),
      },
    });
  }

  // 2. POST /api/auth/login
  if (req.method === "POST" && pathname === "/api/auth/login") {
    const clientIp = getClientIp(req);
    const rateCheck = checkLoginRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return Response.json(
        {
          success: false,
          error: `Muitas tentativas de login. Aguarde ${rateCheck.retryAfterSeconds ?? 60}s antes de tentar novamente.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds ?? 60) },
        }
      );
    }

    try {
      const body = await req.json();
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json(
          { success: false, error: "Credenciais inválidas." },
          { status: 400 }
        );
      }

      const valid = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
      if (!valid) {
        recordLoginFailure(clientIp);
        return Response.json(
          { success: false, error: "Usuário ou senha incorretos." },
          { status: 401 }
        );
      }

      clearLoginFailures(clientIp);
      const token = createSessionToken(parsed.data.username);

      return Response.json(
        {
          success: true,
          data: {
            authenticated: true,
            username: parsed.data.username,
          },
        },
        {
          status: 200,
          headers: {
            "Set-Cookie": buildSessionCookieHeader(token),
          },
        }
      );
    } catch {
      return Response.json(
        { success: false, error: "Erro ao processar login." },
        { status: 400 }
      );
    }
  }

  // 3. POST /api/auth/logout
  if (req.method === "POST" && pathname === "/api/auth/logout") {
    return Response.json(
      {
        success: true,
        data: { authenticated: false, username: null },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": buildLogoutCookieHeader(),
        },
      }
    );
  }

  return null;
}
