import { eq } from "drizzle-orm";
import { db } from "../db/client";
import {
  companies,
  company_settings,
  designTemplateSchema,
  imageProviderSchema,
} from "../db/schema";
import fs from "node:fs/promises";
import {
  evaluateInstagramSessionState,
  type CookieLike,
} from "../../shared/state-machines/instagram-session.machine";
import path from "node:path";
import { parseInstagramCookiesInput } from "../services/instagram/cookies";
import {
  getApiUsageRules,
  getApiUsageSummary,
  upsertApiUsageRules,
} from "../services/ai/quota-guard";

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

/**
 * Deriva o estado real da sessão a partir de cookies.json (expiração do sessionid)
 * e persiste a transição (active -> expired) quando aplicável.
 */
async function reconcileSessionStatus(
  row: NonNullable<Awaited<ReturnType<typeof ensureCompanySettingsRow>>>,
  companyId: string
) {
  if (row.instagramSessionStatus === "unconfigured" || !row.instagramCookiesJson) return row;
  let cookies: CookieLike[] | null = null;
  try {
    cookies = JSON.parse(row.instagramCookiesJson) as CookieLike[];
  } catch {
    cookies = null;
  }
  const next = evaluateInstagramSessionState(cookies);
  if (next === row.instagramSessionStatus) return row;
  await db
    .update(company_settings)
    .set({ instagramSessionStatus: next, updatedAt: new Date() })
    .where(eq(company_settings.companyId, companyId));
  return { ...row, instagramSessionStatus: next };
}

const SAFE_COMPANY_ID_REGEX = /^[a-z0-9_-]+$/;

function isValidCompanyId(companyId: string | undefined | null): companyId is string {
  return Boolean(companyId && SAFE_COMPANY_ID_REGEX.test(companyId));
}

function sanitizeCompanySettings(
  row: NonNullable<Awaited<ReturnType<typeof ensureCompanySettingsRow>>>,
  companyId: string
) {
  const profileDir = path.resolve(
    import.meta.dirname,
    `../../../data/autosocial/.profiles/${companyId}/instagram`
  );

  const {
    instagramSessionId,
    instagramCookiesJson,
    imageProviderApiKey,
    ...safeRow
  } = row;

  return {
    ...safeRow,
    hasSessionCookie: Boolean(instagramSessionId),
    instagramSessionIdMasked: instagramSessionId
      ? `${instagramSessionId.slice(0, 6)}...${instagramSessionId.slice(-4)}`
      : null,
    hasImageApiKey: Boolean(imageProviderApiKey),
    profileDir,
  };
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
    if (!isValidCompanyId(companyId)) {
      return Response.json(
        { success: false, error: "Parâmetro companyId é obrigatório e deve ser um slug válido" },
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

    const evaluated = await reconcileSessionStatus(row, companyId);
    return Response.json({
      success: true,
      data: sanitizeCompanySettings(evaluated, companyId),
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

      if (!isValidCompanyId(body.companyId)) {
        return Response.json(
          { success: false, error: "companyId é obrigatório e deve ser um slug válido" },
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

      await fs.writeFile(cookiesFilePath, serializedCookies, { encoding: "utf-8", mode: 0o600 });
      await fs.writeFile(storageStatePath, playwrightStorageState, { encoding: "utf-8", mode: 0o600 });

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
    if (!isValidCompanyId(body.companyId)) {
      return Response.json(
        { success: false, error: "companyId é obrigatório e deve ser um slug válido" },
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

      if (!isValidCompanyId(body.companyId)) {
        return Response.json(
          { success: false, error: "companyId é obrigatório e deve ser um slug válido" },
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
      if (!updated) {
        return Response.json(
          { success: false, error: "Erro ao recuperar configuração atualizada" },
          { status: 500 }
        );
      }
      return Response.json({
        success: true,
        data: sanitizeCompanySettings(updated, body.companyId),
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

  // 4. GET /api/settings/quotas?companyId=...
  if (url.pathname === "/api/settings/quotas" && req.method === "GET") {
    const companyId = url.searchParams.get("companyId") || "global";
    if (!isValidCompanyId(companyId)) {
      return Response.json(
        { success: false, error: "companyId possui formato inválido" },
        { status: 400 }
      );
    }
    const rules = await getApiUsageRules(companyId);
    const summary = await getApiUsageSummary(companyId);
    return Response.json({
      success: true,
      data: { rules, summary },
    });
  }

  // 5. PUT /api/settings/quotas
  if (url.pathname === "/api/settings/quotas" && req.method === "PUT") {
    try {
      const body = (await req.json()) as {
        companyId?: string;
        maxRpm?: number;
        maxDailyTextRequests?: number;
        maxDailyImageRequests?: number;
        maxMonthlyBudgetUsd?: number;
        maxOutputTokens?: number;
        fallbackToSvgWhenExceeded?: boolean;
      };
      const companyId = body.companyId || "global";
      if (!isValidCompanyId(companyId)) {
        return Response.json(
          { success: false, error: "companyId possui formato inválido" },
          { status: 400 }
        );
      }

      const rules = await upsertApiUsageRules({
        companyId,
        maxRpm: body.maxRpm,
        maxDailyTextRequests: body.maxDailyTextRequests,
        maxDailyImageRequests: body.maxDailyImageRequests,
        maxMonthlyBudgetUsd: body.maxMonthlyBudgetUsd,
        maxOutputTokens: body.maxOutputTokens,
        fallbackToSvgWhenExceeded: body.fallbackToSvgWhenExceeded,
      });
      const summary = await getApiUsageSummary(companyId);

      return Response.json({
        success: true,
        data: { rules, summary },
      });
    } catch (err) {
      return Response.json(
        {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao salvar quotas de API",
        },
        { status: 400 }
      );
    }
  }

  return null;
}
