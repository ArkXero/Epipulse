"use client";

import Link from "next/link";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Hospital,
  Pause,
  Plane,
  Play,
  RotateCcw,
  School,
  Sparkles,
  TrainFront
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { calculateMetrics, presets } from "@/lib/model";
import type {
  NodeType,
  PresetKey,
  ScenarioConfig,
  SimNode,
  SimulationMetrics
} from "@/lib/model";
import {
  formatCompact,
  formatMultiplier,
  formatNumber,
  formatPercent
} from "@/lib/format";
import {
  CHART,
  COMPARTMENT_FILL,
  COMPARTMENT_FILL_OPACITY,
  COMPARTMENT_ORDER,
  tickStyle,
  tooltipContentStyle,
  tooltipItemStyle,
  tooltipLabelStyle
} from "@/lib/ui/charts";
import { useSimStore } from "@/lib/store/sim-store";
import { MapPanel } from "./map-panel";

const speedOptions = [0.5, 1, 2, 4];

const presetPrompts: Record<PresetKey, string> = {
  denver: "A novel respiratory virus emerges in Denver in winter.",
  nyc: "A novel respiratory virus spreads through New York City transit corridors.",
  dmv: "A novel respiratory virus emerges across the DC, Maryland, and Virginia area.",
  island: "A respiratory outbreak reaches an island resort with limited hospital capacity."
};

const shellClass =
  "w-full max-w-[1480px] mx-auto px-12 pb-16 bg-[--color-bg] max-[760px]:px-5";
const topbarClass =
  "flex min-h-[60px] items-center justify-between border-b border-[--color-hair] py-5 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-[14px]";
const brandClass =
  "inline-flex items-center gap-[10px] text-[17px] font-medium tracking-[-0.01em]";
const brandMarkClass =
  "grid h-7 w-7 place-items-center rounded-full bg-[--color-paper-deep] text-[--color-accent]";
const navClass = "inline-flex items-center gap-7 text-[13.5px] text-[--color-body]";
const navLinkClass =
  "text-[--color-body] hover:text-[--color-ink] transition-colors";
const navLinkActiveClass = "text-[--color-ink] font-medium";
const heroClass =
  "grid grid-cols-[minmax(0,1fr)_minmax(360px,440px)] items-start gap-10 border-b border-[--color-hair] py-8 max-[1100px]:grid-cols-1 max-[760px]:gap-6 max-[760px]:py-6";
const kickerClass = "m-0 mb-3 text-[12.5px] font-medium text-[--color-accent]";
const eyebrowClass = kickerClass;
const subheadClass = "mt-3 mb-0 text-[14px] text-[--color-muted]";
const panelClass =
  "min-w-0 rounded-[12px] border border-[--color-hair] bg-[--color-paper] p-7";
const panelHeaderClass =
  "mb-5 flex items-baseline justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start";
const panelTitleClass =
  "m-0 text-[19px] font-medium tracking-[-0.015em] text-[--color-ink]";
const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[--color-hair] bg-[--color-paper] text-[--color-body] hover:bg-[--color-paper-soft] hover:text-[--color-ink] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55";
const labelTextClass = "text-[12px] font-medium text-[--color-muted]";
const controlClass =
  "w-full rounded-[8px] border border-[--color-hair] bg-[--color-bg] text-[13.5px] text-[--color-ink] focus:border-[--color-accent]";
const inlineErrorClass =
  "m-0 rounded-[6px] border border-[--color-alarm]/40 bg-[--color-alarm-soft] px-3 py-2 text-[12px] text-[--color-alarm]";
const dayBadgeClass =
  "inline-flex h-7 items-center rounded-full border border-[--color-hair] bg-[--color-paper] px-3 text-[11.5px] font-medium text-[--color-body]";
const chartFrameClass = "h-[360px]";

const accentButtonStyle = {
  background: "var(--color-accent)",
  color: "var(--color-bg)"
};

type PillStyle = CSSProperties & {
  "--pill-bg": string;
  "--pill-fg": string;
};

