import { eq } from "drizzle-orm";
import { db } from "../db/client";
import {
  companies,
  company_settings,
  designTemplateSchema,
  imageProviderSchema,
} from "../db/schema";
import fs from "node:fs/promises";
import path from "node:path";

interface CookieEntry {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;
}

/**
 * Extrai sessionid, csrftoken e ds_user_id a partir de um JSON de cookies
 * (EditThisCookie, Cookie-Editor ou Playwright storageState) ou de campos diretos.
 */
function parseInstagramCookiesInput(input: {
  cookiesJson?: string | null;
  sessionId?: string | null;
  csrfToken?: string | null;
  dsUserId?: string | null;
}): {
  sessionId: string;
  csrfToken: string;
  dsUserId: string;
  normalizedCookies: CookieEntry[];
} {
  let sessionId = (input.sessionId || "").trim();
  let csrfToken = (input.csrfToken || "").trim();
  let dsUserId = (input.dsUserId || "").trim();
  const normalizedCookies: CookieEntry[] = [];

  if (input.cookiesJson && input.cookiesJson.trim()) {
    try {
      const parsed = JSON.parse(input.cookiesJson.trim());
      const list: Record<string, unknown>[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.cookies)
          ? parsed.cookies
          : [];

      for (const item of list) {
        const name = String(item.name || "");
        const value = String(item.value || "");
        if (!name || !value) continue;

        normalizedCookies.push({
          name,
          value,
          domain: String(item.domain || ".instagram.com"),
          path: String(item.path || "/"),
          httpOnly: Boolean(item.httpOnly ?? name === "sessionid"),
          secure: Boolean(item.secure ?? true),
          sameSite: "Lax",
          expires:
            typeof item.expires === "number"
              ? item.expires
              : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90,
        });

        if (name === "sessionid" && !sessionId) sessionId = value;
        if (name === "csrftoken" && !csrfToken) csrfToken = value;
        if (name === "ds_user_id" && !dsUserId) dsUserId = value;
      }
    } catch {
      throw new Error(
        "O JSON de cookies fornecido é inválido. Cole um array JSON exportado pelo Cookie-Editor / EditThisCookie ou preencha o campo sessionid diretamente."
      );
    }
  }

  // Se o usuário preencheu sessionId direto e ainda não está na lista normalizada
  if (sessionId && !normalizedCookies.some((c) => c.name === "sessionid")) {
    normalizedCookies.push({
      name: "sessionid",
      value: sessionId,
      domain: ".instagram.com",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90,
    });
  }

  // Se dsUserId não veio explícito mas sessionid começa com "<ds_user_id>%3A" ou "<ds_user_id>:"
  if (!dsUserId && sessionId) {
    const decoded = decodeURIComponent(sessionId);
    const prefix = decoded.split(":")[0];
    if (prefix && /^\d+$/.test(prefix)) {
      dsUserId = prefix;
    }
  }

  if (csrfToken && !normalizedCookies.some((c) => c.name === "csrftoken")) {
    normalizedCookies.push({
      name: "csrftoken",
      value: csrfToken,
      domain: ".instagram.com",
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90,
    });
  }

  if (dsUserId && !normalizedCookies.some((c) => c.name === "ds_user_id")) {
    normalizedCookies.push({
      name: "ds_user_id",
      value: dsUserId,
      domain: ".instagram.com",
      path: "/",
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90,
    });
  }

  return { sessionId, csrfToken, dsUserId, normalizedCookies };
}

/**
 * Garante registro padrão em company_settings para uma empresa existente
 */
