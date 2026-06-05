# Production URLs

## Live now

- Marketing site: **https://latch-site.pages.dev**
  - `/` → 200
  - `/features` → 200 (via 308 → `/features/`)
  - `/pricing` → 200 (via 308 → `/pricing/`)
  - `/about` → 200 (via 308 → `/about/`)
- Latest preview deployment: https://12d284a8.latch-site.pages.dev
- GitHub repo: https://github.com/isaaclins/latch

## Not deployed (by design)

- `apps/api` — runs only via `pnpm api:dev` (LOCAL). Workers Paid is required to deploy DOs and we are not paying for v0.

## Redeploy command

```sh
pnpm site:build
pnpm site:deploy
```
