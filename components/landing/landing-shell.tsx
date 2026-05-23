"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  Crosshair,
  Hospital,
  Network,
  Radar,
  Radio,
  Sigma,
  Workflow
} from "lucide-react";
import { Globe } from "@/components/ui/cobe-globe";

const markers = [
  { id: "den", location: [39.7392, -104.9903] as [number, number], label: "Denver" },
  { id: "nyc", location: [40.7128, -74.006] as [number, number], label: "New York" },
  { id: "dmv", location: [38.9072, -77.0369] as [number, number], label: "DC-DMV" },
  { id: "lon", location: [51.5074, -0.1278] as [number, number] },
  { id: "tok", location: [35.6762, 139.6503] as [number, number], label: "Tokyo" },
  { id: "sgp", location: [1.3521, 103.8198] as [number, number] },
  { id: "syd", location: [-33.8688, 151.2093] as [number, number], label: "Sydney" },
  { id: "sao", location: [-23.5505, -46.6333] as [number, number], label: "São Paulo" },
  { id: "lag", location: [6.5244, 3.3792] as [number, number] },
  { id: "mum", location: [19.076, 72.8777] as [number, number] },
  { id: "ist", location: [41.0082, 28.9784] as [number, number] },
  { id: "joh", location: [-26.2041, 28.0473] as [number, number] }
];

const arcs = [
  { id: "den-nyc", from: [39.7392, -104.9903] as [number, number], to: [40.7128, -74.006] as [number, number], label: "DEN → NYC" },
  { id: "nyc-lon", from: [40.7128, -74.006] as [number, number], to: [51.5074, -0.1278] as [number, number], label: "NYC → LONDON" },
  { id: "lon-mum", from: [51.5074, -0.1278] as [number, number], to: [19.076, 72.8777] as [number, number] },
  { id: "mum-sgp", from: [19.076, 72.8777] as [number, number], to: [1.3521, 103.8198] as [number, number] },
  { id: "sgp-tok", from: [1.3521, 103.8198] as [number, number], to: [35.6762, 139.6503] as [number, number], label: "SINGAPORE → TOKYO" },
  { id: "tok-syd", from: [35.6762, 139.6503] as [number, number], to: [-33.8688, 151.2093] as [number, number], label: "TOKYO → SYDNEY" },
  { id: "sao-lag", from: [-23.5505, -46.6333] as [number, number], to: [6.5244, 3.3792] as [number, number] },
  { id: "lag-joh", from: [6.5244, 3.3792] as [number, number], to: [-26.2041, 28.0473] as [number, number] },
  { id: "ist-mum", from: [41.0082, 28.9784] as [number, number], to: [19.076, 72.8777] as [number, number] }
];

const features = [
  { n: "01", icon: <Sigma size={22} strokeWidth={2.4} />, title: "Network SEIR", copy: "Deterministic compartmental model running across heterogeneous city nodes. No hidden randomness, no AI in the math." },
  { n: "02", icon: <Network size={22} strokeWidth={2.4} />, title: "Mobility Graph", copy: "Haversine-weighted flux between airports, transit, schools, hospitals, downtown and residential zones. Reproducible at every step." },
  { n: "03", icon: <Crosshair size={22} strokeWidth={2.4} />, title: "Intervention Levers", copy: "Transmission scaling, isolation compliance, travel restriction, node closure. Recompute timeline on lever movement." },
  { n: "04", icon: <Hospital size={22} strokeWidth={2.4} />, title: "Hospital Breach Tracking", copy: "Per-node capacity vs hospitalised load. First breach day surfaced as a hard alert across the entire run." },
  { n: "05", icon: <Brain size={22} strokeWidth={2.4} />, title: "Claude Advisor", copy: "Anthropic Claude reads the live simulation snapshot to brief operators. Generates text only — never the model state." },
  { n: "06", icon: <Radar size={22} strokeWidth={2.4} />, title: "Scenario Generation", copy: "Structured prompts produce city presets: Denver, NYC, DMV, island scenario. Falls back to deterministic preset when offline." }
];

const steps = [
  { n: "01", label: "Configure", title: "Load Preset", copy: "Pick a city baseline or generate one from a natural-language prompt. Population, disease, mobility — all locked in deterministically." },
  { n: "02", label: "Simulate", title: "Run Network SEIR", copy: "Per-day floating-point integration across all nodes. Airport importation, isolation, contact multipliers — applied each step." },
  { n: "03", label: "Intervene", title: "Move The Levers", copy: "Close nodes, raise isolation, restrict travel. Timeline recomputes on every change — no waiting, no caching." },
  { n: "04", label: "Brief", title: "Read Advisor", copy: "Stream operational guidance from Claude grounded in the current snapshot. Use it. Ignore it. The math is the source of truth." }
];

