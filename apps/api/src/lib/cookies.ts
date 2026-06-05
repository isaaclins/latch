import { hmacSign, hmacVerify } from "./crypto.ts";

export const SESSION_COOKIE = "latch_session";

export interface SessionCookiePayload {
  readonly sessionId: string;
  readonly email: string;
}

/**
 * Cookie format: <emailB64url>.<sessionIdB64url>.<hmacB64url>
 * HMAC covers "<emailB64url>.<sessionIdB64url>" with SESSION_SECRET.
 */
export async function packSessionCookie(
  secret: string,
  payload: SessionCookiePayload,
): Promise<string> {
  const e = b64urlSafe(payload.email);
  const s = payload.sessionId;
  const body = `${e}.${s}`;
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

export async function unpackSessionCookie(
  secret: string,
  cookie: string,
): Promise<SessionCookiePayload | null> {
  const parts = cookie.split(".");
  if (parts.length !== 3) return null;
  const [e, s, sig] = parts as [string, string, string];
  const body = `${e}.${s}`;
  if (!(await hmacVerify(secret, body, sig))) return null;
  try {
    return { sessionId: s, email: b64urlUnsafe(e) };
  } catch {
    return null;
  }
}

export function serializeSessionCookie(
  value: string,
  maxAgeSeconds: number,
  options: { secure: boolean; sameSite?: "Lax" | "Strict" } = { secure: true },
): string {
  const parts = [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${options.sameSite ?? "Lax"}`,
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearedSessionCookie(secure: boolean): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const c of header.split(";")) {
    const [k, ...v] = c.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

function b64urlSafe(s: string): string {
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function b64urlUnsafe(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return atob(s.replaceAll("-", "+").replaceAll("_", "/") + pad);
}
