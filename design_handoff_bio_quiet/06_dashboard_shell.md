# 06 — `components/dashboard/dashboard-shell.tsx`

## Goal
Heaviest file in this migration. Same file path, same default export (`DashboardShell`). All internal sub-components (`ScenarioPanel`, `MetricsStrip`, `MetricCell`, `AggregateChart`, `PlaybackControls`, `InterventionControls`, `SliderControl`, `NodeDetailPanel`, `Stat`, `NarrationPanel`) keep their names — but their styling and small details change. Logic (the Zustand calls, the `fetch`/error handling, the `useEffect` for playback) stays exactly as is.

The visual ground truth for this file is the **Bio Quiet** prototype in `reference/dashboard-bio.jsx`. Match it.

---

## Top of file — utility class strings

Replace the existing `shellClass`, `topbarClass`, `brandClass`, … etc. with the strings below. The old names stay; the values change.

```ts
const shellClass = "w-full max-w-[1480px] mx-auto px-12 pb-16 bg-[--color-bg] max-[760px]:px-5";

const topbarClass = "flex min-h-[60px] items-center justify-between border-b border-[--color-hair] py-5 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-[14px]";

const brandClass = "inline-flex items-center gap-[10px] text-[17px] font-medium tracking-[-0.01em]";

const brandMarkClass = "grid h-7 w-7 place-items-center rounded-full bg-[--color-paper-deep] text-[--color-accent]";

const navClass = "inline-flex items-center gap-7 text-[13.5px] text-[--color-body]";
const navLinkClass = "text-[--color-body] hover:text-[--color-ink] transition-colors";
const navLinkActiveClass = "text-[--color-ink] font-medium";

const heroClass = "grid grid-cols-[minmax(0,1fr)_minmax(360px,440px)] items-end gap-10 border-b border-[--color-hair] py-12 max-[1100px]:grid-cols-1 max-[760px]:gap-6 max-[760px]:py-8";

const kickerClass = "m-0 mb-3 text-[12.5px] font-medium text-[--color-accent]";
const eyebrowClass = kickerClass; // alias kept for grep compatibility
const subheadClass = "mt-3 mb-0 text-[14px] text-[--color-muted]"; // sentence case, NO uppercase

const panelClass = "min-w-0 rounded-[12px] border border-[--color-hair] bg-[--color-paper] p-7";

const panelHeaderClass = "mb-5 flex items-baseline justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start";

const panelTitleClass = "m-0 text-[19px] font-medium tracking-[-0.015em] text-[--color-ink]"; // sentence case

const iconButtonClass = "inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[--color-hair] bg-[--color-paper] text-[--color-body] hover:bg-[--color-paper-soft] hover:text-[--color-ink] transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[--color-accent] px-4 text-[13px] font-medium text-white hover:bg-[--color-accent-deep] transition-colors disabled:cursor-not-allowed disabled:opacity-55";

const labelTextClass = "text-[12px] font-medium text-[--color-muted]"; // NO uppercase, NO tracking-[0.14em]

const controlClass = "w-full rounded-[8px] border border-[--color-hair] bg-[--color-bg] text-[13.5px] text-[--color-ink] focus:border-[--color-accent]";

const inlineErrorClass = "m-0 rounded-[6px] border border-[--color-alarm]/40 bg-[--color-alarm-soft] px-3 py-2 text-[12px] text-[--color-alarm]"; // no longer red-on-white with all-caps mono

const dayBadgeClass = "inline-flex h-7 items-center rounded-full border border-[--color-hair] bg-[--color-paper] px-3 text-[11.5px] font-medium text-[--color-body]"; // sentence case

const statusClass = "inline-flex h-7 items-center rounded-full px-3 text-[11.5px] font-medium"; // base; color set inline per state

const chartFrameClass = "h-[360px]"; // up from 326
```

## Top bar

Three slots: brand, nav, status cluster. Drop the "Home / **Dashboard** / Advisor" 3-button bordered nav — it's plain text links now.

```tsx
<header className={topbarClass}>
  <Link href="/" className={brandClass} aria-label="Epipulse home">
    <span className={brandMarkClass}>
      {/* small pulse glyph */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 7h3l1.5-3 2 6L9 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
    <span>Epipulse</span>
  </Link>
  <nav className={navClass}>
    <Link className={navLinkClass} href="/">Home</Link>
    <Link className={navLinkActiveClass} href="/dashboard">Dashboard</Link>
    <Link className={navLinkClass} href="/advisor">Advisor</Link>
  </nav>
  <div className="flex items-center gap-3 text-[12px] text-[--color-muted]">
    <span className="dot" />
    Model running
  </div>
</header>
```

## Hero