async function ensureCompanySettingsRow(companyId: string) {
  const [existing] = await db
    .select()
    .from(company_settings)
    .where(eq(company_settings.companyId, companyId));

  if (existing) return existing;

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId));

  if (!company) return null;

  const defaultRow = {
    companyId,
    instagramSessionId: null,
    instagramCsrfToken: null,
    instagramDsUserId: null,
    instagramCookiesJson: null,
    instagramSessionStatus: "unconfigured",
    instagramLastVerifiedAt: null,
    preferredImageProvider: "pollinations",
    imageProviderApiKey: null,
    imageProviderBaseUrl: "http://localhost:8188",
    autosocialQueuePath: "data/autosocial/queue",
    defaultTemplateId: "modern-bold",
    updatedAt: new Date(),
  };

  await db.insert(company_settings).values(defaultRow);
  return defaultRow;
}

export async function handleSettingsRoutes(
  req: Request,
  url: URL
): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/settings")) {
    return null;
  }

  // 1. GET /api/settings?companyId=...
  if (req.method === "GET" && url.pathname === "/api/settings") {
    const companyId = url.searchParams.get("companyId");
    if (!companyId) {
      return Response.json(
        { success: false, error: "Parâmetro companyId é obrigatório" },
        { status: 400 }
      );
    }

    const row = await ensureCompanySettingsRow(companyId);
    if (!row) {
      return Response.json(
        { success: false, error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    const profileDir = path.resolve(
      import.meta.dirname,
      `../../../data/autosocial/.profiles/${companyId}/instagram`
    );

    return Response.json({
      success: true,
      data: {
        ...row,
        hasSessionCookie: Boolean(row.instagramSessionId),
        instagramSessionIdMasked: row.instagramSessionId
          ? `${row.instagramSessionId.slice(0, 6)}...${row.instagramSessionId.slice(-4)}`
          : null,
        hasImageApiKey: Boolean(row.imageProviderApiKey),
        profileDir,
      },
    });
  }

  // 2. PUT /api/settings/instagram-cookies
  if (req.method === "PUT" && url.pathname === "/api/settings/instagram-cookies") {
    try {
      const body = (await req.json()) as {
        companyId?: string;
        cookiesJson?: string;
        sessionId?: string;
        csrfToken?: string;
        dsUserId?: string;
      };

      if (!body.companyId) {
        return Response.json(
          { success: false, error: "companyId é obrigatório" },
          { status: 400 }
        );
      }

      const existing = await ensureCompanySettingsRow(body.companyId);
      if (!existing) {
        return Response.json(
          { success: false, error: "Empresa não encontrada" },
          { status: 404 }
        );
      }

      const parsed = parseInstagramCookiesInput({
        cookiesJson: body.cookiesJson,
        sessionId: body.sessionId,
        csrfToken: body.csrfToken,
        dsUserId: body.dsUserId,
      });

      if (!parsed.sessionId) {
        return Response.json(
          {
            success: false,
            error:
              "Cookie 'sessionid' não encontrado. Informe o sessionid do Instagram ou cole o JSON de cookies completo.",
          },
          { status: 400 }
        );
      }

      const profileDir = path.resolve(
        import.meta.dirname,
        `../../../data/autosocial/.profiles/${body.companyId}/instagram`
      );
      await fs.mkdir(profileDir, { recursive: true });

      const cookiesFilePath = path.join(profileDir, "cookies.json");
      const storageStatePath = path.join(profileDir, "storageState.json");

      const serializedCookies = JSON.stringify(parsed.normalizedCookies, null, 2);
      const playwrightStorageState = JSON.stringify(
        {
          cookies: parsed.normalizedCookies,
          origins: [
            {
              origin: "https://www.instagram.com",
              localStorage: [],
            },
          ],
        },
        null,
        2
      );

      await fs.writeFile(cookiesFilePath, serializedCookies, "utf-8");
      await fs.writeFile(storageStatePath, playwrightStorageState, "utf-8");

      const now = new Date();
      await db
        .update(company_settings)
        .set({
          instagramSessionId: parsed.sessionId,
          instagramCsrfToken: parsed.csrfToken || null,
          instagramDsUserId: parsed.dsUserId || null,
          instagramCookiesJson: serializedCookies,
          instagramSessionStatus: "active",
          instagramLastVerifiedAt: now,
          updatedAt: now,
        })
        .where(eq(company_settings.companyId, body.companyId));

      return Response.json({
        success: true,
        sessionStatus: "active",
        dsUserId: parsed.dsUserId || null,
        csrfTokenPresent: Boolean(parsed.csrfToken),
        profileDir,
        filesWritten: [cookiesFilePath, storageStatePath],
      });
    } catch (error) {
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Falha ao processar cookies do Instagram",
        },
        { status: 400 }
      );
    }
  }

  // 3. POST /api/settings/instagram-browser-profile
  if (
    req.method === "POST" &&
    url.pathname === "/api/settings/instagram-browser-profile"
  ) {
    const body = (await req.json()) as { companyId?: string };
    if (!body.companyId) {
      return Response.json(
        { success: false, error: "companyId é obrigatório" },
        { status: 400 }
      );
    }

    const existing = await ensureCompanySettingsRow(body.companyId);
    if (!existing) {
      return Response.json(
        { success: false, error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    const profileDir = path.resolve(
      import.meta.dirname,
      `../../../data/autosocial/.profiles/${body.companyId}/instagram`
    );
    await fs.mkdir(profileDir, { recursive: true });

    const readmePath = path.join(profileDir, "PROFILE_README.json");
    await fs.writeFile(
      readmePath,
      JSON.stringify(
        {
          companyId: body.companyId,
          engine: "Katzca/AutoSocial Chromium Persistent Context",
          initializedAt: new Date().toISOString(),
          storageStateFile: path.join(profileDir, "storageState.json"),
          cookiesFile: path.join(profileDir, "cookies.json"),
        },
        null,
        2
      ),
      "utf-8"
    );

    return Response.json({
      success: true,
      companyId: body.companyId,
      profileDir,
      message:
        "Diretório de perfil Chromium persistente inicializado para o Katzca/AutoSocial.",
    });
  }

  // 4. PUT /api/settings/app
  if (req.method === "PUT" && url.pathname === "/api/settings/app") {
    try {
      const body = (await req.json()) as {
        companyId?: string;
        preferredImageProvider?: string;
        imageProviderApiKey?: string | null;
        imageProviderBaseUrl?: string;
        defaultTemplateId?: string;
        autosocialQueuePath?: string;
      };

      if (!body.companyId) {
        return Response.json(
          { success: false, error: "companyId é obrigatório" },
          { status: 400 }
        );
      }

      const existing = await ensureCompanySettingsRow(body.companyId);
      if (!existing) {
        return Response.json(
          { success: false, error: "Empresa não encontrada" },
          { status: 404 }
        );
      }

      const preferredImageProvider = body.preferredImageProvider
        ? imageProviderSchema.parse(body.preferredImageProvider)
        : existing.preferredImageProvider || "pollinations";

      const defaultTemplateId = body.defaultTemplateId
        ? designTemplateSchema.parse(body.defaultTemplateId)
        : existing.defaultTemplateId || "modern-bold";

      const imageProviderBaseUrl =
        body.imageProviderBaseUrl?.trim() ||
        existing.imageProviderBaseUrl ||
        "http://localhost:8188";

      const autosocialQueuePath =
        body.autosocialQueuePath?.trim() ||
        existing.autosocialQueuePath ||
        "data/autosocial/queue";

      const imageProviderApiKey =
        body.imageProviderApiKey !== undefined
          ? body.imageProviderApiKey
          : existing.imageProviderApiKey;

      await db
        .update(company_settings)
        .set({
          preferredImageProvider,
          imageProviderApiKey,
          imageProviderBaseUrl,
          defaultTemplateId,
          autosocialQueuePath,
          updatedAt: new Date(),
        })
        .where(eq(company_settings.companyId, body.companyId));

      const updated = await ensureCompanySettingsRow(body.companyId);
      return Response.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Erro ao salvar configurações da aplicação",
        },
        { status: 400 }
      );
    }
  }

  return null;
}
