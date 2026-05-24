# 05 — `components/landing/landing-shell.tsx`

## Goal
Full rewrite. Same file path, same default export (`LandingShell`). The COBE globe component (`@/components/ui/cobe-globe`) is preserved and re-themed; all other markup is new. Copy comes from `10_copy_guide.md`.

## Layout structure (top to bottom)

1. **Top bar** — brand mark + nav + small "model running" indicator. Single 64px row. No hazard stripe under it.
2. **Hero** — two-column on desktop (1.3fr / 1fr), single column under 980px:
   - Left: eyebrow → big serif headline (sentence case, Newsreader 500) → sub-deck → two CTAs (primary pill teal "Open the dashboard", secondary ghost "Read the methods")
   - Right: the re-themed COBE globe in a 12px-radius paper card, with a small caption strip below
3. **Quiet stats row** — 4 cells, thin top/bottom rules, sans-serif numbers (no Archivo Black). Replaces the "BIG NUMBERS STRIP."
4. **"What the model does"** — six modules in a 3×2 grid, each a card with: small accent eyebrow (`01.` in `--font-mono`, accent-teal), card title (sentence case, weight 500), body copy. No icons.
5. **"How it works"** — four steps in a 4-column band, separated by hairlines. Step number in `--font-mono`, accent teal, no big oversized "01" Archivo Black.
6. **"Under the hood"** — the existing tech table, restyled (hairline borders, no inverse `bg-ink` header, normal-case column heads).
7. **Closing CTA** — single short line + "Open the dashboard" primary button. NOT a giant Archivo headline shouting "RUN THE OUTBREAK."
8. **Footer** — one quiet line.

## Visual specs

### Top bar
- Container: `max-w-[1280px] mx-auto px-12 max-md:px-5`
- Border-bottom: `1px solid var(--color-hair)` (was 2px ink)
- Brand: small circle in `--color-paper-deep` with a 16px pulse glyph in `--color-accent`. Brand wordmark in Inter 17px / weight 500.
- Nav links: 13.5px Inter, color `--color-body`, active link in `--color-ink` weight 500. NO uppercase. NO `bg-red` active state.
- Right cluster: `<span class="dot" />` followed by the text "Model running" in `--color-muted` 12px, plus a small "Open dashboard" button (8px radius, ink-on-bg).

### Hero
- Padding: `56px 48px 64px` (was `64px 64px 80px` with extra hazard stripe above).
- Eyebrow: 12.5px, `--color-accent`, weight 500. Sentence case: `Denver · New York · DC-MD-VA · island scenario`.
- Headline: Newsreader, weight 500, sentence case. Size: `clamp(36px, 5vw, 56px)`. Line-height 1.08. Letter-spacing `-0.02em`. **The word "simulated" is italicized in Newsreader italic 500.** Max-width `780px`.
- No `--color-red` in the headline. No `border-b-[6px] border-ink pb-[2px]` underline trick. No oversized dot.
- Sub-deck: Inter 16px, `--color-body`, line-height 1.6, max-width 560px, `margin-top: 18px`.
- CTAs container: `flex gap-3 mt-9`. NOT inside a border-frame.
- Primary CTA: `px-5 py-3 rounded-full bg-[--color-accent] text-white text-sm font-medium hover:bg-[--color-accent-deep]`. Label "Open the dashboard →" (arrow as a span, not a Lucide icon).
- Secondary CTA: `px-5 py-3 rounded-full border border-[--color-rule] text-[--color-ink] text-sm hover:bg-[--color-paper]`. Label "Read the methods."

### Globe panel (right of hero)
- Card: `bg-[--color-paper] border border-[--color-hair] rounded-[12px] p-8`
- The COBE globe inside is the existing `<Globe>` component, configured with the same `markers` and `arcs` arrays as today **but with new colors**:
  - `markerColor={[0.24, 0.48, 0.48]}` (accent teal, RGB normalized from `#3d7a7a`)
  - `arcColor={[0.24, 0.48, 0.48]}`
  - `baseColor={[0.97, 0.95, 0.91]}` (paper)
  - `glowColor={[0.96, 0.94, 0.88]}` (paper-soft)
  - `dark={0}`
  - `mapBrightness={8}` (was 10 — slightly softer)
  - `markerSize={0.022}`
- Remove the four red corner-bracket spans around the globe (`absolute -top-2 -left-2 w-[14px] h-[14px] border-2 border-red bg-paper`). They were brutalist registration marks; gone.
- Caption strip below globe: three cells separated by hairlines (not 2px borders). Each cell shows a label in `--color-muted` 11px + a tabular value in `--color-ink` 15px Inter 500. Examples: `Grid · 12 nodes` / `Mobility arcs · 9` / `Mode · SEIR–D`. (NOT `[ GRID ] / 12 NODES` Archivo Black red.)

