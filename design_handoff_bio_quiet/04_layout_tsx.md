# 04 — `app/layout.tsx`

## Goal
- Swap fonts: drop `Archivo_Black`, add `Inter` and `Newsreader`. Keep `IBM_Plex_Mono` for tabular numbers.
- Rewrite the page `<title>` and `<meta description>` to match the new voice (see `10_copy_guide.md`).

## Full replacement file

```tsx
import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Newsreader } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap"
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap"
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Epipulse — outbreak simulation",
  description:
    "A deterministic, browser-based SEIR simulator for city-scale outbreaks. Move interventions, watch hospital capacity, ask the advisor."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plexMono.variable} ${newsreader.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
```

## Notes for Claude Code

- The three `--font-*` CSS variables map directly to the names in `03_globals.css` (`--font-inter`, `--font-plex-mono`, `--font-newsreader`). Do not rename them.
- `display: "swap"` keeps the page readable while the web fonts load — important because the prior config used `display` weight 400 only and would FOUT to system fonts anyway.
- If the Next.js build complains about the Newsreader weights, install with just `["400", "500"]` — italic styles come along automatically because the Google Fonts file is variable.
- Do NOT remove the `leaflet/dist/leaflet.css` import. The new map styling adds rules on top of Leaflet's defaults; it doesn't replace them.
