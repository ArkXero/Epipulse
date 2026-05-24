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
