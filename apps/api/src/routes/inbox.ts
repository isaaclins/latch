import { Hono } from "hono";
import type { InboxEvent } from "@latch/shared";
import type { Env, Variables } from "../types.ts";
import { err, json } from "../lib/json.ts";
import { resolveSession, userInboxFor } from "./auth.ts";
import { sendEmail } from "../email/send.ts";
import { triageSummaryEmail } from "../email/templates.ts";

export const inbox = new Hono<{ Bindings: Env; Variables: Variables }>();

inbox.use("*", async (c, next) => {
  const user = await resolveSession(c.env, c.req.header("cookie") ?? null);
  if (!user) return err(401, "unauthenticated", "Sign in first.");
  c.set("user", user);
  await next();
});

inbox.post("/event", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<Partial<InboxEvent>>().catch(() => ({}));
  const event = parseEvent(body);
  if (!event) return err(400, "invalid_event", "Missing or invalid event fields.");

  const stub = userInboxFor(c.env, user.email);
  const decision = await stub.recordEvent(event);

  // Send a summary every time an event arrives. For v0 this is fine — there's at most
  // a few per test run. v1 will batch into a single morning summary.
  const { todayCount, archiveCount, events } = await stub.summarize();
  await sendEmail(
    c.env,
    triageSummaryEmail({ to: user.email, todayCount, archiveCount, events }),
  );

  return json({ ok: true, decision, todayCount, archiveCount });
});

inbox.get("/", async (c) => {
  const user = c.get("user");
  const stub = userInboxFor(c.env, user.email);
  const events = await stub.listEvents();
  return json({ events });
});

function parseEvent(b: Partial<InboxEvent>): InboxEvent | null {
  if (typeof b.id !== "string" || !b.id) return null;
  if (typeof b.subject !== "string") return null;
  if (typeof b.from !== "string") return null;
  if (typeof b.receivedAt !== "string") return null;
  if (typeof b.needsReply !== "boolean") return null;
  return {
    id: b.id,
    subject: b.subject,
    from: b.from,
    receivedAt: b.receivedAt,
    needsReply: b.needsReply,
  };
}
