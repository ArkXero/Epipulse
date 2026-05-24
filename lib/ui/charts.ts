import type { CSSProperties } from "react";

// Bio Quiet chart constants. Keep concrete hex values for Recharts, which
// does not consistently resolve CSS custom properties in inline SVG styles.
export const CHART = {
  s: "#c9c4b6",
  e: "#d3b07a",
  i: "#bb6f5d",
  r: "#6a9a90",
  d: "#3a342c",

  ink: "#26221b",
  muted: "#857d72",
  hair: "#e6e0d2",
  paper: "#fbfaf5",

  accent: "#3d7a7a",
  alarm: "#bb6f5d"
} as const;

export const CHART_FONT = {
  sans: "var(--font-inter), Inter, system-ui, sans-serif",
  mono: "var(--font-plex-mono), ui-monospace, monospace"
};

export const tickStyle = {
  fill: CHART.muted,
  fontSize: 11,
  fontFamily: CHART_FONT.mono
};

export const tooltipContentStyle: CSSProperties = {
  background: CHART.paper,
  border: `1px solid ${CHART.hair}`,
  borderRadius: 8,
  boxShadow: "0 6px 20px rgba(38, 34, 27, 0.08)",
  fontFamily: CHART_FONT.sans,
  fontSize: 12,
  padding: "10px 12px",
  letterSpacing: 0,
  textTransform: "none"
};

export const tooltipLabelStyle: CSSProperties = {
  color: CHART.muted,
  fontSize: 11,
  marginBottom: 4
};

export const tooltipItemStyle: CSSProperties = {
  fontFamily: CHART_FONT.mono,
  fontSize: 12
};

export const COMPARTMENT_ORDER = [
  "susceptible",
  "recovered",
  "exposed",
  "infected"
] as const;

export const COMPARTMENT_FILL: Record<string, string> = {
  susceptible: CHART.s,
  exposed: CHART.e,
  infected: CHART.i,
  recovered: CHART.r,
  deaths: CHART.d
};

export const COMPARTMENT_FILL_OPACITY: Record<string, number> = {
  susceptible: 0.45,
  exposed: 0.4,
  infected: 0.7,
  recovered: 0.35
};
