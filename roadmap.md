# Latch — Delivery Roadmap

> Phased execution of `goal.md`. v0 = scaffold + site + local API + email + reviews. v1+ = paid-tier features (deployed DOs, billing, etc.).

## v0 — "Single founder can sign in and see their inbox triaged" (THIS RUN)

### Phase A — Foundation (P0 → P3) ✅
- A1. Monorepo (`apps/site`, `apps/api`, `packages/shared`).
- A2. Moodboard: Linear-meets-Stripe direction.
- A3. Logo: L-mark + wordmark.
- A4. This roadmap.

### Phase B — Marketing site (P4)
- B1. Astro on Cloudflare Pages, TS strict.
- B2. Four real pages: `/` (home), `/features`, `/pricing`, `/about`.
- B3. Real copy in each — no lorem, no "Coming Soon."
- B4. Hero motion: single staggered reveal (eyebrow → headline → subhead → CTA → product visual). `prefers-reduced-motion: reduce` → instant fades.
- B5. Inter Tight + Inter + JetBrains Mono via Fontsource (self-host, no FOIT, no third-party request).
- B6. og:image + favicon wired.

### Phase C — API (P5, LOCAL ONLY)
- C1. Workers + Agents SDK + Durable Objects, TS strict.
- C2. `UserInbox` DO — one per user, stores session + triage state.
- C3. `POST /auth/request-link` — issues a magic-link token, persists to DO, sends email.
- C4. `GET /auth/callback?token=…` — verifies token, sets session cookie.
- C5. `GET /me` — returns session user (auth gate).
- C6. `POST /inbox/event` — authed; mutates per-user DO state; triggers summary email.
- C7. `vitest` covers auth round-trip + triage round-trip.
- C8. `wrangler dev` only — `wrangler deploy` of the API is disabled.

### Phase D — Email (P6)
- D1. Cloudflare Email Sending bound to the API Worker.
- D2. `wolf-werler.ch` DNS: SPF + DKIM + DMARC written via Cloudflare API.
- D3. Magic-link + triage summary templates (plain text + minimal HTML).
- D4. Test recipients: `mailsy` disposable inboxes generated at run time.

### Phase E — Deploy + Reviews (P7 → P10)
- E1. `wrangler pages deploy` — site only.
- E2. `/workers-best-practices` — fix all critical findings.
- E3. `/code-review` at high effort — fix P0 / P1.
- E4. `/security-review` — fix criticals (auth flow, secret handling, DO isolation, email-abuse vectors).

### Phase F — Verify + Perf (P11, P12)
- F1. `/verify` — exercise site on `*.pages.dev`; exercise API on `wrangler dev`. Capture curl transcripts + mailsy email proofs.
- F2. `/web-perf` — confirm LCP < 1.5 s on the prod site URL. Iterate (preload hints, image sizing, font-display swap) until green.

### Phase G — Wrap (P13)
- G1. `FINAL_DELIVERABLE.md` — checkbox each criterion, paste proofs.
- G2. Final commit + push.
- G3. `/goodnight`.

## v1+ (out of scope tonight, captured for follow-up)

- Workers Paid plan ($5/mo) → deploy the API + DO state to `*.workers.dev`.
- Custom domain (`latch.app` or similar) → DNS + Email Routing.
- Real inbox ingestion: Gmail OAuth + IMAP fallback.
- Billing: Stripe Checkout + per-seat metering.
- Dark mode (deferred per moodboard).
- Multi-tenant: org-level DO above user-level DO.
- Compliance: SOC 2 readiness, audit log, data export.
