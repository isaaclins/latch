import { DurableObject } from "cloudflare:workers";
import type { InboxEvent, SessionUser, TriageDecision } from "@latch/shared";
import type { Env } from "../types.ts";
import { randomToken, sha256Hex } from "../lib/crypto.ts";

interface StoredToken {
  readonly email: string;
  readonly expiresAt: number;
}

interface StoredSession {
  readonly userId: string;
  readonly createdAt: number;
  readonly expiresAt: number;
}

interface StoredUser {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
}

/**
 * One DO per user, addressed by lowercased email.
 * Stores: user record, magic-link tokens (hashed), sessions, triage events.
 */
export class UserInbox extends DurableObject<Env> {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
  }

  // ── User lifecycle ────────────────────────────────────────────────
  async ensureUser(email: string): Promise<SessionUser> {
    const lower = email.toLowerCase();
    const existing = await this.ctx.storage.get<StoredUser>("meta");
    if (existing) return toSessionUser(existing);
    const user: StoredUser = {
      id: crypto.randomUUID(),
      email: lower,
      createdAt: new Date().toISOString(),
    };
    await this.ctx.storage.put("meta", user);
    return toSessionUser(user);
  }

  async getUser(): Promise<SessionUser | null> {
    const u = await this.ctx.storage.get<StoredUser>("meta");
    return u ? toSessionUser(u) : null;
  }

  // ── Magic-link tokens ─────────────────────────────────────────────
  async issueMagicToken(
    email: string,
    ttlSeconds: number,
  ): Promise<{ token: string; expiresAt: number }> {
    await this.ensureUser(email);
    const token = randomToken(32);
    const hash = await sha256Hex(token);
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const stored: StoredToken = { email: email.toLowerCase(), expiresAt };
    await this.ctx.storage.put(`token:${hash}`, stored);
    return { token, expiresAt };
  }

  async redeemMagicToken(
    email: string,
    token: string,
    sessionTtlSeconds: number,
  ): Promise<{ sessionId: string; user: SessionUser } | null> {
    const hash = await sha256Hex(token);
    const key = `token:${hash}`;
    const stored = await this.ctx.storage.get<StoredToken>(key);
    if (!stored) return null;
    if (stored.email !== email.toLowerCase()) return null;
    if (stored.expiresAt < Date.now()) {
      await this.ctx.storage.delete(key);
      return null;
    }
    // one-time use
    await this.ctx.storage.delete(key);

    const user = await this.ensureUser(email);
    const sessionId = randomToken(32);
    const now = Date.now();
    const session: StoredSession = {
      userId: user.id,
      createdAt: now,
      expiresAt: now + sessionTtlSeconds * 1000,
    };
    await this.ctx.storage.put(`session:${sessionId}`, session);
    return { sessionId, user };
  }

  // ── Sessions ──────────────────────────────────────────────────────
  async getSession(sessionId: string): Promise<SessionUser | null> {
    const s = await this.ctx.storage.get<StoredSession>(`session:${sessionId}`);
    if (!s) return null;
    if (s.expiresAt < Date.now()) {
      await this.ctx.storage.delete(`session:${sessionId}`);
      return null;
    }
    const user = await this.ctx.storage.get<StoredUser>("meta");
    return user ? toSessionUser(user) : null;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.ctx.storage.delete(`session:${sessionId}`);
  }

  // ── Triage / inbox events ─────────────────────────────────────────
  async recordEvent(event: InboxEvent): Promise<TriageDecision> {
    await this.ctx.storage.put(`event:${event.id}`, event);
    return triageOf(event);
  }

  async listEvents(): Promise<InboxEvent[]> {
    const map = await this.ctx.storage.list<InboxEvent>({ prefix: "event:" });
    return [...map.values()].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }

  async summarize(): Promise<{ todayCount: number; archiveCount: number; events: InboxEvent[] }> {
    const events = await this.listEvents();
    let todayCount = 0;
    let archiveCount = 0;
    for (const e of events) {
      const d = triageOf(e);
      if (d.importance === "today") todayCount++;
      if (d.importance === "archive") archiveCount++;
    }
    return { todayCount, archiveCount, events };
  }

  // ── Operational: full wipe (used by tests and account delete) ─────
  async wipe(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
}

function toSessionUser(u: StoredUser): SessionUser {
  return { id: u.id, email: u.email, createdAt: u.createdAt };
}

function triageOf(e: InboxEvent): TriageDecision {
  // v0 heuristic: needsReply → "today" with 0.9 confidence; otherwise archive at 0.7.
  // The real model is the v1 problem. The shape is stable; the weights aren't.
  if (e.needsReply) {
    return {
      threadId: e.id,
      importance: "today",
      confidence: 0.9,
      draft: `Hi — thanks for the note on "${e.subject}". I'll get back to you today with a decision.`,
    };
  }
  return { threadId: e.id, importance: "archive", confidence: 0.7 };
}
