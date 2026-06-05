# FINAL Moodboard — Latch

> Direction: **Linear-meets-Stripe.** Calm, confident, restrained.
> Light-first like Stripe; precise and dense like Linear; trustworthy for ops/PMs/founders.

---

## Inspiration sources

| Source | Key takeaway |
|---|---|
| Linear (linear.app) | Tight 1px hairlines, near-black ink, generous letter-spacing on display text, micro-motion only (150–220 ms). No bounce. |
| Stripe (stripe.com) | Generous white space, near-white surfaces, deep navy text, large confident display type, single restrained gradient flourish in hero. |
| Vercel marketing | Monospace accents for technical credibility, narrow content column on long copy, hairline section dividers. |
| Pitch decks for B2B SaaS (Notion, Mercury) | "Quiet authority" — neutral palette, one accent color carries everything, type does the heavy lifting. |

---

## Color palette (FINAL)

| Role | Hex | Usage |
|---|---|---|
| Ink | `#0A0B0D` | Primary text, headings |
| Ink-2 (muted) | `#5C6370` | Body copy, descriptions |
| Ink-3 (faint) | `#8A8F98` | Captions, meta, eyebrow labels |
| Hairline | `#E6E7EB` | 1px borders, dividers, table rows |
| Surface | `#FFFFFF` | Cards, modals |
| Canvas | `#FAFAF7` | Page background (warm off-white) |
| Canvas-2 | `#F4F4EF` | Alternating sections |
| Accent | `#5448E6` | Primary buttons, links, focus rings, logo mark |
| Accent-soft | `#EEEAFD` | Accent-tinted surfaces (callouts) |
| Success | `#1F8A50` | Positive state |
| Warn | `#B46A00` | Cautionary state |

**Rule:** one accent (`#5448E6`). Everything else is grayscale + hairlines. No second hue.

---

## Typography (FINAL)

- **Display / headings:** `Inter Tight` (variable, weights 500–700). Tracking: `-0.02em` on H1, `-0.015em` on H2.
- **Body:** `Inter` (variable, weights 400–500). Line-height `1.55` on prose, `1.4` on UI.
- **Mono accents:** `JetBrains Mono` (weight 500) — used sparingly for product chrome, code, keyboard hints (`⌘K`).

Sizes (clamp-based, mobile-first):
- H1 hero: `clamp(2.5rem, 5vw, 4.25rem)`
- H2: `clamp(1.75rem, 3vw, 2.5rem)`
- Body: `1rem` / `1.0625rem` on long-form
- Caption / eyebrow: `0.8125rem`, uppercase, `+0.08em` tracking, `Ink-3` color

---

## Motion (FINAL)

- **Duration:** 180 ms (micro), 240 ms (UI), 420 ms (hero reveal). Never longer.
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (Linear-style ease-out). No spring. No bounce.
- **Hero reveal:** single staggered fade-up — eyebrow → headline → subhead → CTA → product shot. ~80 ms stagger.
- **Scroll reveals:** subtle 12 px translate + opacity fade, triggered ~15 % into viewport. One per section, max.
- **Hover:** 120 ms color / border shifts. No transforms on buttons.
- **Respect `prefers-reduced-motion: reduce`** — all reveals become instant fades.

---

## UI patterns to incorporate

1. **Hairline grid.** 1px `#E6E7EB` dividers separate sections instead of background swaps. Stripe-style restraint.
2. **Eyebrow + headline.** Every section opens with a small uppercase eyebrow (`#8A8F98`) above the headline. Linear convention.
3. **Asymmetric hero.** Headline column ~7/12; product visual column ~5/12, drifts slightly off-grid.
4. **Mono ticks.** Use `JetBrains Mono` for stat numbers, `⌘K` chips, and inline kbd shortcuts. Two characters of monospace per section maximum.
5. **Callout cards.** Off-white card on canvas, hairline border, single accent-tinted icon — no gradients, no shadows.
6. **Pricing table.** Three columns, hairline borders, accent fill only on the recommended tier's CTA.

---

## Layout approach

- 12-column grid, max content width `1200px`, gutters `24px` desktop / `16px` mobile.
- Section vertical rhythm: `clamp(80px, 10vw, 144px)` between major sections.
- Asymmetric hero only; the rest of the site is centered, contained.
- No full-bleed background images. No gradients except the single hero accent wash (5 % opacity).

---

## Mood keywords

`Calm` · `Precise` · `Trustworthy` · `Confident-quiet` · `Operator-grade`

---

## What to avoid

- Drop shadows. The hairline does the work.
- Multi-stop gradients. One accent wash maximum.
- Bouncy motion (spring physics, overshoot).
- Glassmorphism / blur backdrops.
- Hero illustrations of inboxes / envelopes — too on-the-nose. Use abstract product surface instead.
- Dark mode for v0. Light-first is the brand. Dark mode is a v1 follow-up.
- Emoji in marketing copy.

---

## Ready for implementation

- [x] Colors defined (single accent, neutral scale, hairline)
- [x] Fonts selected (Inter Tight + Inter + JetBrains Mono)
- [x] Motion tokens set (durations, easing, reduced-motion fallback)
- [x] Layout approach set (12-col, asymmetric hero, hairline rhythm)
- [x] Approved (autonomous run — user asleep; iteration deferred to /verify)
