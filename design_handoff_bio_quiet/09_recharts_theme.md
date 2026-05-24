# 09 — Shared Recharts theme

## Goal
Centralize the SEIR color palette and tooltip/chart styling so the dashboard's aggregate chart and per-node line chart both use the same constants. The aggregate chart's compartment hexes must match the values shown in legends and node detail.

## New file

Create `lib/ui/charts.ts`:

```ts
// Bio Quiet — chart constants. Do not import from globals.css; keep these
// as TS constants so Recharts (which doesn't read CSS custom properties
// reliably) gets concrete hex values.

export const CHART = {
  // SEIR — semantic
  s: "#c9c4b6", // Susceptible — muted warm gray
  e: "#d3b07a", // Exposed     — muted ochre
  i: "#bb6f5d", // Infectious  — clay (the only red on the page)
  r: "#6a9a90", // Recovered   — sage teal
  d: "#3a342c", // Deaths      — warm near-black

  // Structure
  ink: "#26221b",
  muted: "#857d72",
  hair: "#e6e0d2",
  paper: "#fbfaf5",

  // Status
  accent: "#3d7a7a",
  alarm: "#bb6f5d",
} as const;

export const CHART_FONT = {
  sans: 'var(--font-inter), Inter, system-ui, sans-serif',
  mono: 'var(--font-plex-mono), ui-monospace, monospace',
};

// Tick label style (axis tick fontFamily comes from CSS through className on the SVG)
export const tickStyle = {
  fill: CHART.muted,
  fontSize: 11,
  fontFamily: CHART_FONT.mono,
};

// Tooltip — Recharts inline style version (the global rule in globals.css
// applies for default tooltip class; this is here as a fallback / for charts
// that customize their tooltip render).
export const tooltipContentStyle: React.CSSProperties = {
  background: CHART.paper,
  border: `1px solid ${CHART.hair}`,
  borderRadius: 8,
  boxShadow: "0 6px 20px rgba(38, 34, 27, 0.08)",
  fontFamily: CHART_FONT.sans,
  fontSize: 12,
  padding: "10px 12px",
  letterSpacing: 0,
  textTransform: "none",
};

export const tooltipLabelStyle: React.CSSProperties = {
  color: CHART.muted,
  fontSize: 11,
  marginBottom: 4,
};

export const tooltipItemStyle: React.CSSProperties = {
  fontFamily: CHART_FONT.mono,
  fontSize: 12,
};

// Compartment order for stacked area rendering — back-to-front:
// S (largest, behind) → R → E → I (front, with stroke). Deaths are a line, not a stack.
export const COMPARTMENT_ORDER = ["susceptible", "recovered", "exposed", "infected"] as const;

export const COMPARTMENT_FILL: Record<string, string> = {
  susceptible: CHART.s,
  exposed: CHART.e,
  infected: CHART.i,
  recovered: CHART.r,
  deaths: CHART.d,
};

export const COMPARTMENT_FILL_OPACITY: Record<string, number> = {
  susceptible: 0.45,
  exposed: 0.4,
  infected: 0.7,
  recovered: 0.35,
};
```

## How it's used

In `dashboard-shell.tsx` the existing `<AggregateChart>` and `<NodeDetailPanel>` import from this module:

```ts
import {
  CHART,
  tickStyle,
  tooltipContentStyle,
  tooltipLabelStyle,
  tooltipItemStyle,
  COMPARTMENT_FILL,
  COMPARTMENT_FILL_OPACITY,
} from "@/lib/ui/charts";
```

And the previously-hardcoded `"#e61919"`, `"#0a0a0a"`, `"#8a8780"`, `"#4a4a45"`, `"#5a5a55"` colors in `<Area>`, `<Line>`, `<XAxis>`, `<YAxis>`, `<CartesianGrid>` are all replaced with `CHART.*` references.

## Chart-specific layout rules

### Aggregate SEIR chart (the hero chart)
- Height: 320 → 360 (more room — chart is the centerpiece now)
- Stack order back-to-front: S, R, E, I. Each is its own `<Area>` with its own `stackId` so they overlap (same as today — keep this).
- `I` is the only Area with a visible stroke (`stroke={CHART.i} strokeWidth={1.2}`); the others use `stroke="none"`.
- Deaths are `<Line type="monotone" stroke={CHART.d} strokeWidth={1.4} dot={false} />` — solid (not dashed) and on top.
- `<CartesianGrid stroke={CHART.hair} strokeDasharray="3 3" vertical={false} />`.
- Axes: `tickLine={false}`, `axisLine={{ stroke: CHART.hair }}`, `tick={tickStyle}`.

### Per-node detail line chart
- Height: 150 (unchanged).
- Two lines only: infected (`CHART.i`, weight 1.6) and hospitalized (`CHART.d`, weight 1.2, **dashed** `strokeDasharray="4 3"`).
- A dashed horizontal `<ReferenceLine>` at `selectedNode.hospitalCapacity` in `CHART.alarm`, labelled "capacity" on the right.
- A vertical `<ReferenceLine x={currentDay} stroke={CHART.accent} strokeWidth={0.8} />` marking "today."

### Removed
- The `text-transform: uppercase` rule on `.recharts-default-tooltip` from the old globals — already removed by the new globals.css.
- Any per-chart `letterSpacing: "0.06em"` override in inline styles.
