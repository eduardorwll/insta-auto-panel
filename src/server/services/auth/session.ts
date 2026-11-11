import { createHmac, timingSafeEqual } from "crypto";
import { BoundedTtlMap } from "../../../shared/state-machines/bounded-ttl-map";

const SESSION_COOKIE_NAME = "social_panel_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 dias
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

interface RateLimitEntry {
  failures: number;
  firstFailureAt: number;
}

const MAX_TRACKED_IPS = 1000;
const loginAttemptsByIp = new BoundedTtlMap<RateLimitEntry>(MAX_TRACKED_IPS, LOGIN_WINDOW_MS);

const ADMIN_USERNAME = process.env.PANEL_ADMIN_USER || "admin";
const RAW_ADMIN_PASSWORD = process.env.PANEL_ADMIN_PASSWORD || "admin123";
const ADMIN_PASSWORD_HASH =
  process.env.PANEL_ADMIN_PASSWORD_HASH ||
  Bun.password.hashSync(RAW_ADMIN_PASSWORD, {
    algorithm: "argon2id",
    memoryCost: 19456,
    timeCost: 2,
  });

const SESSION_SECRET =
  process.env.PANEL_SESSION_SECRET ||
  createHmac("sha256", "social-panel-home-server-key")
    .update(ADMIN_PASSWORD_HASH)
    .digest("hex");

export function resetLoginRateLimiter(): void {
  loginAttemptsByIp.clear();
}

export function checkLoginRateLimit(clientIp: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginAttemptsByIp.get(clientIp);
  if (!entry) return { allowed: true };

  if (now - entry.firstFailureAt > LOGIN_WINDOW_MS) {
    loginAttemptsByIp.delete(clientIp);
    return { allowed: true };
  }

  if (entry.failures >= MAX_LOGIN_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((LOGIN_WINDOW_MS - (now - entry.firstFailureAt)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordLoginFailure(clientIp: string): void {
  const now = Date.now();
  const entry = loginAttemptsByIp.get(clientIp);
  if (!entry || now - entry.firstFailureAt > LOGIN_WINDOW_MS) {
    loginAttemptsByIp.set(clientIp, { failures: 1, firstFailureAt: now }, now);
  } else {
    entry.failures += 1;
    loginAttemptsByIp.set(clientIp, entry, entry.firstFailureAt);
  }
}

export function clearLoginFailures(clientIp: string): void {
  loginAttemptsByIp.delete(clientIp);
}

export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  try {
    return await Bun.password.verify(password, ADMIN_PASSWORD_HASH);
  } catch {
    return false;
  }
}

export function createSessionToken(username: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ sub: username, exp }), "utf-8").toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): { valid: boolean; username: string | null } {
  if (!token || !token.includes(".")) {
    return { valid: false, username: null };
  }
  const [payload, sig] = token.split(".");
  if (!payload || !sig) {
    return { valid: false, username: null };
  }

  const expectedSig = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, username: null };
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as {
      sub?: string;
      exp?: number;
    };
    if (!decoded.sub || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, username: null };
    }
    return { valid: true, username: decoded.sub };
  } catch {
    return { valid: false, username: null };
  }
}

export function extractSessionFromRequest(req: Request): { valid: boolean; username: string | null } {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const item of cookies) {
    if (item.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      const value = item.slice(`${SESSION_COOKIE_NAME}=`.length);
      return verifySessionToken(value);
    }
  }
  return { valid: false, username: null };
}

export function buildSessionCookieHeader(token: string): string {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}${secureFlag}`;
}

export function buildLogoutCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

export function isAuthEnforced(req: Request): boolean {
  if (req.headers.get("x-enforce-auth") === "1") return true;
  if (process.env.PANEL_AUTH_REQUIRED === "true") return true;
  return false;
}
