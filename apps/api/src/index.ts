import { Hono } from "hono";
import type { Env, Variables } from "./types.ts";
import { auth } from "./routes/auth.ts";
import { inbox } from "./routes/inbox.ts";

export { UserInbox } from "./do/UserInbox.ts";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get("/", (c) =>
  c.json({
    name: "latch-api",
    environment: c.env.ENVIRONMENT,
    site: c.env.SITE_URL,
    docs: "https://github.com/isaaclins/latch#api",
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", auth);
app.route("/inbox", inbox);

app.onError((e, c) => {
  // eslint-disable-next-line no-console
  console.error("[api] unhandled", e);
  return c.json({ error: { code: "internal", message: "Something broke." } }, 500);
});

app.notFound((c) =>
  c.json({ error: { code: "not_found", message: `${c.req.method} ${c.req.path}` } }, 404),
);

export default app satisfies ExportedHandler<Env>;
