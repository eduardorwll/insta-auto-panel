export interface CookieEntry {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  expires?: number;
}

export interface ParseInstagramCookiesInputParams {
  cookiesJson?: string | null;
  sessionId?: string | null;
  csrfToken?: string | null;
  dsUserId?: string | null;
}

export interface ParseInstagramCookiesResult {
  sessionId: string;
  csrfToken: string;
  dsUserId: string;
  normalizedCookies: CookieEntry[];
}

/**
 * Extrai sessionid, csrftoken e ds_user_id a partir de um JSON de cookies
 * (EditThisCookie, Cookie-Editor ou Playwright storageState) ou de campos diretos.
 */
export function parseInstagramCookiesInput(
  input: ParseInstagramCookiesInputParams
): ParseInstagramCookiesResult {
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
