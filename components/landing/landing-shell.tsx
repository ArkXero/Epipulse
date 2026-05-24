"use client";

import Link from "next/link";
import { Globe } from "@/components/ui/cobe-globe";

const markers = [
  {
    id: "den",
    location: [39.7392, -104.9903] as [number, number],
    label: "Denver"
  },
  {
    id: "nyc",
    location: [40.7128, -74.006] as [number, number],
    label: "New York"
  },
  {
    id: "dmv",
    location: [38.9072, -77.0369] as [number, number],
    label: "DC-DMV"
  },
  { id: "lon", location: [51.5074, -0.1278] as [number, number] },
  {
    id: "tok",
    location: [35.6762, 139.6503] as [number, number],
    label: "Tokyo"
  },
  { id: "sgp", location: [1.3521, 103.8198] as [number, number] },
  {
    id: "syd",
    location: [-33.8688, 151.2093] as [number, number],
    label: "Sydney"
  },
  {
    id: "sao",
    location: [-23.5505, -46.6333] as [number, number],
    label: "São Paulo"
  },
  { id: "lag", location: [6.5244, 3.3792] as [number, number] },
  { id: "mum", location: [19.076, 72.8777] as [number, number] },
  { id: "ist", location: [41.0082, 28.9784] as [number, number] },
  { id: "joh", location: [-26.2041, 28.0473] as [number, number] }
];

const arcs = [
  {
    id: "den-nyc",
    from: [39.7392, -104.9903] as [number, number],
    to: [40.7128, -74.006] as [number, number],
    label: "DEN → NYC"
  },
  {
    id: "nyc-lon",
    from: [40.7128, -74.006] as [number, number],
    to: [51.5074, -0.1278] as [number, number],
    label: "NYC → LONDON"
  },
  {
    id: "lon-mum",
    from: [51.5074, -0.1278] as [number, number],
    to: [19.076, 72.8777] as [number, number]
  },
  {
    id: "mum-sgp",
    from: [19.076, 72.8777] as [number, number],
    to: [1.3521, 103.8198] as [number, number]
  },
  {
    id: "sgp-tok",
    from: [1.3521, 103.8198] as [number, number],
    to: [35.6762, 139.6503] as [number, number],
    label: "SINGAPORE → TOKYO"
  },
  {
    id: "tok-syd",
    from: [35.6762, 139.6503] as [number, number],
    to: [-33.8688, 151.2093] as [number, number],
    label: "TOKYO → SYDNEY"
  },
  {
    id: "sao-lag",
    from: [-23.5505, -46.6333] as [number, number],
    to: [6.5244, 3.3792] as [number, number]
  },
  {
    id: "lag-joh",
    from: [6.5244, 3.3792] as [number, number],
    to: [-26.2041, 28.0473] as [number, number]
  },
  {
    id: "ist-mum",
    from: [41.0082, 28.9784] as [number, number],
    to: [19.076, 72.8777] as [number, number]
  }
];

const modules = [
  {
    number: "01.",
    title: "Network SEIR.",
    copy: "Deterministic compartment model across heterogeneous city nodes. Audited against analytic solutions."
  },
  {
    number: "02.",
    title: "Mobility graph.",
    copy: "Movement between airports, transit hubs, schools, hospitals, downtown, and residential zones — weighted by population and distance."
  },
  {
    number: "03.",
    title: "Intervention levers.",
    copy: "Transmission scaling, isolation compliance, travel restriction, node closure. The timeline recomputes on every change."
  },
  {
    number: "04.",
    title: "Hospital breach.",
    copy: "Per-node capacity vs. hospitalized load. The first breach day is surfaced as a single, persistent alert."
  },
  {
    number: "05.",
    title: "Claude advisor.",
    copy: "A short briefing from Anthropic Claude grounded in the current simulation snapshot. Text only — the advisor never modifies the model."
  },
  {
    number: "06.",
    title: "Scenario generation.",
    copy: "Structured prompts produce city presets. Without an API key, the deterministic fallback preset still runs."
  }
];

const steps = [
  {
    number: "01",
    label: "Configure",
    title: "Pick a preset.",
    copy: "Choose a city baseline or generate one from a prompt."
  },
  {
    number: "02",
    label: "Simulate",
    title: "Run 120 days.",
    copy: "Per-node SEIR integration recomputes on every change."
  },
  {
    number: "03",
    label: "Intervene",
    title: "Move the levers.",
    copy: "Close nodes, raise isolation, restrict travel. Compare timelines."
  },
  {
    number: "04",
    label: "Brief",
    title: "Ask what to watch.",
    copy: "The advisor reads the current snapshot and returns text only."
  }
];

