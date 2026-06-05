# Logo selection

Three concepts, all flat `#5448E6` fill on `#FAFAF7` canvas. No gradients, no shadows. Wordmark: Inter Tight 600 at `-0.02em` tracking.

## Concept 1 — "L-mark" (SELECTED)

A bold geometric L. Same lineage as Linear's three-stroke mark and Vercel's triangle: a single primitive shape that scales from favicon to billboard without losing identity.

- Reads instantly as "L for Latch."
- Works at 16×16 (favicon) without becoming a blob.
- Pairs cleanly with Inter Tight wordmark — both share the same geometric DNA.
- Most restrained of the three — fits "calm authority" from the moodboard.

## Concept 2 — "Bolt"

A horizontal capsule with a perpendicular tab, suggesting a sliding bolt latch. Most literal, most clever. Rejected because the perpendicular tab introduces visual noise at small sizes and the metaphor (sliding bolt) is too on-the-nose — same trap as the "envelope icon" the moodboard warned against.

## Concept 3 — "Slot"

A square with a slot cut into its right edge — a "latch receiver." Most abstract, most distinctive. Rejected because at favicon size it reads as a "C" or a poorly-rendered "U" rather than a deliberate mark. Filed for v1 if we ever need a secondary glyph.

## Final usage

- `apps/site/public/logo.svg` — Concept 1 mark, mark-only (the wordmark renders in HTML next to it so it inherits the loaded Inter Tight font).
- `apps/site/public/favicon.svg` — Concept 1 mark, same shape.
- Horizontal lockup for documentation and og:image: `design/logo/concept-1-L-lockup.svg`.