export function DashboardShell() {
  const {
    config,
    timeline,
    currentDay,
    isPlaying,
    speed,
    selectedNodeId,
    setCurrentDay,
    setIsPlaying,
    setSpeed,
    setSelectedNodeId
  } = useSimStore();
  const current = timeline[currentDay] ?? timeline[0];
  const metrics = useMemo(
    () => calculateMetrics(timeline, config.nodes),
    [timeline, config.nodes]
  );
  const selectedNode =
    config.nodes.find((node) => node.id === selectedNodeId) ?? config.nodes[0];

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      useSimStore.setState((state) => {
        const nextDay = Math.min(
          state.currentDay + 1,
          state.timeline.length - 1
        );

        return {
          currentDay: nextDay,
          isPlaying: nextDay < state.timeline.length - 1
        };
      });
    }, 900 / speed);

    return () => window.clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <main className={shellClass}>
      <header className={topbarClass}>
        <Link href="/" className={brandClass} aria-label="Epipulse home">
          <span className={brandMarkClass}>
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
          <span>Epipulse</span>
        </Link>
        <nav className={navClass}>
          <Link className={navLinkClass} href="/">
            Home
          </Link>
          <Link className={navLinkActiveClass} href="/dashboard">
            Dashboard
          </Link>
          <Link className={navLinkClass} href="/advisor">
            Advisor
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-[12px] text-[--color-muted]">
          <span className="dot" />
          Model running
        </div>
      </header>

      <section className={heroClass}>
        <div>
          <p className={kickerClass}>
            {config.city.name} · Day {current.day} of {timeline.length - 1}
          </p>
          <h1>{config.scenario}</h1>
          <p className={subheadClass}>
            R₀ {config.disease.r0.toFixed(1)} · {config.nodes.length} nodes ·{" "}
            {config.disease.name}
          </p>
        </div>
        <ScenarioPanel />
      </section>

      <MetricsStrip metrics={metrics} />

      <section className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-6 pt-6 max-[1100px]:grid-cols-1">
        <div className="grid gap-6">
          <section className={panelClass}>
            <div className={panelHeaderClass}>
              <div>
                <p className={eyebrowClass}>Aggregate trajectory</p>
                <h2 className={panelTitleClass}>Day {current.day}</h2>
              </div>
              <PlaybackControls
                currentDay={currentDay}
                isPlaying={isPlaying}
                maxDay={timeline.length - 1}
                speed={speed}
                onCurrentDayChange={setCurrentDay}
                onPlayingChange={setIsPlaying}
                onSpeedChange={setSpeed}
              />
            </div>
            <AggregateChart />
          </section>

          <section className={panelClass}>
            <div className={panelHeaderClass}>
              <div>
                <p className={eyebrowClass}>Geographic spread</p>
                <h2 className={panelTitleClass}>{config.city.name}</h2>
              </div>
              <div className={dayBadgeClass}>Day {current.day}</div>
            </div>
            <MapPanel
              city={config.city}
              nodes={config.nodes}
              day={current}
              selectedNodeId={selectedNode.id}
              onSelectNode={setSelectedNodeId}
            />
          </section>
        </div>

        <aside className="grid gap-6">
          <InterventionControls />
          <NodeDetailPanel selectedNode={selectedNode} />
          <NarrationPanel metrics={metrics} />
        </aside>
      </section>
    </main>
  );
}

