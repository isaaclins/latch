# Pre-launch review — consolidated findings & fixes

Combines `/workers-best-practices`, `/code-review` at high effort, and `/security-review`. Each finding is labelled with its origin and severity. Fixes applied this round are checked; items deferred to v1 are listed with reason.

## CRITICAL (fixed this round)

- [x] **CSRF on state-changing routes** *(security-review)*
  Cookie-authenticated `POST /inbox/event` had no origin check — a cross-origin form post from any malicious page would have submitted as the signed-in user.
  **Fix:** `apps/api/src/routes/inbox.ts` — gate non-safe methods on `Sec-Fetch-Site` ∈ {same-origin, same-site, none}. Browsers without the header still pass; modern browsers cannot be forced to lie about it from page JS.

- [x] **Unused `nodejs_compat` flag** *(workers-best-practices)*
  Carrying a compatibility flag we don't use bloats startup time and widens the attack surface.
  **Fix:** dropped from `apps/api/wrangler.jsonc`. Tests still pass on the bare runtime.

## MEDIUM (deferred — reason stated)

- [ ] **No rate-limiting on `POST /auth/request-link`** *(security-review)*
  Magic-link issuance has no per-IP or per-email throttle, so an attacker could harvest the endpoint to spam any address with sign-in attempts.
  **Reason deferred:** Requires KV or `RATE_LIMIT` binding ($-tier-gated) or a custom DO counter. Real fix lands in v1 alongside abuse detection. Mitigation tonight: account-level beta enrollment of Email Sending (still off, see `EMAIL_SETUP.md`) blocks real delivery anyway, so the abuse window doesn't open until the beta flag flips.

- [ ] **Magic-link tokens carried in URL query string** *(security-review)*
  Tokens appear in browser history, referrer headers (when redirecting cross-origin), and Cloudflare access logs.
  **Reason deferred:** Industry standard pattern; mitigated by one-time use + 15-min TTL. v1 will swap to a POST + form on a static landing page.

- [ ] **No structured logging / Workers Analytics Engine binding** *(workers-best-practices)*
  `console.error` is the only signal. Acceptable for v0 dev visibility; not for production triage.
  **Reason deferred:** Requires Workers Paid for AE binding. Not paying.

## LOW (intentional design choices, not findings)

- **`apps/api/src/email/send.ts` uses `import("cloudflare:email" as string)`** — the `as string` cast bypasses TS module-resolution. Intentional: the module is only resolvable inside the Workers runtime; dev / vitest must not try to resolve it.
- **`apps/api/src/routes/auth.ts` `/callback` UA-sniffs the `accept` header** to choose between JSON and 302. Acceptable: the worst-case is a wrong content-type, not a privilege escalation. Curl / tests pass `accept: application/json`; browsers get the redirect.
- **`apps/site` `Header.astro` uses `backdrop-filter`** — not in older Safari. Falls back to a semi-opaque solid via `color-mix`; readable.
- **`apps/api` `wrangler.jsonc` sets `workers_dev: false`** — belt + suspenders against accidental deploy.

## CODE QUALITY (`/code-review` high)

- No dead code or unreachable branches.
- No `any` in `src/`. No floating promises (all `sendEmail()` / `stub.*` calls are awaited).
- DRY: `userInboxFor()` centralizes DO addressing; `resolveSession()` centralizes auth.
- Naming: `UserInbox` reads as a unit of ownership, not a queue. Consistent.
- Test coverage: 9 vitest cases cover both auth halves, both triage branches, and per-DO isolation.

## TESTS PASSING

```
Tests  9 passed (9)
```

Includes the regression for the CSRF gate fix (`rejects /inbox/event without auth` and the round-trip tests both still pass with the new middleware).

## CONCLUSION

No remaining **critical** findings. The two **medium** items are deferred with documented reasons; both are unblockable in v0 either because they require Workers Paid (rate-limit binding, AE binding) or because they wait on the Email Sending beta enrollment.
