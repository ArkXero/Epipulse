# 02 — Design tokens

All values are final. These are the source of truth — every spec downstream of this file uses one of these tokens or a value derived from them.

## Color

### Surface
| Token | Hex | Purpose |
|---|---|---|
| `--color-bg` | `#f5f2ea` | App ground (warm off-white) |
| `--color-paper` | `#fbfaf5` | Card / panel surface |
| `--color-paper-soft` | `#efeadd` | Map basemap fill; subdued panel inset |
| `--color-paper-deep` | `#e8e2d4` | Slider track, very low-emphasis fills |

### Text
| Token | Hex | Purpose |
|---|---|---|
| `--color-ink` | `#26221b` | Headings, primary text, dark fills |
| `--color-body` | `#4d4740` | Body copy, descriptions |
| `--color-muted` | `#857d72` | Labels, meta, axis ticks |
| `--color-faint` | `#b8b1a4` | Disabled, separators inside dense components |

### Hairlines
| Token | Hex | Purpose |
|---|---|---|
| `--color-hair` | `#e6e0d2` | Hairline borders, gridlines |
| `--color-rule` | `#d8d2c2` | Stronger rules, card outlines |

### Accent (the single one)
| Token | Hex | Purpose |
|---|---|---|
| `--color-accent` | `#3d7a7a` | Primary action, focus ring, model "running" indicator, mobility lines, advisor markers, links |
| `--color-accent-soft` | `#e3ece8` | Backgrounds for accent surfaces (advisor note bg, focus halos) |
| `--color-accent-deep` | `#2c5a5a` | Pressed/active state on primary CTA |

### SEIR compartments — semantic, NOT decorative
| Token | Hex | Compartment | Notes |
|---|---|---|---|
| `--color-s` | `#c9c4b6` | Susceptible | Muted warm gray |
| `--color-e` | `#d3b07a` | Exposed | Muted ochre |
| `--color-i` | `#bb6f5d` | **Infectious** | Muted clay — this is the ONLY red on the page outside of breach |
| `--color-r` | `#6a9a90` | Recovered | Sage teal (intentionally close to `--color-accent`) |
| `--color-d` | `#3a342c` | Deaths | Warm near-black |

### Status
| Token | Hex | Purpose |
|---|---|---|
| `--color-alarm` | `#bb6f5d` | Same hex as `--color-i`. Used for breach badges, breach annotation lines on charts, "capacity breached" pill. Never used decoratively. |
| `--color-alarm-soft` | `#f3e0da` | Pale clay tint behind breach pills/banners |
| `--color-ok` | `#6a9a90` | "Model running," "Open" node state, healthy indicators |

> **Red discipline.** Bio Quiet is a single-accent system. `--color-i` and `--color-alarm` share a hex on purpose — clay shows up only where it carries epidemiological meaning (infectious population, capacity breach). If you find yourself reaching for it for a hover state, a label, a kicker, or a button, stop — use `--color-accent` (teal) or `--color-ink` instead.

## Typography

### Fonts (loaded via `next/font/google`)
| Family | Variable | Weights | Use |
|---|---|---|---|
| **Inter** | `--font-sans` | 400, 500, 600 | Everything except numbers and serif headlines |
| **Newsreader** | `--font-serif` | 400, 500 (incl. italic) | Optional editorial headlines on landing only; dashboard/advisor are sans throughout |
| **IBM Plex Mono** | `--font-mono` | 400, 500 | Tabular numbers, day counters, R₀, code IDs |

### Type scale
| Token | Size | Line-height | Weight | Use |
|---|---|---|---|---|
| `display-xl` | clamp(36px, 5vw, 56px) | 1.08 | 500 | Landing hero headline only |
| `display-lg` | 32–40px | 1.1 | 500 | Section H2 on landing |
| `h1` | 24–28px | 1.2 | 500 | Page-level H1 on dashboard / advisor |
| `h2` | 18–20px | 1.25 | 500 | Card / section H2 |
| `h3` | 15–16px | 1.3 | 500 | Card H3 |
| `body` | 14px | 1.55 | 400 | Default body text |
| `body-lg` | 15.5–16px | 1.6 | 400 | Hero subhead, advisor message body |
| `label` | 12–12.5px | 1.4 | 500 | Form labels, panel kickers (sentence case or Title Case — NOT all caps) |
| `meta` | 11–11.5px | 1.4 | 400 | Axis ticks, supporting meta, sources |
| `caption` | 10.5px | 1.4 | 500 | Tabular column heads (small caps allowed here only) |

### Tracking
- Default tracking: **0** (Inter at the sizes above is correctly tracked out of the box).
- Headlines: `-0.015em` (subtle, never the −0.04em / −0.05em of the old brutalist stack).
- Small caps / labels: `0.04em` (gentle, never `0.14em`).
- Tabular numbers: `0`.

