# Reference files

These are the HTML prototypes the specs are derived from. They're React/JSX prototypes — not production code to ship. Use them as visual ground truth when implementing the specs in the Next.js codebase.

## Open `Outbreak Console — Three Directions.html` in a browser

That's the design canvas. It shows:

- The written critique of the current brutalist design
- **Direction 01 — Clinical editorial** (Newsreader + Inter, OWID-style)
- **Direction 02 — EOC dark** (deep navy, monitoring console)
- **Direction 03 — Bio quiet** ← *this is the one the specs implement*

The user selected Direction 03; the other two are included so reviewers can see what was rejected and why.

## File map

- `Outbreak Console — Three Directions.html` — the canvas entry point. Open this in any modern browser.
- `epi-data.jsx` — mock Denver SEIR timeline + node data. Replaces the live `lib/model` output for the prototype.
- `dashboard-bio.jsx` — the Direction 03 dashboard prototype (visual ground truth for `06_dashboard_shell.md`, `07_outbreak_map.md`, `08_advisor_shell.md`).
- `dashboard-clinical.jsx`, `dashboard-eoc.jsx` — the rejected directions, kept for context.
- `design-canvas.jsx` — Figma-style canvas wrapper for the three boards. Not used by the production code.

The CDN scripts (React 18, Babel) are loaded from inside the HTML — no install step required. Double-click and it works.
