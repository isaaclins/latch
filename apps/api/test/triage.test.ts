import { describe, expect, it } from "vitest";
import { SELF, env } from "cloudflare:test";
import type { InboxEvent } from "@latch/shared";

type AuthedFetch = (path: string, init?: RequestInit) => Promise<Response>;

async function signIn(email: string): Promise<{ cookie: string; fetch: AuthedFetch }> {
  const id = env.USER_INBOX.idFromName(email.toLowerCase());
  const stub = env.USER_INBOX.get(id);
  const { token } = await stub.issueMagicToken(email, 900);
  const cbRes = await SELF.fetch(
    `https://api.test/auth/callback?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
    { headers: { accept: "application/json" } },
  );
  expect(cbRes.status).toBe(200);
  const setCookie = cbRes.headers.get("set-cookie");
  expect(setCookie).toBeTruthy();
  const cookie = setCookie!.split(";")[0]!;
  const fetch: AuthedFetch = (path, init = {}) =>
    SELF.fetch(`https://api.test${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), cookie },
    });
  return { cookie, fetch };
}

describe("end-to-end auth + triage", () => {
  it("magic-link round-trip lets /auth/me return the user", async () => {
    const { fetch } = await signIn("alice@example.com");
    const me = await fetch("/auth/me");
    expect(me.status).toBe(200);
    const body = (await me.json()) as { user: { email: string } };
    expect(body.user.email).toBe("alice@example.com");
  });

  it("rejects /inbox/event without auth", async () => {
    const event: InboxEvent = {
      id: "evt_1",
      subject: "test",
      from: "noone@example.com",
      receivedAt: new Date().toISOString(),
      needsReply: false,
    };
    const res = await SELF.fetch("https://api.test/inbox/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    });
    expect(res.status).toBe(401);
  });

  it("authed inbox event with needsReply=true → today triage", async () => {
    const { fetch } = await signIn("bob@example.com");
    const event: InboxEvent = {
      id: "evt_today",
      subject: "Q3 invoice — needs sign-off",
      from: "cfo@example.com",
      receivedAt: new Date().toISOString(),
      needsReply: true,
    };
    const res = await fetch("/inbox/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      decision: { importance: string; confidence: number; draft?: string };
      todayCount: number;
    };
    expect(body.ok).toBe(true);
    expect(body.decision.importance).toBe("today");
    expect(body.decision.confidence).toBeGreaterThanOrEqual(0.8);
    expect(body.decision.draft).toMatch(/Q3 invoice/);
    expect(body.todayCount).toBe(1);
  });

  it("authed inbox event with needsReply=false → archive", async () => {
    const { fetch } = await signIn("carol@example.com");
    const event: InboxEvent = {
      id: "evt_archive",
      subject: "FYI standup notes",
      from: "team@example.com",
      receivedAt: new Date().toISOString(),
      needsReply: false,
    };
    const res = await fetch("/inbox/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { decision: { importance: string } };
    expect(body.decision.importance).toBe("archive");
  });

  it("per-user DO isolation: alice's events don't appear for bob", async () => {
    const alice = await signIn("alice2@example.com");
    const bob = await signIn("bob2@example.com");

    const aliceEvent: InboxEvent = {
      id: "alice_evt",
      subject: "alice's thing",
      from: "x@y.com",
      receivedAt: new Date().toISOString(),
      needsReply: true,
    };
    await alice.fetch("/inbox/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(aliceEvent),
    });

    const bobInbox = await bob.fetch("/inbox");
    expect(bobInbox.status).toBe(200);
    const bobBody = (await bobInbox.json()) as { events: InboxEvent[] };
    expect(bobBody.events.find((e) => e.id === "alice_evt")).toBeUndefined();
  });
});
