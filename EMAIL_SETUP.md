# Email setup — wolf-werler.ch

## What ran autonomously tonight (verified)

- **Email Routing enabled** on `wolf-werler.ch`:
  `wrangler email routing enable wolf-werler.ch` → `status: ready`.
- **DNS records present** on the zone (set automatically by enabling Routing):
  - SPF: `wolf-werler.ch  TXT  "v=spf1 include:_spf.mx.cloudflare.net ~all"`
  - DKIM: `cf2024-1._domainkey.wolf-werler.ch  TXT  v=DKIM1; ...; p=MIIBIjANBgkqhkiG…`
  - MX × 3 → `route1.mx.cloudflare.net.`, `route2…`, `route3…`
- **API + Worker email path** wired through `env.EMAIL.send()` (Cloudflare Email Sending binding declared in `apps/api/wrangler.jsonc`). Dev fallback writes a labelled sink line to `wrangler dev`'s stdout — `/verify` greps `══════ latch-email-sink ══════` for proof of what was sent.

## What is blocked (manual action required)

**Cloudflare Email Sending is not yet enabled on this account.** Both `wrangler email sending enable wolf-werler.ch` and `wrangler email sending send-raw …` return HTTP 401 / API code **10203** (`email.sending.error.email.sending_disabled`).

The OAuth token issued by `wrangler login` carries the `email_sending (write)` scope, but the *account itself* still needs to opt in to the open beta. That step is dashboard-only — there is no CLI for it as of this build.

### To unblock (≈ 2 minutes when you wake up)

1. Visit https://dash.cloudflare.com/?to=/:account/email/sending
2. Accept the Email Sending open-beta terms.
3. Re-run the smoke test:
   ```sh
   npx mailsy g                                                  # get a fresh inbox
   wrangler email sending enable wolf-werler.ch
   wrangler email sending send-raw \
     --from noreply@wolf-werler.ch \
     --to <mailsy-address> \
     --mime-file scripts/smoke.mime
   npx mailsy m                                                  # confirm delivery
   ```
4. From there, `pnpm api:dev` will send real magic-link + summary emails out of the box — no code change.

## Why this isn't a code change

`apps/api/src/email/send.ts` already calls `env.EMAIL.send(new EmailMessage(...))` in `production`. The DO + auth + triage paths are already wired to call `sendEmail()` at the right moments. The blocker is purely an account-flag flip.
