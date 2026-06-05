# Email setup — Resend

## What is live now (verified by smoke test)

- Real email send through Resend HTTP API works.
- Smoke test email ID `5c132d58-604a-4836-883b-2932621e168d`, sent to `isaac.lins07+levinstuff@gmail.com` on the night of build. Confirm it landed under the `+levinstuff` label.
- All code paths route through `apps/api/src/email/send.ts → fetch("https://api.resend.com/emails")`.
- `RESEND_API_KEY` is set in `apps/api/.dev.vars` (gitignored) — a send-only Resend key.

## Current sender

Right now `wrangler.jsonc` sets `SENDER_ADDRESS = onboarding@resend.dev`. That's Resend's sandbox sender — works immediately, with one restriction:

> **Resend free tier with an unverified domain can only send to the API-key owner's verified address** (`isaac.lins07+levinstuff@gmail.com`).

So `pnpm api:dev` will deliver real emails to that gmail right now. To send to a mailsy address — or any other recipient — flip the sender to a domain you control.

## To unlock sending from `noreply@wolf-werler.ch` (≈ 5 min, all you)

1. Visit https://resend.com/domains and click **Add Domain**.
2. Enter `wolf-werler.ch`. Pick the EU region.
3. Resend shows three DNS records (one MX or SPF TXT, one DKIM TXT, one DMARC TXT). Copy them.
4. Add them in Cloudflare: https://dash.cloudflare.com → wolf-werler.ch → **DNS → Records → Add record** (one per Resend row). I would have done this for you but my OAuth token has DNS `read` only, not `write`.
5. Back in Resend, click **Verify**. Usually green within 30 seconds.
6. In `apps/api/wrangler.jsonc`, change:
   ```jsonc
   "SENDER_ADDRESS": "onboarding@resend.dev",
   ```
   to:
   ```jsonc
   "SENDER_ADDRESS": "noreply@wolf-werler.ch",
   ```
   No code change. `pnpm api:dev` will then send to any address from `noreply@wolf-werler.ch`.

7. Smoke test it with mailsy:
   ```sh
   npx mailsy g                                     # generate disposable inbox
   # use the printed address in the curl below
   set -a && source apps/api/.dev.vars && set +a
   curl -sS -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "content-type: application/json" \
     -d '{"from":"Latch <noreply@wolf-werler.ch>","to":"<mailsy>","subject":"smoke","text":"hi"}'
   npx mailsy m                                     # should see it
   ```

## What `pnpm api:dev` does today

- Magic-link sign-in → real email out of Resend → lands in `isaac.lins07+levinstuff@gmail.com` (until step 6 above is done).
- Triage event → DO mutation + real summary email same path.
- Click the magic-link in the gmail → callback hits `http://localhost:8787/auth/callback?token=…` → session cookie → `/me` returns the user.

End-to-end works, today, without paying anything.

## Cost summary

- Resend free tier: 100 emails/day, 3,000/month. More than enough for v0.
- Total spend on email: **$0**.
- Workers Paid is still required to *deploy* the API (DOs in prod) — that's the only $5/mo blocker, unrelated to email.

## What stays in dev-sink mode

`apps/api/src/email/send.ts` falls back to a labelled stdout sink (`══════ latch-email-sink ══════`) when `RESEND_API_KEY` is unset. Vitest forces an empty key to keep tests offline (`vitest.config.ts`). Fresh clones without `.dev.vars` get the same fallback.
