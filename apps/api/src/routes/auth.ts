import { Hono } from "hono";
import type { Env, Variables } from "../types.ts";
import { err, json } from "../lib/json.ts";
import {
  SESSION_COOKIE,
  clearedSessionCookie,
  packSessionCookie,
  readCookie,
  serializeSessionCookie,
  unpackSessionCookie,
} from "../lib/cookies.ts";
import { sendEmail } from "../email/send.ts";
import { magicLinkEmail } from "../email/templates.ts";

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

auth.post("/request-link", async (c) => {
  const body = (await c.req.json<{ email?: unknown }>().catch(() => ({}))) as { email?: unknown };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) return err(400, "invalid_email", "Provide a valid email address.");

  const ttl = Number(c.env.MAGIC_LINK_TTL_SECONDS);
  const stub = userInboxFor(c.env, email);
  const { token, expiresAt } = await stub.issueMagicToken(email, ttl);

  const link = new URL("/auth/callback", c.env.API_URL);
  link.searchParams.set("token", token);
  link.searchParams.set("email", email);

  await sendEmail(c.env, magicLinkEmail({ to: email, link: link.toString(), ttlSeconds: ttl }));

  // Don't leak whether the address is new vs existing — same response either way.
  return json({ ok: true, expiresAt });
});

auth.get("/callback", async (c) => {
  const token = c.req.query("token") ?? "";
  const email = (c.req.query("email") ?? "").trim().toLowerCase();
  if (!token || !EMAIL_RE.test(email)) return err(400, "invalid_request", "Missing token or email.");

  const stub = userInboxFor(c.env, email);
  const result = await stub.redeemMagicToken(email, token, Number(c.env.SESSION_TTL_SECONDS));
  if (!result) return err(401, "invalid_token", "This sign-in link is invalid or expired.");

  const cookieValue = await packSessionCookie(c.env.SESSION_SECRET, {
    sessionId: result.sessionId,
    email,
  });
  const secure = c.env.ENVIRONMENT === "production";
  const setCookie = serializeSessionCookie(cookieValue, Number(c.env.SESSION_TTL_SECONDS), { secure });

  // Either return JSON (for curl/tests) or redirect to /me if the request looks browsery.
  const accept = c.req.header("accept") ?? "";
  if (accept.includes("text/html")) {
    return new Response(null, {
      status: 302,
      headers: { "set-cookie": setCookie, location: `${c.env.SITE_URL}/?signed_in=1` },
    });
  }
  return new Response(JSON.stringify({ ok: true, user: result.user }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "set-cookie": setCookie,
      "cache-control": "no-store",
    },
  });
});

auth.get("/me", async (c) => {
  const user = await resolveSession(c.env, c.req.header("cookie") ?? null);
  if (!user) return err(401, "unauthenticated", "Sign in first.");
  return json({ user });
});

auth.post("/logout", async (c) => {
  const cookie = readCookie(c.req.header("cookie") ?? null, SESSION_COOKIE);
  if (cookie) {
    const payload = await unpackSessionCookie(c.env.SESSION_SECRET, cookie);
    if (payload) {
      const stub = userInboxFor(c.env, payload.email);
      await stub.revokeSession(payload.sessionId);
    }
  }
  const secure = c.env.ENVIRONMENT === "production";
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "set-cookie": clearedSessionCookie(secure),
    },
  });
});

// Shared helpers (also imported by inbox routes for the auth gate).
export async function resolveSession(
  env: Env,
  cookieHeader: string | null,
): Promise<import("@latch/shared").SessionUser | null> {
  const raw = readCookie(cookieHeader, SESSION_COOKIE);
  if (!raw) return null;
  const payload = await unpackSessionCookie(env.SESSION_SECRET, raw);
  if (!payload) return null;
  const stub = userInboxFor(env, payload.email);
  return stub.getSession(payload.sessionId);
}

export function userInboxFor(env: Env, email: string) {
  const id = env.USER_INBOX.idFromName(email.toLowerCase());
  return env.USER_INBOX.get(id);
}
