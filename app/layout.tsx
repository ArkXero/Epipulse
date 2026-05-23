import type { Metadata } from "next";
import { Archivo_Black, IBM_Plex_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const displayFont = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"]
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "EPIPULSE / NETWORK SEIR COMMAND",
  description:
    "Deterministic city-scale outbreak telemetry. Network SEIR simulation, intervention planning, and live advisor briefings."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${monoFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
