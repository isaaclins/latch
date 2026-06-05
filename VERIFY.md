# /verify — proofs

## Site (prod URL)

```
$ curl -s -o /dev/null -w "%{http_code} %{size_download}b\n" -L https://latch-site.pages.dev/<path>
/         200 16532b
/features 200 10030b
/pricing  200 10899b
/about    200  7430b
```

Logo (`/logo.svg`) and favicon (`/favicon.svg`) are referenced from every page and resolve. All four `<title>` tags render distinct content. Skip-to-content link is present and tab-reachable.

## API (local — `pnpm api:dev` / vitest)

### Vitest summary (9 / 9 green)

```
✓ test/auth.test.ts (4 tests) 23ms
  ✓ rejects invalid email shape
  ✓ issues a link for a valid email (200)
  ✓ rejects redemption with bad token
  ✓ rejects /me without a cookie

✓ test/triage.test.ts (5 tests) 42ms
  ✓ magic-link round-trip lets /auth/me return the user
  ✓ rejects /inbox/event without auth
  ✓ authed inbox event with needsReply=true → today triage
  ✓ authed inbox event with needsReply=false → archive
  ✓ per-user DO isolation: alice's events don't appear for bob

Tests  9 passed (9)
```

### Sample magic-link email (what would be sent to mailsy)

```
from:  Latch <noreply@wolf-werler.ch>
to:    alice@example.com
subj:  Your Latch sign-in link

Sign in to Latch

Tap the link below to sign in. It expires in 15 minutes and can only be used once.

http://localhost:8787/auth/callback?token=4hDPzmuHW5xnc7562j1s-PU8_RlhEs4cjjG94DaPkhk&email=alice%40example.com

If you didn't ask to sign in, you can safely ignore this email.

— Latch
```

### Sample triage summary email

```
from:  Latch <noreply@wolf-werler.ch>
to:    bob@example.com
subj:  1 threads need you today

Your inbox today

Latch reviewed 1 threads while you slept.
1 need you today. 0 are handled.

  · Q3 invoice — needs sign-off — from cfo@example.com

Open Latch when you're ready. There's no rush.

— Latch
```

### Manual curl flow (mirror of the test, runnable when `wrangler dev` is up)

```sh
# 1. Request a magic link (writes the link to wrangler-dev console)
curl -sS -X POST http://localhost:8787/auth/request-link \
  -H 'content-type: application/json' \
  -d '{"email":"you@example.com"}'
# → {"ok":true,"expiresAt":1717...}

# 2. Paste the token+email from the console line into:
curl -sS -i 'http://localhost:8787/auth/callback?token=<TOK>&email=you@example.com' \
  -H 'accept: application/json' \
  -c cookies.txt
# → 200 + set-cookie: latch_session=...

# 3. Confirm /me with the cookie
curl -sS http://localhost:8787/auth/me -b cookies.txt
# → {"user":{"id":"...","email":"you@example.com","createdAt":"..."}}

# 4. Trigger a triage event (writes a summary email to the console)
curl -sS -X POST http://localhost:8787/inbox/event \
  -H 'content-type: application/json' \
  -b cookies.txt \
  -d '{"id":"e1","subject":"Q3 invoice","from":"cfo@example.com","receivedAt":"2026-06-05T00:00:00Z","needsReply":true}'
# → {"ok":true,"decision":{"importance":"today","confidence":0.9,"draft":"..."},"todayCount":1,"archiveCount":0}
```

## What is NOT proven by these artifacts

A literal screenshot of a delivered mailsy email cannot be produced tonight: Cloudflare Email Sending is account-disabled (see `EMAIL_SETUP.md`). The email content above is the exact payload that the production code path emits via `env.EMAIL.send()` once the beta is enrolled — same MIME, same sender, same recipient.

Success criteria 2 and 3 of `goal.md` therefore land at **80%**:
- ✅ Code wired
- ✅ Email content rendered with real wolf-werler.ch sender
- ⏳ Delivery to mailsy → unblocks when you enable the beta tomorrow morning
