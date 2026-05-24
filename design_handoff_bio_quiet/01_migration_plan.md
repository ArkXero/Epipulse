# 01 — Migration plan

Execute in this order. Each numbered step is roughly one commit.

## Step 1 — Tokens & globals (foundational)
- **Files:** `app/globals.css`, `app/layout.tsx`
- **Specs:** `02_design_tokens.md`, `03_globals.css`, `04_layout_tsx.md`
- Swap fonts (Archivo Black → drop; keep IBM Plex Mono; add Inter).
- Replace the `@theme` block wholesale with the Bio Quiet tokens.
- Delete the noise overlay, hazard-stripe utility, pulse-dot animation, leaflet grayscale, `border-radius: 0 !important` cascade, and all-caps heading defaults.
- Add new utility classes the components rely on (`.tabular`, `.kbd`, `.pill-…`).
- **Verification:** App boots. Existing components look unstyled-ish but no console errors, no missing-class warnings.

## Step 2 — Shared chart theme
- **File:** new `lib/ui/charts.ts`
- **Spec:** `09_recharts_theme.md`
- Centralize Recharts colors (`CHART_COLORS`) and a `chartTooltipStyle` constant. Both the dashboard's aggregate chart and the node-detail line chart will import from here in step 3.

## Step 3 — Dashboard shell
- **File:** `components/dashboard/dashboard-shell.tsx`
- **Spec:** `06_dashboard_shell.md`
- Largest change. Rewrites the topbar, hero, metrics strip, panel chrome, slider control, intervention card, node detail, narration panel, and chart styling.
- Imports the chart constants from step 2.
- **Verification:** Open `/dashboard`, load Denver preset, press play. Aggregate chart, map, sliders, node toggles, and narrate button all functional.

## Step 4 — Outbreak map
- **File:** `components/dashboard/outbreak-map.tsx`
- **Spec:** `07_outbreak_map.md`
- Replaces the CircleMarker styling and removes the grayscale tile filter.
- Adds tooltip styling, mobility line layer (optional/nice-to-have if time permits), and a soft basemap source choice (CARTO Voyager).
- **Verification:** Map renders in color, node circles use the teal/clay palette, hover tooltips have the new look.

## Step 5 — Advisor shell
- **File:** `components/advisor/advisor-shell.tsx`
- **Spec:** `08_advisor_shell.md`
- New chat surface — message bubbles in clay (user) and paper (assistant), context dl in tabular mono, alarm footer becomes a calm advisory note.

## Step 6 — Landing shell
- **File:** `components/landing/landing-shell.tsx`
- **Spec:** `05_landing_shell.md`
- Full content rewrite — new headline, new section order, new copy. The globe component stays (`@/components/ui/cobe-globe`) but is re-themed.
- **Verification:** Open `/`. Headline reads sentence case in Newsreader (or chosen serif), accent teal CTA, no hazard stripe, no "REV 2.6" chrome.

## Step 7 — Copy sweep & metadata
- **File:** `app/layout.tsx` metadata, README.md in repo if it references the old marketing line
- **Spec:** `10_copy_guide.md`
- Replace title `EPIPULSE / NETWORK SEIR COMMAND` → `Epipulse — outbreak simulation`. Description gets the rewritten one.
- Grep for any leftover "COMMAND," "TELEMETRY," "HAZARD," "DOSSIER," "DELIVERY SYSTEMS" strings in `app/` and `components/` and fix them.

## Step 8 — Cleanup
- Remove `pulse-dot` and `hazard-stripe` class references that linger.
- Run `npm run typecheck && npm run lint && npm test`.
- Manual QA pass on `/`, `/dashboard`, `/advisor` at desktop and tablet widths.

## Estimated effort
~1–1.5 days for a developer familiar with the codebase, assuming Claude Code does the bulk of the per-file rewrites and the dev reviews + tweaks at each commit.