### Quiet stats row
- 4 columns, `border-t border-b border-[--color-hair]`, no vertical dividers inside (or thin `border-r border-[--color-hair]` only).
- Each cell: padding `28px 24px`, label in `--color-muted` 12px, value in Inter 32px weight 400 (`.tabular`), tracking `-0.02em`, supporting line in `--color-body` 12.5px.
- Values: `R₀ 2.4 / 16 nodes / 120 days / < 50 ms` — note the lowercase units, the space-separated label-value pairs, and the use of `R₀` glyph (U+2080) instead of `R0`.
- **NO red on any value.** The brutalist version had random cells flipped to red; here they're all `--color-ink`.

### "What the model does" — six modules
- Section padding: `80px 48px`.
- Eyebrow + heading row: eyebrow in `--font-mono` 11px `--color-muted` letter-spacing `0.04em` `What the model does`, then heading in Inter 32px weight 500 sentence case `Six modules. One product.`
- 3×2 grid (`grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1`), gap `1px` with a `--color-hair` background underneath, so cells share hairline edges.
- Each card: `bg-[--color-paper] p-7 min-h-[200px] flex flex-col gap-3`.
- Eyebrow inside card: `01.` (mono, 11px, `--color-accent`, no slash glyph).
- Title: Inter 18px weight 500, sentence case.
- Copy: Inter 13.5px `--color-body`, line-height 1.55.
- No icon. (The brutalist version had a Lucide icon top-right in red; that's gone.)

### "How it works" — four steps
- 4 columns, hairline dividers between (not 2px ink).
- Each step: `p-7`, gap 2.
- Number: `--font-mono` 13px `--color-accent` weight 500. (NOT a 64px Archivo Black red glyph.)
- Step label: 11px `--color-muted` Title Case ("Configure" / "Simulate" / "Intervene" / "Brief").
- Title: Inter 17px weight 500.
- Body: Inter 13.5px `--color-body`.

### "Under the hood" — table
- `border border-[--color-hair] rounded-[12px] overflow-hidden`.
- Header row: `bg-[--color-paper-soft]`, text `--color-ink` weight 500, sentence case (`Layer / Library / What it does`). NO inverse `bg-ink text-white` header.
- Body rows: alternating `bg-[--color-paper]` and `bg-transparent` (very subtle).
- Layer column: 22% width, Inter 13.5px weight 500.
- Library column: 28%, `.tabular` (mono).
- Function column: rest, Inter 13.5px `--color-body`.
- Row borders: `border-t border-[--color-hair]`.
- Remove the red treatment on the `/lib/model` and `Anthropic Claude` rows.

### Closing CTA
- Padding: `96px 48px`. No `border-b-2 border-ink`.
- One headline in Newsreader 36px weight 500 sentence case: `Run a scenario.`
- One sub-line: `Runs in your browser. No account, no tracking.` in `--color-muted` 13.5px.
- One primary teal pill CTA `Open the dashboard →`. NO secondary "Advisor" button next to it.

### Footer
- Single row, `border-t border-[--color-hair]`, `py-7 px-12`.
- Left: "Epipulse · open-source SEIR simulation · 2026" in `--color-muted` 12px.
- Right: three quiet links — `Methods · GitHub · Advisor` (Inter 12.5px `--color-body`). NO `status nominal` dot.

## Deletions checklist
- [ ] `Activity`, `Crosshair`, `Hospital`, `Network`, `Radar`, `Radio`, `Sigma`, `Workflow` Lucide imports — replace with at most one or two if truly needed (probably just `ArrowRight` — and even that as a literal `→` glyph is fine).
- [ ] All `font-display` classes
- [ ] All `text-red` / `bg-red` classes in this file
- [ ] All `border-2 border-ink` classes — change to `border border-[--color-hair]`
- [ ] All `uppercase` / `tracking-[…]` extreme-tracking utilities
- [ ] The hazard stripe `<div className="h-[22px] hazard-stripe ...">` element
- [ ] Corner bracket spans around the globe
- [ ] `pulse-dot` class
- [ ] The `STATUS NOMINAL` line in footer

## Reference
Look at `reference/dashboard-bio.jsx`'s topbar + hero + footer for tone, spacing, and the teal accent. The landing page extends the same system — the dashboard prototype is the closest visual ground truth.