Two columns. Left: kicker (accent teal, sentence case, "Denver, Colorado · Day {N} of 120"), then H1 with the **scenario string** (`config.scenario`, sentence case), then a calm subhead with R₀ and node count.

```tsx
<section className={heroClass}>
  <div>
    <p className={kickerClass}>
      {config.city.name} · Day {current.day} of {timeline.length - 1}
    </p>
    <h1>{config.scenario}</h1>
    <p className={subheadClass}>
      R₀ {config.disease.r0.toFixed(1)} · {config.nodes.length} nodes · {config.disease.name}
    </p>
  </div>
  <ScenarioPanel />
</section>
```

## ScenarioPanel

Card with rounded corners (12px) and the new control styling. Drop the all-caps mono labels.

```tsx
<form className="grid gap-3 rounded-[12px] border border-[--color-hair] bg-[--color-paper] p-5" onSubmit={handleGenerate}>
  <div>
    <label className="text-[12px] font-medium text-[--color-muted] block mb-1.5" htmlFor="preset">Preset</label>
    <select className={`${controlClass} h-10 px-3`} id="preset" value={presetKey} onChange={…}>
      <option value="denver">Denver, Colorado</option>
      <option value="nyc">New York City</option>
      <option value="dmv">DC-Maryland-Virginia</option>
      <option value="island">Island resort</option>
    </select>
  </div>
  <div>
    <label className="text-[12px] font-medium text-[--color-muted] block mb-1.5" htmlFor="scenario-prompt">Prompt</label>
    <textarea className={`${controlClass} min-h-20 resize-y p-3 leading-[1.5]`} id="scenario-prompt" value={prompt} onChange={…} rows={3} />
  </div>
  {error ? <p className={inlineErrorClass}>{error}</p> : null}
  <button className={primaryButtonClass} type="submit" disabled={status === "loading"}>
    {status === "loading" ? "Generating…" : "Run scenario"}
    <span aria-hidden>→</span>
  </button>
</form>
```

- Preset values: sentence case ("Denver, Colorado") not "Denver" alone.
- Submit label: "Run scenario" / "Generating…" (em-dash + ellipsis). The original used `Sparkles` Lucide icon — drop.

## MetricsStrip + MetricCell

Replaces the `border-b-2 border-ink` 4-column grid with hairline-only and quieter typography. No red accent icons.

```tsx
<section className="grid grid-cols-4 border-b border-[--color-hair] max-[760px]:grid-cols-1">
  {/* 4× MetricCell */}
</section>
```

```tsx
function MetricCell({ label, value, detail, accent = false }) {
  return (
    <div className="relative min-w-0 border-r border-[--color-hair] px-7 py-7 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b">
      <p className="m-0 mb-3 text-[12.5px] text-[--color-muted]">{label}</p>
      <strong
        className="block text-[clamp(28px,3.4vw,40px)] font-normal leading-[1] tracking-[-0.025em] tabular-nums"
        style={{ color: accent ? "var(--color-alarm)" : "var(--color-ink)" }}
      >
        {value}
      </strong>
      <span className="mt-2 block text-[12.5px] text-[--color-body]">{detail}</span>
    </div>
  );
}
```

- Remove the `<div className="absolute right-[18px] top-[18px] grid h-[26px] w-[26px] place-items-center bg-red text-[#fffefa]">{icon}</div>` icon badge entirely. Numbers stand alone.
- Pass `accent` (alarm color) only on the **Hospital breach** cell when `firstNodeHospitalBreachDay !== null`. All other cells use `--color-ink`.
- Use the **Inter** font (`font-sans`) for the value, not Archivo Black. `tabular-nums` is essential since the value can be `293k`, `Day 28`, etc.
- Replace `formatCompact` calls' Archivo treatment with plain `.tabular-nums` styling.

## AggregateChart

See `09_recharts_theme.md` for the full chart constants module. Inside this component:

- Height `326 → 360`.
- Import `CHART`, `tickStyle`, `tooltipContentStyle`, `tooltipLabelStyle`, `tooltipItemStyle`, `COMPARTMENT_FILL`, `COMPARTMENT_FILL_OPACITY` from `@/lib/ui/charts`.
- Replace every hardcoded hex (`"#e61919"`, `"#0a0a0a"`, `"#8a8780"`, `"#4a4a45"`, `"#5a5a55"`, `"#d4d0c4"`) with the corresponding `CHART.*` reference.
- `<CartesianGrid stroke={CHART.hair} strokeDasharray="3 3" vertical={false} />` (was solid hairline).
- All `<Area>` fills use the `COMPARTMENT_FILL[key]` color and `fillOpacity={COMPARTMENT_FILL_OPACITY[key]}`. Only `infected` gets a visible stroke.
- `<Line dataKey="deaths" stroke={CHART.d} strokeWidth={1.4} dot={false} />` — solid, not dashed.
- `<Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} labelFormatter={(label) => `Day ${label}`} formatter={…} />` — the label formatter changes from `\`DAY ${label}\`` to `\`Day ${label}\``.
- Above the chart, add a quiet legend strip (the brutalist file relied on Recharts' default legend off entirely; we add a styled one):

```tsx
<div className="mb-4 flex flex-wrap gap-5 text-[12.5px] text-[--color-body]">
  {[
    ["Susceptible", CHART.s],
    ["Exposed", CHART.e],
    ["Infectious", CHART.i, true],
    ["Recovered", CHART.r],
    ["Deaths", CHART.d, false, true],
  ].map(([label, color, emphasized, line]) => (
    <span key={label} className="inline-flex items-center gap-2" style={{ color: emphasized ? CHART.i : undefined, fontWeight: emphasized ? 500 : 400 }}>
      {line
        ? <span className="inline-block h-0.5 w-3.5" style={{ background: color }} />
        : <span className="inline-block h-3 w-3 rounded-[3px]" style={{ background: color, opacity: 0.85 }} />}
      {label}
    </span>
  ))}
</div>
```

## PlaybackControls

```tsx
<div className="grid grid-cols-[40px_minmax(160px,260px)_84px] items-center gap-3 max-[760px]:w-full max-[760px]:grid-cols-[40px_1fr_84px]">
  <button className="grid h-10 w-10 place-items-center rounded-full bg-[--color-accent] text-white hover:bg-[--color-accent-deep] transition-colors" aria-label={isPlaying ? "Pause" : "Play"} onClick={…}>
    {isPlaying ? <Pause size={15} strokeWidth={2}/> : <Play size={15} strokeWidth={2}/>}
  </button>
  <input
    aria-label="Current day"
    className="w-full"
    style={{ accentColor: "var(--color-accent)" }}
    type="range" min={0} max={maxDay} value={currentDay}
    onChange={…}
  />
  <select className={`${controlClass} h-9 px-3 text-[12.5px]`} aria-label="Speed" value={speed} onChange={…}>
    {speedOptions.map(opt => <option key={opt} value={opt}>{opt}×</option>)}
  </select>
</div>
```

- Play button is now a teal round 40px button — no longer a square ink/red border button.
- Speed selector keeps a small select; remove the all-caps `1x` "1×" multiplication-sign style.
- The "DAY {N} / {MAX}" label moves above the slider as the chart's H2 already shows it — keep it visible in the panel header (`Day {current.day}`, sentence case).

## InterventionControls

- Panel uses `panelClass`. Title `Interventions` (sentence case).
- Reset button: small `iconButtonClass` with `RotateCcw` icon — fine.
- Three `<SliderControl>`s — see below.
- Node closure list: replaces the `border-l border-line-hair` cascade with cleaner button rows.

### Node toggle row (replace existing)

```tsx
<button
  key={node.id}
  type="button"
  className={
    closedNodeIds.has(node.id)
      ? "flex items-center justify-between rounded-[8px] border border-[--color-ink] bg-[--color-ink] px-3 py-2.5 text-left text-[13px] text-[--color-bg] transition-colors"
      : "flex items-center justify-between rounded-[8px] border border-[--color-hair] bg-transparent px-3 py-2.5 text-left text-[13px] text-[--color-body] transition-colors hover:bg-[--color-paper-soft]"
  }
  onClick={() => toggleNodeClosed(node.id)}
>
  <span className="flex items-center gap-2.5 min-w-0">
    <span className="text-[--color-muted]">{getNodeIcon(node.type, 14)}</span>
    <span className="truncate">{node.name}</span>
  </span>
  <span className="text-[11px] opacity-80 ml-3 shrink-0">
    {closedNodeIds.has(node.id) ? "closed" : "open"}
  </span>
</button>
```

- Wrap in `<div className="grid gap-1.5 pt-3 border-t border-[--color-hair] mt-3">` (was `border-t border-line-hair pt-2`).
- Closed state: dark ink fill, light text. **No `bg-red`.**
- Status text is sentence-case `closed` / `open` (was `CLOSED` / `OPEN` all caps).

## SliderControl

The biggest visual change: drop ALL-CAPS + mono label treatment, use Inter sentence-case label + accent-teal value, give the slider a teal handle.

```tsx
function SliderControl({ label, description, value, min, max, step, displayValue, onChange }) {
  return (
    <label className="mb-5 grid gap-2 border-b border-[--color-hair] pb-4 last-of-type:border-b-0">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13.5px] font-medium text-[--color-ink]">{label}</span>
        <strong className="text-[13.5px] font-medium tabular-nums text-[--color-accent]">{displayValue}</strong>
      </span>
      <span className="block text-[12px] leading-[1.5] text-[--color-muted] max-w-[36rem]">{description}</span>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={…}
        className="w-full"
        style={{ accentColor: "var(--color-accent)" }}
      />
    </label>
  );
}
```

- Drop the `icon` prop — no leading icon next to the label. (Less visual clutter.)
- Drop the `text-red` on the displayValue — it's `--color-accent` (teal) now.
- Labels: "Transmission rate" (was `Transmission`), "Isolation compliance" (was `Isolation`), "Travel restriction" (was `Travel`).

## NodeDetailPanel

```tsx
<section className={panelClass}>
  <div className={panelHeaderClass}>
    <div>
      <p className={kickerClass}>Selected node</p>
      <h2 className={panelTitleClass}>{selectedNode.name}</h2>
    </div>
    <span
      className="pill"
      style={isClosed
        ? { "--pill-bg": "var(--color-alarm-soft)", "--pill-fg": "var(--color-alarm)" }
        : { "--pill-bg": "var(--color-accent-soft)", "--pill-fg": "var(--color-accent)" }
      }
    >
      {isClosed ? "Closed" : "Open"}
    </span>
  </div>
  …
</section>
```

- The 3-cell `Stat` row drops `border-2 border-ink` and uses the new dl-row pattern (see below).
- The mini Line chart uses `CHART.i` for infected and `CHART.d` dashed `4 3` for hospitalized.
- Add a `<ReferenceLine y={selectedNode.hospitalCapacity} stroke={CHART.alarm} strokeDasharray="4 3" label={{ value: "capacity", fill: CHART.alarm, fontSize: 10, position: "right" }} />` if `hospitalCapacity > 0`.
- Below the chart: 3 dl cells in a `grid grid-cols-3 rounded-[10px] border border-[--color-hair] overflow-hidden`. Each cell `bg-[--color-paper] px-3 py-3`, `border-r border-[--color-hair] last:border-r-0`.
- `dt`: 11.5px `--color-muted`. `dd`: 14px tabular, `--color-ink`.

### Stat (the small stat tile component)

```tsx
function Stat({ label, value, detail }) {
  return (
    <div className="min-w-0 border-r border-[--color-hair] bg-[--color-paper] p-3 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b">
      <span className="text-[11.5px] text-[--color-muted]">{label}</span>
      <strong className="mt-1 block text-[20px] font-medium leading-[1] tabular-nums text-[--color-ink]">{formatCompact(value)}</strong>
      <small className="mt-1 block text-[11px] text-[--color-muted]">{detail}</small>
    </div>
  );
}
```

- `text-red` value → `--color-ink`. The peak/breach numbers don't need to be red by default — leave that for the actual breach state on the parent.

## NarrationPanel

```tsx
<section className={panelClass} style={{ background: "var(--color-accent-soft)", borderColor: "color-mix(in srgb, var(--color-accent) 25%, transparent)" }}>
  <div className={panelHeaderClass}>
    <div>
      <p className={kickerClass}>Today</p>
      <h2 className={panelTitleClass}>Today's note</h2>
    </div>
    <button className={iconButtonClass} type="button" aria-label="Regenerate note" disabled={status === "loading"} onClick={requestNarration}>
      <Sparkles size={15} strokeWidth={1.6} />
    </button>
  </div>
  <p className="m-0 text-[13.5px] leading-[1.6] text-[--color-body]">
    {report || `Day ${current.day}: ${formatNumber(current.aggregate.I)} infectious and ${formatNumber(current.aggregate.D)} cumulative deaths.`}
  </p>
</section>
```

- Drop the `border-l-4 border-red bg-paper-soft` left-border treatment — the entire card is now the accent-tinted note.
- Card background: `--color-accent-soft` (the pale teal). Border: subtle teal at 25% mix.
- Heading: "Today's note" (was "Explain this" / `INCIDENT NOTE`).

## Status of red usage (compliance check)

After this file is migrated, `text-red` / `bg-red` should appear **zero times** in `dashboard-shell.tsx`. The only places that get the alarm/clay color are:

- The `--color-alarm-soft` background on a closed-node pill in `NodeDetailPanel`.
- The "Hospital breach" metric cell in `MetricsStrip` (via the `accent={true}` prop).
- The `infected` Area + line in `AggregateChart` (via `CHART.i`, which is the same hex).
- A `ReferenceLine` for hospital capacity in the node-detail mini chart.

Everything else is `--color-ink`, `--color-body`, `--color-muted`, or `--color-accent` (teal).