const stackRows = [
  [
    "Runtime",
    "Next.js 16, React 19",
    "App Router. Server-only AI routes. Client-side simulation."
  ],
  [
    "Model",
    "lib/model",
    "Floating-point SEIR compartments. Mobility from population × distance."
  ],
  [
    "State",
    "Zustand",
    "Shared simulation store. Reactive recompute on intervention change."
  ],
  [
    "Charts",
    "Recharts",
    "Aggregate SEIR-D area. Per-node infected and hospitalized lines."
  ],
  [
    "Map",
    "Leaflet",
    "City-scale node placement. Marker size and tint reflect infectious load."
  ],
  [
    "AI",
    "Anthropic Claude",
    "Scenario generation, narration, advisor. Output is text only."
  ],
  [
    "Tests",
    "Vitest",
    "Model invariants. Schema validation. Deterministic regression."
  ]
];

const shell = "w-full max-w-[1280px] mx-auto px-12 max-md:px-5";
const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-[--color-accent] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[--color-accent-deep]";
const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-[--color-rule] px-5 py-3 text-sm font-medium text-[--color-ink] transition-colors hover:bg-[--color-paper]";
const sectionEyebrow =
  "m-0 mb-3 font-mono text-[11px] tracking-[0.04em] text-[--color-muted]";
const sectionHeading =
  "m-0 text-[32px] font-medium leading-[1.15] tracking-[-0.015em] text-[--color-ink]";

