# @latch/api

Cloudflare Workers + Agents SDK + Durable Objects, **LOCAL ONLY**.

The API runs via `wrangler dev`. It is **never** deployed in v0 — deploying Durable Objects requires the Workers Paid plan, which Latch v0 does not use.

## Run

```sh
# Generate secrets and copy them in:
cp .dev.vars.example .dev.vars
#   SESSION_SECRET, MAGIC_LINK_SECRET ← any 32+ random bytes, base64

pnpm api:dev      # http://localhost:8787
```

## Routes

| Method | Path                  | Auth | Purpose |
|--------|-----------------------|------|---------|
| GET    | `/`                   | —    | Identity / docs link |
| GET    | `/health`             | —    | `{ ok: true }` |
| POST   | `/auth/request-link`  | —    | Issue a one-time magic-link, email it via the configured sender |
| GET    | `/auth/callback`      | —    | Redeem `token` + `email`, set `latch_session` cookie |
| GET    | `/auth/me`            | ✓    | Return the signed-in user |
| POST   | `/auth/logout`        | ✓    | Revoke session, clear cookie |
| POST   | `/inbox/event`        | ✓    | Record an inbox event, write triage decision, trigger summary email |
| GET    | `/inbox`              | ✓    | List events for the signed-in user |

## State

One `UserInbox` Durable Object per user, addressed by lowercase email.

Storage keys per DO:

- `meta` — `{ id, email, createdAt }`
- `token:<sha256hex>` — magic-link tokens (hashed at rest, one-time, 15 min TTL)
- `session:<sessionId>` — sessions (30 day TTL)
- `event:<eventId>` — inbox events

## Email

`sendEmail()` posts to the Resend HTTP API.

- With `RESEND_API_KEY` set: real send via `https://api.resend.com/emails`.
- Without it (vitest, fresh clones): a labelled stdout sink, `══════ latch-email-sink ══════`. `/verify` greps this for proof.

Sender comes from `wrangler.jsonc` vars — `onboarding@resend.dev` until you verify `wolf-werler.ch` in Resend's dashboard; then flip to `noreply@wolf-werler.ch`. See `EMAIL_SETUP.md` at the repo root.

## Test

```sh
pnpm --filter @latch/api test
```

Covers: magic-link round-trip, auth gate, per-DO isolation, both triage branches.
