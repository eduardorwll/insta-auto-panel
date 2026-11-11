/** Estado explícito da sessão do Instagram, derivado de cookies reais. */
export type InstagramSessionState = "unconfigured" | "active" | "expired";

export interface CookieLike {
  name: string;
  value?: string;
  expires?: number | null; // epoch segundos; -1/0/null = sessão
}

export function evaluateInstagramSessionState(
  cookies: CookieLike[] | null | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): InstagramSessionState {
  if (!cookies || cookies.length === 0) return "unconfigured";
  const session = cookies.find((c) => c.name === "sessionid" && c.value);
  if (!session) return "unconfigured";
  const exp = session.expires;
  if (typeof exp === "number" && exp > 0 && exp <= nowSeconds) return "expired";
  return "active";
}