export function LandingShell() {
  return (
    <div className="w-full bg-[--color-bg] text-[--color-ink]">
      <div className={shell}>
        <header className="flex min-h-16 items-center justify-between border-b border-[--color-hair] py-5 max-md:flex-col max-md:items-start max-md:gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-[10px] text-[17px] font-medium tracking-[-0.01em]"
            aria-label="Epipulse home"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[--color-paper-deep] text-[--color-accent]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 7h3l1.5-3 2 6L9 7h4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Epipulse
          </Link>

          <nav className="flex items-center gap-7 text-[13.5px] text-[--color-body]">
            <Link
              href="/"
              className="font-medium text-[--color-ink] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-[--color-ink]"
            >
              Dashboard
            </Link>
            <Link
              href="/advisor"
              className="transition-colors hover:text-[--color-ink]"
            >
              Advisor
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-[12px] text-[--color-muted]">
              <span className="dot" />
              Model running
            </span>
            <Link
              href="/dashboard"
              className="rounded-[8px] border border-[--color-hair] px-3 py-1.5 text-[12px] font-medium text-[--color-ink] transition-colors hover:bg-[--color-paper]"
            >
              Open dashboard
            </Link>
          </div>
        </header>
      </div>

      <main>
        <div className={shell}>
          <section className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-12 py-14 pb-16 max-[980px]:grid-cols-1">
            <div className="min-w-0">
              <p className="m-0 mb-5 text-[12.5px] font-medium text-[--color-accent]">
                Denver · New York · DC-MD-VA · island scenario
              </p>
              <h1 className="m-0 max-w-[780px] font-serif text-[clamp(36px,5vw,56px)] font-medium leading-[1.08] tracking-[-0.02em] text-[--color-ink]">
                A respiratory virus,{" "}
                <em className="font-serif italic">simulated</em>.
              </h1>
              <p className="mt-[18px] max-w-[560px] text-[16px] leading-[1.6] text-[--color-body]">
                Epipulse runs city-scale, deterministic SEIR outbreaks in your
                browser. Move interventions, watch hospital capacity, and ask
                an advisor what to do next.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/dashboard" className={primaryButton}>
                  Open the dashboard <span aria-hidden>→</span>
                </Link>
                <a href="#methods" className={secondaryButton}>
                  Read the methods
                </a>
              </div>
            </div>

            <div className="min-w-0">
              <div className="rounded-[12px] border border-[--color-hair] bg-[--color-paper] p-8">
                <Globe
                  className="mx-auto aspect-square w-full max-w-[460px]"
                  markers={markers}
                  arcs={arcs}
                  markerColor={[0.24, 0.48, 0.48]}
                  arcColor={[0.24, 0.48, 0.48]}
                  baseColor={[0.97, 0.95, 0.91]}
                  glowColor={[0.96, 0.94, 0.88]}
                  dark={0}
                  mapBrightness={8}
                  markerSize={0.022}
                  arcWidth={0.8}
                  arcHeight={0.35}
                />
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-b-[12px] border-x border-b border-[--color-hair] bg-[--color-paper]">
                {[
                  ["Grid", "12 nodes"],
                  ["Mobility arcs", "9"],
                  ["Mode", "SEIR-D"]
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={`px-4 py-3 ${
                      index < 2 ? "border-r border-[--color-hair]" : ""
                    }`}
                  >
                    <span className="block text-[11px] text-[--color-muted]">
                      {label}
                    </span>
                    <strong className="mt-1 block text-[15px] font-medium tabular-nums text-[--color-ink]">
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="grid grid-cols-4 border-y border-[--color-hair] max-md:grid-cols-2 max-sm:grid-cols-1">
          {[
            ["R₀ 2.4", "baseline reproduction"],
            ["16 nodes", "heterogeneous city zones"],
            ["120 days", "full outbreak window"],
            ["< 50 ms", "lever to timeline"]
          ].map(([value, label], index) => (
            <div
              key={value}
              className={`px-6 py-7 ${
                index < 3 ? "border-r border-[--color-hair]" : ""
              } max-md:border-b max-md:[&:nth-child(2n)]:border-r-0 max-md:[&:nth-last-child(-n+2)]:border-b-0 max-sm:border-r-0 max-sm:[&:nth-last-child(-n+2)]:border-b max-sm:last:border-b-0`}
            >
              <p className="m-0 mb-2 text-[12px] text-[--color-muted]">
                {label}
              </p>
              <div className="text-[32px] font-normal leading-[1] tracking-[-0.02em] tabular-nums text-[--color-ink]">
                {value}
              </div>
            </div>
          ))}
        </section>

        <div className={shell}>
          <section className="py-20">
            <div className="mb-8">
              <p className={sectionEyebrow}>What the model does</p>
              <h2 className={sectionHeading}>Six modules. One product.</h2>
            </div>
            <div className="grid grid-cols-3 gap-px bg-[--color-hair] max-lg:grid-cols-2 max-md:grid-cols-1">
              {modules.map((module) => (
                <article
                  key={module.number}
                  className="flex min-h-[200px] flex-col gap-3 bg-[--color-paper] p-7"
                >
                  <span className="font-mono text-[11px] text-[--color-accent]">
                    {module.number}
                  </span>
                  <h3 className="m-0 text-[18px] font-medium text-[--color-ink]">
                    {module.title}
                  </h3>
                  <p className="m-0 text-[13.5px] leading-[1.55] text-[--color-body]">
                    {module.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-[--color-hair] py-20">
            <div className="mb-8">
              <p className={sectionEyebrow}>How it works</p>
              <h2 className={sectionHeading}>From scenario to briefing.</h2>
            </div>
            <div className="grid grid-cols-4 overflow-hidden rounded-[12px] border border-[--color-hair] max-lg:grid-cols-2 max-sm:grid-cols-1">
              {steps.map((step, index) => (
                <article
                  key={step.number}
                  className={`p-7 ${
                    index < steps.length - 1
                      ? "border-r border-[--color-hair]"
                      : ""
                  } max-lg:border-b max-lg:[&:nth-child(2n)]:border-r-0 max-lg:[&:nth-last-child(-n+2)]:border-b-0 max-sm:border-r-0 max-sm:[&:nth-last-child(-n+2)]:border-b max-sm:last:border-b-0`}
                >
                  <span className="font-mono text-[13px] font-medium text-[--color-accent]">
                    {step.number}
                  </span>
                  <p className="m-0 mt-3 text-[11px] text-[--color-muted]">
                    {step.label}
                  </p>
                  <h3 className="m-0 mt-2 text-[17px] font-medium text-[--color-ink]">
                    {step.title}
                  </h3>
                  <p className="m-0 mt-2 text-[13.5px] leading-[1.55] text-[--color-body]">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section id="methods" className="border-t border-[--color-hair] py-20">
            <div className="mb-8">
              <p className={sectionEyebrow}>Under the hood</p>
              <h2 className={sectionHeading}>What runs the model.</h2>
            </div>
            <div className="overflow-hidden rounded-[12px] border border-[--color-hair]">
              <table className="w-full border-collapse text-[13.5px]">
                <thead>
                  <tr className="bg-[--color-paper-soft]">
                    {["Layer", "Library", "What it does"].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-left font-medium text-[--color-ink]"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stackRows.map(([layer, library, details], index) => (
                    <tr
                      key={layer}
                      className={
                        index % 2 === 0
                          ? "border-t border-[--color-hair] bg-[--color-paper]"
                          : "border-t border-[--color-hair] bg-transparent"
                      }
                    >
                      <td className="w-[22%] px-5 py-4 font-medium text-[--color-ink]">
                        {layer}
                      </td>
                      <td className="w-[28%] px-5 py-4 tabular-nums text-[--color-ink]">
                        {library}
                      </td>
                      <td className="px-5 py-4 text-[--color-body]">
                        {details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="border-t border-[--color-hair] py-24 text-center">
            <h2 className="m-0 font-serif text-[36px] font-medium tracking-[-0.02em] text-[--color-ink]">
              Run a scenario.
            </h2>
            <p className="m-0 mt-3 text-[13.5px] text-[--color-muted]">
              Runs in your browser. No account, no tracking.
            </p>
            <Link href="/dashboard" className={`${primaryButton} mt-8`}>
              Open the dashboard <span aria-hidden>→</span>
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t border-[--color-hair]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-5 px-12 py-7 text-[12px] text-[--color-muted] max-md:flex-col max-md:px-5">
          <p className="m-0">Epipulse · open-source SEIR simulation · 2026</p>
          <nav className="flex items-center gap-5 text-[12.5px] text-[--color-body]">
            <a href="#methods" className="hover:text-[--color-ink]">
              Methods
            </a>
            <a
              href="https://github.com"
              className="hover:text-[--color-ink]"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <Link href="/advisor" className="hover:text-[--color-ink]">
              Advisor
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
