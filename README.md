# Latch

Cloudflare-hosted SaaS inbox triage.

> [!WARNING]
> This is a prototype I've built for fun, nothing here means anything at the moment. Deployment is temporary and may be subject to removal without any prior warning.

## Layout

```
apps/
  site/      Astro marketing site → Cloudflare Pages
  api/       Cloudflare Workers + Agents SDK + Durable Objects (LOCAL only)
packages/
  shared/    Shared types between site and api
design/
  moodboard/ Visual direction
  logo/      Logo SVG variants
```

## Develop

```sh
pnpm install
pnpm site:dev        # Astro at http://localhost:4321
pnpm api:dev         # wrangler dev at http://localhost:8787
pnpm test            # vitest across packages
```

## Deploy

Only the marketing site is deployed:

```sh
pnpm site:deploy
```

The API stays local (`pnpm api:dev`) — deploying Durable Objects requires the Workers Paid plan, which Latch v0 does not use.

## Email

Transactional email (magic-link + triage summaries) is sent from `wolf-werler.ch` via Cloudflare Email Sending. SPF / DKIM / DMARC records are managed on that zone.

## Roadmap

See `roadmap.md` for the phased delivery plan.

---

Built with `/goal`. See `goal.md` for the autonomous-execution spec that produced this repo.
