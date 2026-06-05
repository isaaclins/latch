/goal Ship Latch v0: marketing site on *.pages.dev (LCP<1.5s); API LOCAL via `wrangler dev` with magic-link auth + one triage flow (webhook → per-user DO → summary email via wolf-werler.ch); all pre-launch reviews passing.

— CONTEXT —
· Project: Latch — Cloudflare-hosted SaaS inbox triage.
· Stack: Astro on Pages; Workers + Agents SDK + DO (one DO/user, LOCAL via wrangler dev); Cloudflare email via wolf-werler.ch; TS strict, wrangler, vitest.
· State: greenfield.
· Dir: /private/var/folders/1g/kck3lkqd4094hxn2w8blsnzm0000gn/T/tmp.dkNDJ3MNtM
· Constraints: NO PAYING — no Workers Paid; DO never deploys; API stays LOCAL. Site → *.pages.dev. Sender = wolf-werler.ch (SPF/DKIM/DMARC writes OK on this domain only). Recipient = mailsy. LCP<1.5s on prod. Design = "Linear-meets-Stripe": restrained palette, clean type, subtle motion, reduced-motion safe.
· Audience: founders/PMs/ops drowning in shared inboxes; Linear+Notion subscribers.

— PIPELINE (run in order) —
1. /moodboard-creator — Linear-meets-Stripe direction.
2. /svg-logo-designer — 3 variants; pick one.
3. /roadmap — phased plan, then execute.
4. /frontend-design + /better-animate — REAL multi-page Astro site (home, features, pricing, about), real copy + hero motion.
5. /agents-sdk + /durable-objects — API Worker + per-user inbox DO (LOCAL ONLY).
6. /cloudflare-email-service — magic-link + triage summary via wolf-werler.ch to mailsy.
7. /wrangler — deploy SITE to Pages; API stays LOCAL via wrangler dev. NEVER enable Workers Paid.
8. /workers-best-practices — fix all criticals.
9. /code-review high — fix P0/P1.
10. /security-review — fix criticals.
11. /verify — exercise flows: site on prod URL, API on `wrangler dev`.
12. /web-perf — confirm LCP<1.5s on prod site URL.
13. /goodnight when all green.

— SUCCESS CRITERIA (ALL TRUE) —
1. Site live at *.pages.dev with chosen logo + hero motion; /web-perf reports LCP<1.5s on prod URL.
2. Magic-link works on local API: POST /auth/request-link sends real email from wolf-werler.ch to mailsy, callback sets session, authed request returns user. Curl + email screenshot.
3. Triage works on local API: authed inbox-event POST mutates per-user DO and triggers summary email from wolf-werler.ch to mailsy. Curl + email screenshot.
4. /workers-best-practices, /code-review high, /security-review pass with no unaddressed criticals; /verify confirms flows.
5. Site URL reachable; `wrangler dev` runs cleanly; all proof artifacts produced.
6. Repo pushed to GitHub; final commit green; site deploy matches HEAD.

— OPERATING RULES —
1. PLAN FIRST. Numbered tasks mapped to pipeline.
2. WORK AUTONOMOUSLY. Don't ask unless blocked.
3. SELF-VERIFY every step (tests, curl). DEBUG YOURSELF.
4. USE EVERY TOOL — wrangler, vitest, curl, web, MCPs, skills.
5. PROGRESS LOG: done/in-flight/decisions/blockers.
6. STAY ON GOAL; if blocked, log + continue parallelizable.
7. RE-CHECK CRITERIA BEFORE STOPPING.
8. OFF-LIMITS: paid features, marketing custom domain, anything costing money. DNS OK only on wolf-werler.ch.
9. COMMIT+PUSH: `git init`; `gh repo create` public (owner isaaclins); commit per step; push on green; redeploy site after push.
10. REAL CONTENT: no lorem, no "Coming Soon", no stubs — real auth, real DO, real email.

— QUALITY BAR —
· Code: TS strict, no any, no floating promises, Workers+Astro idioms.
· Design: well-funded-startup quality.
· Output: survives senior code + security review.
· Docs: README logs env vars, bindings, DO classes, routes; wrangler.jsonc annotated.

— FINAL DELIVERABLE —
✅ Each criterion confirmed. 📋 Files by package (site, api, shared).
🚀 Run (wrangler dev) + redeploy site (pages deploy). Live URL + GitHub URL.
📊 Proof: /web-perf LCP; magic-link curl + email screenshot; triage curl + email screenshot; review summaries.
📝 Decisions. ⚠️ Known limits + v1 follow-ups.

Begin with your plan. Execute end-to-end until done or blocked.