// shared utility class strings
const shell = "w-full max-w-[1440px] mx-auto px-8 max-md:px-5";
const sectionLabel = "font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-red m-0 mb-[18px] pb-3 border-b-2 border-ink";
const sectionTitle = "font-display text-[clamp(2.2rem,4.6vw,4rem)] leading-[0.9] tracking-[-0.04em] uppercase m-0 mb-[18px]";
const btnPrimary = "inline-flex items-center gap-[10px] px-[22px] py-4 font-mono text-xs font-bold tracking-[0.1em] uppercase border-0 bg-ink text-[#fffefa] border-r-2 border-ink transition-colors duration-100 hover:bg-red";
const btnSecondary = "inline-flex items-center gap-[10px] px-[22px] py-4 font-mono text-xs font-bold tracking-[0.1em] uppercase border-0 bg-transparent text-ink transition-colors duration-100 hover:bg-ink hover:text-[#fffefa]";

export function LandingShell() {
  return (
    <div className="w-full bg-paper text-ink">
      {/* TOPBAR */}
      <div className={shell}>
        <header className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center py-[18px] border-b-2 border-ink max-md:grid-cols-[1fr_auto] max-md:gap-3">
          <div className="flex items-center gap-[18px] font-mono text-[11px] font-semibold tracking-[0.1em] uppercase">
            <span className="inline-flex items-center gap-[10px] font-display text-lg tracking-[-0.02em] uppercase">
              <span className="inline-grid place-items-center w-7 h-7 text-[#fffefa] bg-ink">
                <Activity size={16} strokeWidth={2.4} />
              </span>
              Epipulse
            </span>
            <span className="text-muted">UNIT / EP-001</span>
            <span className="text-muted">REV 2.6</span>
          </div>
          <div />
          <div className="flex items-center justify-end gap-[18px] font-mono text-[11px] font-semibold tracking-[0.1em] uppercase max-md:hidden">
            <span className="flex items-center">
              <span className="inline-block w-2 h-2 bg-red mr-2 pulse-dot" />
              LIVE TELEMETRY
            </span>
            <Link href="/dashboard">Dashboard ↗</Link>
            <Link href="/advisor">Advisor ↗</Link>
          </div>
        </header>
      </div>

      {/* HAZARD STRIPE */}
      <div className="h-[22px] hazard-stripe border-b-2 border-ink" aria-hidden />

      {/* HERO */}
      <div className={shell}>
        <section className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-16 items-stretch py-16 pb-20 border-b-2 border-ink max-lg:grid-cols-1 max-lg:gap-9 max-lg:py-10 max-lg:pb-[60px]">
          <div className="flex flex-col justify-between min-w-0">
            <div>
              <p className="inline-flex items-center gap-3 m-0 mb-6 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-ink after:content-[''] after:h-px after:w-10 after:bg-ink">
                EPIDEMIC INTELLIGENCE / DETERMINISTIC / OPEN-SOURCE
              </p>
              <h1 className="font-display text-[clamp(3.5rem,8.2vw,8.2rem)] leading-[0.84] tracking-[-0.05em] uppercase m-0 mb-3">
                Outbreak
                <br />
                <span className="text-red">command</span>
                <br />
                <span className="inline-block border-b-[6px] border-ink pb-[2px]">console</span>
                <span className="text-red">.</span>
              </h1>
              <p className="max-w-[38ch] mt-8 text-[15px] leading-[1.6] text-ink">
                Epipulse runs city-scale network SEIR simulations in your browser.
                Move interventions. Watch hospitals breach. Ask the advisor what
                to do next — the math never lies.
              </p>
            </div>

            <div className="flex mt-10 border-2 border-ink w-fit">
              <Link href="/dashboard" className={btnPrimary}>
                Launch Console
                <ArrowRight size={14} strokeWidth={2.6} />
              </Link>
              <Link href="/advisor" className={btnSecondary}>
                Open Advisor
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col min-w-0">
            <div className="relative flex-1 grid place-items-center overflow-hidden border-2 border-ink bg-white p-10 min-h-[480px] max-md:p-6">
              <span className="absolute -top-2 -left-2 w-[14px] h-[14px] border-2 border-red bg-paper" aria-hidden />
              <span className="absolute -top-2 -right-2 w-[14px] h-[14px] border-2 border-red bg-paper" aria-hidden />
              <span className="absolute -bottom-2 -left-2 w-[14px] h-[14px] border-2 border-red bg-paper" aria-hidden />
              <span className="absolute -bottom-2 -right-2 w-[14px] h-[14px] border-2 border-red bg-paper" aria-hidden />
              <Globe
                className="w-full max-w-[460px] aspect-square"
                markers={markers}
                arcs={arcs}
                markerColor={[0.902, 0.098, 0.098]}
                arcColor={[0.902, 0.098, 0.098]}
                baseColor={[1, 1, 1]}
                glowColor={[0.94, 0.93, 0.91]}
                dark={0}
                mapBrightness={10}
                markerSize={0.025}
                arcWidth={0.8}
                arcHeight={0.35}
              />
            </div>
            <div className="grid grid-cols-3 border-2 border-t-0 border-ink">
              {[
                ["[ GRID ]", "12 NODES"],
                ["[ ARCS ]", "09 LINKS"],
                ["[ MODE ]", "SEIR / D"]
              ].map(([label, value], i) => (
                <div
                  key={label}
                  className={`p-[12px_14px] font-mono text-[10px] tracking-[0.1em] uppercase ${
                    i < 2 ? "border-r border-ink" : ""
                  }`}
                >
                  {label}
                  <strong className="block mt-1 font-display text-[18px] tracking-[-0.02em] text-red">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* BIG NUMBERS STRIP */}
      <div className="grid grid-cols-4 border-b-2 border-ink max-md:grid-cols-2 max-sm:grid-cols-1">
        {[
          { label: "R0 / TYPICAL", value: "2.4", red: false, sub: "baseline reproduction" },
          { label: "NODES / CITY", value: "16", red: true, sub: "heterogeneous zones" },
          { label: "HORIZON / DAYS", value: "120", red: false, sub: "full outbreak window" },
          { label: "RECOMPUTE", value: "<50ms", red: true, sub: "lever to timeline" }
        ].map((m, i) => (
          <div
            key={m.label}
            className={`p-9 px-7 ${i < 3 ? "border-r-2 border-ink max-md:[&:nth-child(2n)]:border-r-0 max-md:border-b-2 max-sm:border-r-0" : "max-md:border-b-0"} ${i < 2 ? "max-md:border-b-2" : ""}`}
          >
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-muted m-0 mb-3">
              {m.label}
            </p>
            <div
              className={`font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.9] tracking-[-0.04em] ${
                m.red ? "text-red" : "text-ink"
              }`}
            >
              {m.value}
            </div>
            <p className="mt-[10px] font-mono text-[11px] text-muted tracking-[0.04em] m-0">
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* WHAT IT DOES */}
      <div className={shell}>
        <section className="grid grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-16 py-24 border-b-2 border-ink max-lg:grid-cols-1 max-lg:gap-8 max-lg:py-16">
          <div>
            <p className={sectionLabel}>[ DELIVERY SYSTEMS ]</p>
            <h2 className={sectionTitle}>
              Six modules.<br />
              <span className="text-red">One console.</span>
            </h2>
            <p className="text-sm leading-[1.6] text-muted">
              Epipulse is not a toy. The compartmental model is implemented in
              pure TypeScript and audited against analytic SEIR solutions. AI is
              quarantined to scenario text and operator briefings — never the
              dynamics.
            </p>
          </div>

          <div className="grid grid-cols-2 border-2 border-ink max-lg:grid-cols-1">
            {features.map((f, i) => {
              const lastRow = i >= features.length - 2;
              const rightCol = i % 2 === 1;
              return (
                <article
                  key={f.n}
                  className={[
                    "p-7 min-h-[220px] flex flex-col gap-[14px]",
                    rightCol ? "" : "border-r-2 border-ink max-lg:border-r-0",
                    lastRow ? "" : "border-b-2 border-ink"
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-muted">
                    <span className="text-red font-bold">/ {f.n}</span>
                    <span className="w-7 h-7 grid place-items-center text-red">
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="font-display text-[22px] leading-[0.95] tracking-[-0.03em] uppercase m-0">
                    {f.title}
                  </h3>
                  <p className="m-0 font-mono text-xs leading-[1.55] text-ink-soft tracking-[0.01em]">
                    {f.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* FLOW */}
        <section className="py-24 border-b-2 border-ink">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] gap-6 items-end pb-8 border-b-2 border-ink">
            <div>
              <p className={sectionLabel}>[ OPERATIONAL FLOW ]</p>
              <h2 className={sectionTitle}>
                From prompt<br />
                to <span className="text-red">briefing.</span>
              </h2>
            </div>
            <Workflow size={56} strokeWidth={1.4} className="text-red" />
          </div>

          <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {steps.map((s, i) => (
              <article
                key={s.n}
                className={[
                  "p-8 pb-9 px-6 flex flex-col gap-3 relative",
                  i < steps.length - 1 ? "border-r-2 border-ink max-lg:[&:nth-child(2n)]:border-r-0 max-sm:border-r-0" : "",
                  "max-lg:[&:nth-child(-n+2)]:border-b-2 max-lg:[&:nth-child(-n+2)]:border-ink",
                  "max-sm:border-b-2 max-sm:border-ink max-sm:last:border-b-0"
                ].join(" ")}
              >
                <div className="font-display text-[64px] leading-[0.9] tracking-[-0.05em] text-red">
                  {s.n}
                </div>
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                  / {s.label}
                </div>
                <h3 className="font-display text-xl leading-[0.95] tracking-[-0.03em] uppercase">
                  {s.title}
                </h3>
                <p className="m-0 font-mono text-xs leading-[1.5] text-ink-soft">
                  {s.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* STACK */}
        <section className="py-24 border-b-2 border-ink">
          <p className={sectionLabel}>[ TECHNICAL DOSSIER ]</p>
          <h2 className={`${sectionTitle} mb-8`}>
            What runs <span className="text-red">under</span> the console.
          </h2>

          <table className="border-2 border-ink border-collapse w-full font-mono text-[13px]">
            <thead>
              <tr>
                {["LAYER", "UNIT", "FUNCTION"].map((h) => (
                  <th
                    key={h}
                    className="px-[18px] py-[14px] text-left border-b border-ink bg-ink text-[#fffefa] text-[10px] tracking-[0.14em] uppercase font-bold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Runtime", "Next.js 16 / React 19", "App Router. Server-only AI routes. Client-side simulation.", false],
                ["Math", "/lib/model", "Floating-point SEIR compartments. Mobility from population × distance.", true],
                ["State", "Zustand", "Shared simulation store. Reactive recompute on intervention change.", false],
                ["Charts", "Recharts", "Aggregate SEIR/D area chart. Per-node infectious & hospitalised lines.", false],
                ["Map", "Leaflet", "City-scale node placement. Marker colour reflects infectious load.", false],
                ["AI", "Anthropic Claude", "Scenario generation, narration, streaming advisor. Output is text only.", true],
                ["Tests", "Vitest", "Model invariants. Schema validation. Deterministic regression.", false]
              ].map(([layer, unit, fn, red], i, a) => (
                <tr key={String(layer)}>
                  <td
                    className={`px-[18px] py-[14px] text-left ${i < a.length - 1 ? "border-b border-ink" : ""} w-[22%] border-r border-ink bg-paper-soft font-bold uppercase text-[11px] tracking-[0.1em]`}
                  >
                    {layer}
                  </td>
                  <td
                    className={`px-[18px] py-[14px] text-left ${i < a.length - 1 ? "border-b border-ink" : ""} w-[28%] border-r border-ink ${red ? "text-red font-bold tracking-[0.06em] uppercase" : ""}`}
                  >
                    {unit}
                  </td>
                  <td
                    className={`px-[18px] py-[14px] text-left ${i < a.length - 1 ? "border-b border-ink" : ""}`}
                  >
                    {fn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* CTA */}
      <section className="py-[120px] pb-[140px] text-center border-b-2 border-ink relative overflow-hidden">
        <h2 className="font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.84] tracking-[-0.05em] uppercase m-0 mb-8">
          Run the <span className="text-red">outbreak.</span>
        </h2>
        <p className="font-mono text-[13px] tracking-[0.1em] uppercase text-muted m-0 mb-10">
          [ NO ACCOUNT / NO TELEMETRY / RUNS IN BROWSER ]
        </p>
        <div className="inline-flex border-2 border-ink">
          <Link href="/dashboard" className={btnPrimary}>
            <Radio size={14} strokeWidth={2.6} />
            Open Command Console
            <ArrowRight size={14} strokeWidth={2.6} />
          </Link>
          <Link href="/advisor" className={btnSecondary}>
            Advisor
          </Link>
        </div>
      </section>

      <div className={shell}>
        <footer className="py-7 pb-[42px] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-6 items-center font-mono text-[10px] tracking-[0.14em] uppercase text-muted max-sm:grid-cols-1 max-sm:text-center">
          <div>EPIPULSE ® / NETWORK SEIR / 2026</div>
          <div className="text-center font-display text-sm tracking-[-0.02em] text-ink">
            <span className="text-red">●</span> Status nominal
          </div>
          <div className="text-right max-sm:text-center">
            DETERMINISTIC / OPEN MODEL / NO PHI
          </div>
        </footer>
      </div>
    </div>
  );
}