function ScenarioPanel() {
  const setPreset = useSimStore((state) => state.setPreset);
  const setScenario = useSimStore((state) => state.setScenario);
  const [presetKey, setPresetKey] = useState<PresetKey>("denver");
  const [prompt, setPrompt] = useState(presetPrompts.denver);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, fallbackPresetKey: presetKey })
      });

      if (!response.ok) {
        throw new Error("Scenario generation failed");
      }

      const scenario = (await response.json()) as ScenarioConfig;
      setScenario(scenario);
    } catch {
      setScenario(presets[presetKey]);
      setError("Using the selected preset while AI generation is unavailable.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form
      className="grid gap-2.5 rounded-[12px] border border-[--color-hair] bg-[--color-paper] p-4"
      onSubmit={handleGenerate}
    >
      <div>
        <label className={`${labelTextClass} mb-1.5 block`} htmlFor="preset">
          Preset
        </label>
        <select
          className={`${controlClass} h-9 px-3`}
          id="preset"
          value={presetKey}
          onChange={(event) => {
            const nextPreset = event.target.value as PresetKey;
            setPresetKey(nextPreset);
            setPreset(nextPreset);
            setPrompt(presetPrompts[nextPreset]);
            setError(null);
          }}
        >
          <option value="denver">Denver, Colorado</option>
          <option value="nyc">New York City</option>
          <option value="dmv">DC-Maryland-Virginia</option>
          <option value="island">Island resort</option>
        </select>
      </div>
      <div>
        <label
          className={`${labelTextClass} mb-1.5 block`}
          htmlFor="scenario-prompt"
        >
          Prompt
        </label>
        <textarea
          className={`${controlClass} min-h-16 resize-y p-3 leading-[1.5]`}
          id="scenario-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
        />
      </div>
      {error ? <p className={inlineErrorClass}>{error}</p> : null}
      <button
        className={primaryButtonClass}
        style={accentButtonStyle}
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Generating…" : "Run scenario"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

function MetricsStrip({ metrics }: { metrics: SimulationMetrics }) {
  const hasBreach = metrics.firstNodeHospitalBreachDay !== null;
  const breachLabel = hasBreach
    ? `Day ${metrics.firstNodeHospitalBreachDay}`
    : "No breach";

  return (
    <section className="grid grid-cols-4 border-b border-[--color-hair] max-[760px]:grid-cols-1">
      <MetricCell
        label="Peak infected"
        value={formatCompact(metrics.peakInfected)}
        detail={`Day ${metrics.peakInfectedDay}`}
      />
      <MetricCell
        label="Total deaths"
        value={formatCompact(metrics.totalDeaths)}
        detail="End of horizon"
      />
      <MetricCell
        label="Hospital breach"
        value={breachLabel}
        detail={
          metrics.firstHospitalBreachNodeId
            ? metrics.firstHospitalBreachNodeId.replaceAll("-", " ")
            : "Capacity stays under load"
        }
        accent={hasBreach}
      />
      <MetricCell
        label="Population"
        value={formatCompact(metrics.totalPopulation)}
        detail={`${formatCompact(metrics.finalRecovered)} recovered`}
      />
    </section>
  );
}

function MetricCell({
  label,
  value,
  detail,
  accent = false
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className="relative min-w-0 border-r border-[--color-hair] px-7 py-7 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b">
      <p className="m-0 mb-3 text-[12.5px] text-[--color-muted]">{label}</p>
      <strong
        className="block text-[clamp(28px,3.4vw,40px)] font-normal leading-[1] tracking-[-0.025em] tabular-nums"
        style={{ color: accent ? "var(--color-alarm)" : "var(--color-ink)" }}
      >
        {value}
      </strong>
      <span className="mt-2 block text-[12.5px] text-[--color-body]">
        {detail}
      </span>
    </div>
  );
}

function AggregateChart() {
  const timeline = useSimStore((state) => state.timeline);
  const data = useMemo(
    () =>
      timeline.map((day) => ({
        day: day.day,
        susceptible: Math.round(day.aggregate.S),
        exposed: Math.round(day.aggregate.E),
        infected: Math.round(day.aggregate.I),
        recovered: Math.round(day.aggregate.R),
        deaths: Math.round(day.aggregate.D)
      })),
    [timeline]
  );
  const legendItems = [
    { label: "Susceptible", color: CHART.s },
    { label: "Exposed", color: CHART.e },
    { label: "Infectious", color: CHART.i, emphasized: true },
    { label: "Recovered", color: CHART.r },
    { label: "Deaths", color: CHART.d, line: true }
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-5 text-[12.5px] text-[--color-body]">
        {legendItems.map(({ label, color, emphasized, line }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2"
            style={{
              color: emphasized ? CHART.i : undefined,
              fontWeight: emphasized ? 500 : 400
            }}
          >
            {line ? (
              <span
                className="inline-block h-0.5 w-3.5"
                style={{ background: color }}
              />
            ) : (
              <span
                className="inline-block h-3 w-3 rounded-[3px]"
                style={{ background: color, opacity: 0.85 }}
              />
            )}
            {label}
          </span>
        ))}
      </div>
      <div className={chartFrameClass}>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart
            data={data}
            margin={{ top: 18, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke={CHART.hair}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: CHART.hair }}
              tick={tickStyle}
            />
            <YAxis
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={{ stroke: CHART.hair }}
              width={56}
              tick={tickStyle}
            />
            <Tooltip
              formatter={(value, name) => [
                formatNumber(Number(value ?? 0)),
                String(name)
              ]}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
            />
            {COMPARTMENT_ORDER.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId={key}
                stroke={key === "infected" ? COMPARTMENT_FILL[key] : "none"}
                strokeWidth={key === "infected" ? 1.2 : 0}
                fill={COMPARTMENT_FILL[key]}
                fillOpacity={COMPARTMENT_FILL_OPACITY[key]}
              />
            ))}
            <Line
              type="monotone"
              dataKey="deaths"
              stroke={CHART.d}
              strokeWidth={1.4}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PlaybackControls({
  currentDay,
  isPlaying,
  maxDay,
  speed,
  onCurrentDayChange,
  onPlayingChange,
  onSpeedChange
}: {
  currentDay: number;
  isPlaying: boolean;
  maxDay: number;
  speed: number;
  onCurrentDayChange: (day: number) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  onSpeedChange: (speed: number) => void;
}) {
  return (
    <div className="grid grid-cols-[40px_minmax(160px,260px)_84px] items-center gap-3 max-[760px]:w-full max-[760px]:grid-cols-[40px_1fr_84px]">
      <button
        className="grid h-10 w-10 place-items-center rounded-full transition-colors"
        style={accentButtonStyle}
        type="button"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={() => onPlayingChange(!isPlaying)}
      >
        {isPlaying ? (
          <Pause size={15} strokeWidth={2} />
        ) : (
          <Play size={15} strokeWidth={2} />
        )}
      </button>
      <input
        aria-label="Current day"
        className="w-full"
        style={{ accentColor: "var(--color-accent)" }}
        type="range"
        min={0}
        max={maxDay}
        value={currentDay}
        onChange={(event) => onCurrentDayChange(Number(event.target.value))}
      />
      <select
        className={`${controlClass} h-9 px-3 text-[12.5px]`}
        aria-label="Speed"
        value={speed}
        onChange={(event) => onSpeedChange(Number(event.target.value))}
      >
        {speedOptions.map((option) => (
          <option key={option} value={option}>
            {option}×
          </option>
        ))}
      </select>
    </div>
  );
}

function InterventionControls() {
  const { config, setInterventions, toggleNodeClosed, resetInterventions } =
    useSimStore();
  const interventions = config.interventions;
  const closedNodeIds = new Set(interventions.closedNodeIds);

  return (
    <section className={panelClass}>
      <div className={panelHeaderClass}>
        <div>
          <p className={eyebrowClass}>Levers</p>
          <h2 className={panelTitleClass}>Interventions</h2>
        </div>
        <button
          className={iconButtonClass}
          type="button"
          aria-label="Reset interventions"
          onClick={resetInterventions}
        >
          <RotateCcw size={16} strokeWidth={2} />
        </button>
      </div>

      <SliderControl
        label="Transmission rate"
        description="1.00x is the disease baseline. Lower values reduce new exposures; higher values accelerate infections and deaths."
        value={interventions.transmissionRate}
        min={0.15}
        max={1.8}
        step={0.05}
        displayValue={formatMultiplier(interventions.transmissionRate)}
        onChange={(value) => setInterventions({ transmissionRate: value })}
      />
      <SliderControl
        label="Isolation compliance"
        description="Percent of infectious people effectively isolated. Higher values reduce infectious travel and contacts."
        value={interventions.isolationCompliance}
        min={0}
        max={0.95}
        step={0.05}
        displayValue={formatPercent(interventions.isolationCompliance)}
        onChange={(value) => setInterventions({ isolationCompliance: value })}
      />
      <SliderControl
        label="Travel restriction"
        description="Percent reduction in movement between nodes and airport importation. Higher values usually lower spread across the region."
        value={interventions.travelRestriction}
        min={0}
        max={1}
        step={0.05}
        displayValue={formatPercent(interventions.travelRestriction)}
        onChange={(value) => setInterventions({ travelRestriction: value })}
      />

      <div className="mt-3 grid gap-1.5 border-t border-[--color-hair] pt-3">
        {config.nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={
              closedNodeIds.has(node.id)
                ? "flex items-center justify-between rounded-[8px] border px-3 py-2.5 text-left text-[13px] transition-colors"
                : "flex items-center justify-between rounded-[8px] border border-[--color-hair] bg-transparent px-3 py-2.5 text-left text-[13px] text-[--color-body] transition-colors hover:bg-[--color-paper-soft]"
            }
            style={
              closedNodeIds.has(node.id)
                ? {
                    background: "var(--color-ink)",
                    borderColor: "var(--color-ink)",
                    color: "var(--color-bg)"
                  }
                : undefined
            }
            onClick={() => toggleNodeClosed(node.id)}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span className="text-[--color-muted]">
                {getNodeIcon(node.type, 14)}
              </span>
              <span className="truncate">{node.name}</span>
            </span>
            <span className="ml-3 shrink-0 text-[11px] opacity-80">
              {closedNodeIds.has(node.id) ? "closed" : "open"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function SliderControl({
  label,
  description,
  value,
  min,
  max,
  step,
  displayValue,
  onChange
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-5 grid gap-2 border-b border-[--color-hair] pb-4 last-of-type:border-b-0">
      <span className="flex items-center justify-between gap-3">
        <span className="text-[13.5px] font-medium text-[--color-ink]">
          {label}
        </span>
        <strong className="text-[13.5px] font-medium tabular-nums text-[--color-accent]">
          {displayValue}
        </strong>
      </span>
      <span className="block max-w-[36rem] text-[12px] leading-[1.5] text-[--color-muted]">
        {description}
      </span>
      <input
        className="w-full"
        style={{ accentColor: "var(--color-accent)" }}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function NodeDetailPanel({ selectedNode }: { selectedNode: SimNode }) {
  const timeline = useSimStore((state) => state.timeline);
  const currentDay = useSimStore((state) => state.currentDay);
  const config = useSimStore((state) => state.config);
  const data = useMemo(
    () =>
      timeline.map((day) => {
        const node = day.nodes.find((entry) => entry.nodeId === selectedNode.id);

        return {
          day: day.day,
          infected: Math.round(node?.I ?? 0),
          hospitalized: Math.round(node?.hospitalized ?? 0),
          deaths: Math.round(node?.D ?? 0)
        };
      }),
    [timeline, selectedNode.id]
  );
  const nodeSummary = useMemo(() => {
    return data.reduce(
      (summary, day) => ({
        peakInfected:
          day.infected > summary.peakInfected.value
            ? { value: day.infected, day: day.day }
            : summary.peakInfected,
        peakHospitalized:
          day.hospitalized > summary.peakHospitalized.value
            ? { value: day.hospitalized, day: day.day }
            : summary.peakHospitalized,
        finalDeaths: day.deaths
      }),
      {
        peakInfected: { value: 0, day: 0 },
        peakHospitalized: { value: 0, day: 0 },
        finalDeaths: 0
      }
    );
  }, [data]);
  const isClosed = config.interventions.closedNodeIds.includes(selectedNode.id);
  const pillStyle: PillStyle = isClosed
    ? {
        "--pill-bg": "var(--color-alarm-soft)",
        "--pill-fg": "var(--color-alarm)"
      }
    : {
        "--pill-bg": "var(--color-accent-soft)",
        "--pill-fg": "var(--color-accent)"
      };

  return (
    <section className={panelClass}>
      <div className={panelHeaderClass}>
        <div>
          <p className={eyebrowClass}>Selected node</p>
          <h2 className={panelTitleClass}>{selectedNode.name}</h2>
        </div>
        <span className="pill" style={pillStyle}>
          {isClosed ? "Closed" : "Open"}
        </span>
      </div>

      <div className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-[--color-hair] max-[760px]:grid-cols-1">
        <Stat
          label="Peak infected"
          value={nodeSummary.peakInfected.value}
          detail={`Day ${nodeSummary.peakInfected.day}`}
        />
        <Stat
          label="Peak hospitalized"
          value={nodeSummary.peakHospitalized.value}
          detail={`Day ${nodeSummary.peakHospitalized.day}`}
        />
        <Stat
          label="Total deaths"
          value={nodeSummary.finalDeaths}
          detail={`Day ${timeline.at(-1)?.day ?? 0}`}
        />
      </div>

      <div className="mt-[18px]">
        <ResponsiveContainer width="100%" height={150}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
          >
            <CartesianGrid
              stroke={CHART.hair}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: CHART.hair }}
              tick={tickStyle}
            />
            <YAxis
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={{ stroke: CHART.hair }}
              tick={tickStyle}
            />
            <Tooltip
              formatter={(value, name) => [
                formatNumber(Number(value ?? 0)),
                String(name)
              ]}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
            />
            {selectedNode.hospitalCapacity > 0 ? (
              <ReferenceLine
                y={selectedNode.hospitalCapacity}
                stroke={CHART.alarm}
                strokeDasharray="4 3"
                label={{
                  value: "capacity",
                  fill: CHART.alarm,
                  fontSize: 10,
                  position: "right"
                }}
              />
            ) : null}
            <ReferenceLine x={currentDay} stroke={CHART.accent} strokeWidth={0.8} />
            <Line
              type="monotone"
              dataKey="infected"
              stroke={CHART.i}
              strokeWidth={1.6}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="hospitalized"
              stroke={CHART.d}
              strokeWidth={1.2}
              dot={false}
              strokeDasharray="4 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-3 grid grid-cols-3 overflow-hidden rounded-[10px] border border-[--color-hair] max-[760px]:grid-cols-1">
        <div className="min-w-0 border-r border-[--color-hair] bg-[--color-paper] px-3 py-3 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
          <dt className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-[--color-muted]">
            Population
          </dt>
          <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] tabular-nums text-[--color-ink]">
            {formatNumber(selectedNode.population)}
          </dd>
        </div>
        <div className="min-w-0 border-r border-[--color-hair] bg-[--color-paper] px-3 py-3 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
          <dt className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-[--color-muted]">
            Capacity
          </dt>
          <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] tabular-nums text-[--color-ink]">
            {formatNumber(selectedNode.hospitalCapacity)}
          </dd>
        </div>
        <div className="min-w-0 border-r border-[--color-hair] bg-[--color-paper] px-3 py-3 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
          <dt className="overflow-hidden text-ellipsis whitespace-nowrap text-[11.5px] text-[--color-muted]">
            Type
          </dt>
          <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] tabular-nums text-[--color-ink]">
            {selectedNode.type}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Stat({
  label,
  value,
  detail
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="min-w-0 border-r border-[--color-hair] bg-[--color-paper] p-3 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
      <span className="text-[11.5px] text-[--color-muted]">{label}</span>
      <strong className="mt-1 block text-[20px] font-medium leading-[1] tabular-nums text-[--color-ink]">
        {formatCompact(value)}
      </strong>
      <small className="mt-1 block text-[11px] text-[--color-muted]">
        {detail}
      </small>
    </div>
  );
}

function NarrationPanel({ metrics }: { metrics: SimulationMetrics }) {
  const { config, timeline, currentDay } = useSimStore();
  const [report, setReport] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const current = timeline[currentDay] ?? timeline[0];
  const previous = currentDay > 0 ? timeline[currentDay - 1] : undefined;

  async function requestNarration() {
    setStatus("loading");

    try {
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          day: current,
          previousDay: previous,
          metrics
        })
      });

      if (!response.ok) {
        throw new Error("Narration request failed");
      }

      const result = (await response.json()) as { report: string };
      setReport(result.report);
    } catch {
      setReport(
        `Day ${current.day}: ${formatNumber(
          current.aggregate.I
        )} people are infectious, with ${formatNumber(
          current.aggregate.hospitalized
        )} estimated hospitalizations. Peak load is projected for day ${
          metrics.peakInfectedDay
        }.`
      );
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section
      className={panelClass}
      style={{
        background: "var(--color-accent-soft)",
        borderColor: "color-mix(in srgb, var(--color-accent) 25%, transparent)"
      }}
    >
      <div className={panelHeaderClass}>
        <div>
          <p className={eyebrowClass}>Today</p>
          <h2 className={panelTitleClass}>Today&apos;s note</h2>
        </div>
        <button
          className={iconButtonClass}
          type="button"
          aria-label="Regenerate note"
          disabled={status === "loading"}
          onClick={requestNarration}
        >
          <Sparkles size={15} strokeWidth={1.6} />
        </button>
      </div>
      <p className="m-0 text-[13.5px] leading-[1.6] text-[--color-body]">
        {report ||
          `Day ${current.day}: ${formatNumber(
            current.aggregate.I
          )} infectious and ${formatNumber(
            current.aggregate.D
          )} cumulative deaths.`}
      </p>
    </section>
  );
}

function getNodeIcon(type: NodeType, size = 18) {
  switch (type) {
    case "airport":
      return <Plane size={size} strokeWidth={2} />;
    case "hospital":
      return <Hospital size={size} strokeWidth={2} />;
    case "school":
      return <School size={size} strokeWidth={2} />;
    case "transit":
      return <TrainFront size={size} strokeWidth={2} />;
    case "downtown":
      return <Building2 size={size} strokeWidth={2} />;
    case "residential":
      return <Building2 size={size} strokeWidth={2} />;
  }
}
