# Handoff: Epipulse → Bio Quiet design system

## Overview

This package migrates the Epipulse codebase (`ArkXero/Epipulse`) from its current "Industrial Brutalist" design system to **Bio Quiet** — a restrained, research-instrument aesthetic that fits the public-health subject matter.

**Why we're doing this** (verbatim from the design review):

> The brutalist skin is well-made, but it's military cosplay, not public health. Aviation hazard stripes, "OUTBREAK COMMAND CONSOLE," "UNIT / EP-001," ALL-CAPS Archivo Black body type, and red used as decoration (so it can't function as a real alarm signal) all push the product toward Plague-Inc.-the-video-game when the actual work is sober deterministic SEIR. Bio Quiet commits to "the math is the hero" — gets out of the chart's way, reserves red exclusively for `I` (infectious) and breach states, and reads like Our World in Data or a modern lab instrument rather than a war room.

---

## About the files in this bundle

These are **design references**, not production code to copy-paste.

- `reference/dashboard-bio.jsx` is a self-contained React prototype showing the target dashboard look.
- `reference/Outbreak Console.html` is the original three-direction canvas (Clinical Editorial / EOC Dark / Bio Quiet) so reviewers can see what was rejected and why.
- `reference/epi-data.jsx` is mock SEIR data used by the prototype — your real `lib/model` already produces the equivalent.

The **specs** (numbered `01_…` through `10_…`) tell you exactly what to change in the existing Next.js codebase. Work through them **in order**.

## Fidelity

**Hi-fi.** Every color hex, type stack, spacing value, and radius below is final. Recreate the prototypes pixel-for-pixel using the codebase's existing Tailwind v4 + Recharts + Leaflet stack — do not introduce new dependencies (no shadcn, no new chart library, no new font loader). The brand voice and copy are also final — see `10_copy_guide.md`.

## What stays, what goes

**KEEP**
- Next.js 16 + React 19 + App Router structure
- Tailwind v4 with `@theme` block (we just rewrite the tokens)
- Recharts for SEIR / per-node charts
- Leaflet + react-leaflet for the map
- Zustand store, all of `lib/model`, all `app/api/*` routes
- `next/font/google` font loading mechanism
- IBM Plex Mono — but only for tabular numbers and code IDs, not body
- `lucide-react` icons (much lighter usage than before)
- Two-column dashboard layout bones (chart + map left, controls right)

**REMOVE**
- `Archivo_Black` import (replaced by `Inter`)
- `font-display`, `--font-display` token
- All `text-red`, `bg-red`, `border-red` usages that are decorative (kicker text, nav active, button hover, etc.). Red survives only as the `I` series color and the breach/alarm state.
- `.hazard-stripe` utility and its uses
- `.pulse-dot` animation
- `body::before` SVG noise overlay
- `.leaflet-tile { filter: grayscale(1) }` rule
- `--radius-*: 0` overrides — corners come back at 8/10/12
- `border-radius: 0 !important` on `button, input, select, textarea`
- All `text-transform: uppercase` on headings — Bio Quiet is sentence case
- `letter-spacing: -0.04em / -0.05em` extreme negative tracking on display type
- Copy fragments: "OUTBREAK COMMAND CONSOLE," "UNIT / EP-001," "REV 2.6," "LIVE TELEMETRY," "[ DELIVERY SYSTEMS ]," "RUN THE OUTBREAK," "THE MATH NEVER LIES," "DELIVERY SYSTEMS," "COMMAND VIEW," "OPERATIONAL FLOW," "TECHNICAL DOSSIER," `[ NO ACCOUNT / NO TELEMETRY / RUNS IN BROWSER ]`. See the copy guide for replacements.

## Files in this bundle

| # | File | Purpose |
|---|---|---|
| 00 | `README.md` | This file |
| 01 | `01_migration_plan.md` | Step-by-step execution order |
| 02 | `02_design_tokens.md` | All colors, type, spacing, radius — Tailwind v4 `@theme` block ready to paste |
| 03 | `03_globals.css` | Drop-in replacement for `app/globals.css` |
| 04 | `04_layout_tsx.md` | Spec for `app/layout.tsx` |
| 05 | `05_landing_shell.md` | Spec for `components/landing/landing-shell.tsx` (full rewrite) |
| 06 | `06_dashboard_shell.md` | Spec for `components/dashboard/dashboard-shell.tsx` |
| 07 | `07_outbreak_map.md` | Spec for `components/dashboard/outbreak-map.tsx` |
| 08 | `08_advisor_shell.md` | Spec for `components/advisor/advisor-shell.tsx` |
| 09 | `09_recharts_theme.md` | Reusable Recharts color/tooltip constants |
| 10 | `10_copy_guide.md` | Voice, tone, words to avoid, full replacement copy |
| — | `reference/` | The HTML prototype + canvas these specs are derived from |

## How to execute

1. Branch: `git checkout -b feat/bio-quiet`
2. Work through the specs in numerical order. Each one is independent enough to commit on its own.
3. After 03 (`globals.css`) the app will look broken — that's expected. The Tailwind classes the existing components reference (`bg-paper`, `text-red`, `font-display`, etc.) get re-pointed in the new `@theme` block, so the cascade stays valid even mid-migration. Components rendered before their spec is applied will look unstyled-ish but won't crash.
4. After each shell rewrite (05-08), run `npm run dev` and visually check that screen against the matching reference image / region of the prototype.
5. `npm run typecheck && npm run lint && npm test` should pass at the end — none of the model code is touched.

## Acceptance checks (run at the end)

- [ ] No occurrence of "COMMAND," "OUTBREAK COMMAND," "TELEMETRY," "UNIT / EP-001," "REV," "DOSSIER," "DELIVERY SYSTEMS," "HAZARD" anywhere in `app/` or `components/`
- [ ] No `text-transform: uppercase` on any `<h1>`–`<h4>` (legacy small all-caps "labels" with `tracking-wider` survive only on tabular column heads and dense status pills — see token guide)
- [ ] No `font-display` class usage; no `--font-display` token
- [ ] No `.hazard-stripe`, `.pulse-dot`, `body::before` noise overlay, `.leaflet-tile { filter: grayscale }` rule in `globals.css`
- [ ] Red (`--color-i` / `--color-alarm`) appears only on: the infectious-compartment area, breach badges, the breach annotation line on charts, the breach pill in node detail. It does not appear on nav, buttons, hover states, kicker labels, or decorative elements.
- [ ] Leaflet map renders in color (no grayscale filter), with the soft basemap and accent-teal mobility lines from the spec.
- [ ] Default body font on every page is Inter; IBM Plex Mono only appears on numeric values (`.tabular`, `<dd>` in metric cells, day counters) and short code identifiers (run IDs if any).

---

Generated 2026-05-24 from the design canvas at `Outbreak Console — Three Directions.html`.