### Casing
- Headlines: **Sentence case.** "A respiratory virus is peaking across the Denver network today" — not "RESPIRATORY VIRUS PEAK."
- Labels & metadata: Title Case or sentence case. No `text-transform: uppercase` defaults.
- The only place uppercase is acceptable: 10.5px tabular column heads in dense data tables, and short status pills (`OPEN` / `CLOSED`) where length is constrained — even there, prefer sentence case.

## Spacing

8-pt scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64. Tailwind defaults are fine.

- Card padding (default): `22px 24px` (≈ Tailwind `p-6`)
- Section padding (page-level, desktop): `40px 56px`
- Section padding (page-level, mobile): `24px 20px`
- Gap between cards in a column: `24px`
- Gap between primary columns: `40px`

## Radius

Bio Quiet has corners again. Match the visual weight of the element.

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Inputs, small buttons, slider handles, code IDs |
| `--radius-md` | 8px | Standard buttons, node-toggle buttons, segmented controls |
| `--radius-lg` | 12px | Cards, panels, the message bubbles in the advisor |
| `--radius-pill` | 999px | Status pills, the playback control track, primary CTAs on landing |

> Buttons on landing (the "Run scenario" CTA) use `--radius-pill`. Buttons inside dense dashboard controls use `--radius-md` (8px). Do not mix pill and rect buttons in the same density region.

## Borders & shadows

- **Default border:** `1px solid var(--color-hair)`. The 2px ink borders from the brutalist system are gone.
- **Card border:** `1px solid var(--color-hair)`.
- **Focus ring:** `0 0 0 3px color-mix(in srgb, var(--color-accent) 28%, transparent)`.
- **Shadow (rare; only for slider thumbs and floating advisor note):** `0 1px 3px rgba(38, 34, 27, 0.06)`. No dramatic drop shadows.

## Motion

- **Default transition:** `120ms ease` on color, background, border, opacity.
- **Hover state:** subtle background darkening (`color-mix(in srgb, var(--color-paper) 92%, var(--color-ink))`) — never a hue shift.
- The `pulse-dot` animation is removed.

## Tailwind v4 `@theme` block (ready to paste)

This goes at the top of `app/globals.css` — the existing file replaces its entire `@theme` block with this one. (Full `globals.css` is in `03_globals.css`.)

```css
@theme {
  /* Surface */
  --color-bg:           #f5f2ea;
  --color-paper:        #fbfaf5;
  --color-paper-soft:   #efeadd;
  --color-paper-deep:   #e8e2d4;

  /* Text */
  --color-ink:          #26221b;
  --color-body:         #4d4740;
  --color-muted:        #857d72;
  --color-faint:        #b8b1a4;

  /* Hairlines */
  --color-hair:         #e6e0d2;
  --color-rule:         #d8d2c2;

  /* Accent (single) */
  --color-accent:       #3d7a7a;
  --color-accent-soft:  #e3ece8;
  --color-accent-deep:  #2c5a5a;

  /* SEIR compartments (semantic) */
  --color-s:            #c9c4b6;
  --color-e:            #d3b07a;
  --color-i:            #bb6f5d;
  --color-r:            #6a9a90;
  --color-d:            #3a342c;

  /* Status */
  --color-alarm:        #bb6f5d;
  --color-alarm-soft:   #f3e0da;
  --color-ok:           #6a9a90;

  /* Fonts (resolved via next/font CSS variables — see layout.tsx) */
  --font-sans:  var(--font-inter), "Inter", system-ui, sans-serif;
  --font-serif: var(--font-newsreader), Georgia, "Times New Roman", serif;
  --font-mono:  var(--font-plex-mono), ui-monospace, "IBM Plex Mono", monospace;

  /* Radius — corners are back */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;
}
```

### Tailwind utility name → token mapping

Components reference these utility classes; the @theme block above makes them resolve to the new tokens.

| Old / Existing class | Resolves to | Notes |
|---|---|---|
| `bg-paper` | `--color-paper` | Card background |
| `bg-paper-soft` | `--color-paper-soft` | Inset / map base |
| `text-ink` | `--color-ink` | Heading text |
| `text-muted` | `--color-muted` | Labels |
| `text-red` | **DELETE all usages.** Replace with `text-[--color-i]` for compartment text, `text-[--color-alarm]` for breach, `text-accent` for emphasis | The whole point of the migration |
| `bg-red` | Same — delete or replace contextually | |
| `font-display` | **DELETE class.** Heading sizing handled by component styles + `font-sans` (Inter at 500) | |
| `font-mono` | `--font-mono` | Numbers only |

> A small new utility `.tabular { font-variant-numeric: tabular-nums; }` is added in `03_globals.css` for numeric values inside otherwise-sans contexts.
