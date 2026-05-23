"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  Gauge,
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { calculateMetrics, presets } from "@/lib/model";
import type {
  NodeState,
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
import { useSimStore } from "@/lib/store/sim-store";
import { MapPanel } from "./map-panel";

const speedOptions = [0.5, 1, 2, 4];

const presetPrompts: Record<PresetKey, string> = {
  denver: "A novel respiratory virus emerges in Denver in winter.",
  nyc: "A novel respiratory virus spreads through New York City transit corridors.",
  dmv: "A novel respiratory virus emerges across the DC, Maryland, and Virginia area.",
  island: "A respiratory outbreak reaches an island resort with limited hospital capacity."
};

const shellClass = "w-full max-w-[1480px] mx-auto px-6 pb-16 bg-paper max-[760px]:px-4";
const topbarClass = "flex min-h-[60px] items-center justify-between border-b-2 border-ink py-4 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-[14px]";
const brandClass = "inline-flex items-center gap-[10px] font-display text-lg tracking-[-0.02em] uppercase";
const brandMarkClass = "grid h-8 w-8 place-items-center bg-ink text-[#fffefa]";
const navClass = "inline-flex items-center border-2 border-ink";
const navLinkClass = "inline-flex min-h-9 items-center border-r-2 border-ink px-4 font-mono text-[11px] font-bold tracking-[0.12em] text-ink uppercase transition-colors duration-100 last:border-r-0 hover:bg-ink hover:text-[#fffefa]";
const navLinkActiveClass = "inline-flex min-h-9 items-center border-r-2 border-ink bg-red px-4 font-mono text-[11px] font-bold tracking-[0.12em] text-[#fffefa] uppercase last:border-r-0";
const heroClass = "grid grid-cols-[minmax(0,1fr)_minmax(360px,480px)] items-end gap-10 border-b-2 border-ink py-12 pb-8 max-[1100px]:grid-cols-1 max-[760px]:gap-[22px] max-[760px]:py-[30px] max-[760px]:pb-[22px]";
const kickerClass = "m-0 mb-4 font-mono text-[11px] font-bold tracking-[0.14em] text-red uppercase";
const eyebrowClass = kickerClass;
const subheadClass = "mt-[18px] mb-0 font-mono text-xs tracking-[0.06em] text-muted uppercase";
const panelClass = "min-w-0 border-2 border-ink bg-panel p-5";
const panelHeaderClass = "mb-[18px] flex items-start justify-between gap-4 border-b border-ink pb-3 max-[760px]:flex-col";
const panelTitleClass = "m-0 font-display text-lg leading-none tracking-[-0.02em] uppercase";
const iconButtonClass = "inline-flex h-[38px] w-[38px] items-center justify-center border-2 border-ink bg-paper font-mono font-bold tracking-[0.1em] text-ink uppercase transition-colors duration-100 hover:bg-ink hover:text-[#fffefa] disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass = "inline-flex min-h-[42px] items-center justify-center gap-2 border-2 border-ink bg-ink px-4 font-mono text-xs font-bold tracking-[0.1em] text-[#fffefa] uppercase transition-colors duration-100 hover:border-red hover:bg-red disabled:cursor-not-allowed disabled:opacity-50";
const labelTextClass = "font-mono text-[10px] font-bold tracking-[0.14em] text-ink uppercase";
const controlClass = "w-full border-2 border-ink bg-paper font-mono text-xs text-ink";
const inlineErrorClass = "m-0 bg-red px-[10px] py-2 font-mono text-[11px] tracking-[0.08em] text-[#fffefa] uppercase";
const dayBadgeClass = "inline-flex h-7 items-center border-2 border-ink bg-paper-soft px-3 font-mono text-[10px] font-bold tracking-[0.14em] text-ink uppercase";
const statusClass = "inline-flex h-7 items-center border-2 border-ink px-3 font-mono text-[10px] font-bold tracking-[0.14em] text-[#fffefa] uppercase";
const chartFrameClass = "h-[326px]";

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
            <Activity size={18} strokeWidth={2.4} />
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
      </header>

      <section className={heroClass}>
        <div>
          <p className={kickerClass}>Network SEIR command view</p>
          <h1>{config.scenario}</h1>
          <p className={subheadClass}>
            {config.city.name} · {config.disease.name} · R0{" "}
            {config.disease.r0.toFixed(1)}
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
    <form className="grid gap-3 border-2 border-ink bg-panel p-[18px]" onSubmit={handleGenerate}>
      <div className="grid gap-1.5">
        <label className={labelTextClass} htmlFor="preset">Preset</label>
        <select
          className={`${controlClass} h-[38px] px-[10px]`}
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
          <option value="denver">Denver</option>
          <option value="nyc">New York City</option>
          <option value="dmv">DC-Maryland-Virginia</option>
          <option value="island">Island</option>
        </select>
      </div>
      <div className="grid gap-1.5">
        <label className={labelTextClass} htmlFor="scenario-prompt">Scenario prompt</label>
        <textarea
          className={`${controlClass} min-h-20 resize-y p-[10px] leading-[1.45]`}
          id="scenario-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
        />
      </div>
      {error ? <p className={inlineErrorClass}>{error}</p> : null}
      <button
        className={primaryButtonClass}
        type="submit"
        disabled={status === "loading"}
      >
        <Sparkles size={16} strokeWidth={2} />
        {status === "loading" ? "Generating" : "Generate"}
      </button>
    </form>
  );
}

function MetricsStrip({ metrics }: { metrics: SimulationMetrics }) {
  const breachLabel =
    metrics.firstNodeHospitalBreachDay === null
      ? "No breach"
      : `Day ${metrics.firstNodeHospitalBreachDay}`;

  return (
    <section className="grid grid-cols-4 border-b-2 border-ink max-[760px]:grid-cols-1">
      <MetricCell
        label="Peak infected"
        value={formatCompact(metrics.peakInfected)}
        detail={`Day ${metrics.peakInfectedDay}`}
        icon={<Activity size={18} strokeWidth={2} />}
      />
      <MetricCell
        label="Total deaths"
        value={formatCompact(metrics.totalDeaths)}
        detail="End of horizon"
        icon={<AlertTriangle size={18} strokeWidth={2} />}
      />
      <MetricCell
        label="Hospital breach"
        value={breachLabel}
        detail={
          metrics.firstHospitalBreachNodeId
            ? metrics.firstHospitalBreachNodeId.replaceAll("-", " ")
            : "Capacity stays under load"
        }
        icon={<Hospital size={18} strokeWidth={2} />}
      />
      <MetricCell
        label="Population"
        value={formatCompact(metrics.totalPopulation)}
        detail={`${formatCompact(metrics.finalRecovered)} recovered`}
        icon={<Building2 size={18} strokeWidth={2} />}
      />
    </section>
  );
}

function MetricCell({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative min-w-0 border-r-2 border-ink px-[22px] py-[22px] pb-6 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b-2 max-[760px]:last:border-b-0">
      <div className="absolute right-[18px] top-[18px] grid h-[26px] w-[26px] place-items-center bg-red text-[#fffefa]">{icon}</div>
      <p className="m-0 mb-3 font-mono text-[10px] font-bold tracking-[0.14em] text-muted uppercase">{label}</p>
      <strong className="block font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[0.9] tracking-[-0.04em] text-ink">{value}</strong>
      <span className="mt-2 block font-mono text-[11px] tracking-[0.06em] text-muted uppercase">{detail}</span>
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

  return (
    <div className={chartFrameClass}>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 18, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#d4d0c4" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={{ stroke: "#0a0a0a" }}
            tick={{ fill: "#0a0a0a", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
          />
          <YAxis
            tickFormatter={formatCompact}
            tickLine={false}
            axisLine={{ stroke: "#0a0a0a" }}
            width={56}
            tick={{ fill: "#0a0a0a", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
          />
          <Tooltip
            formatter={(value, name) => [
              formatNumber(Number(value ?? 0)),
              String(name)
            ]}
            labelFormatter={(label) => `DAY ${label}`}
            contentStyle={{
              background: "#f4f4f0",
              border: "2px solid #0a0a0a",
              borderRadius: 0,
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.06em"
            }}
          />
          <Area
            type="monotone"
            dataKey="susceptible"
            stackId="1"
            stroke="#8a8780"
            fill="#8a8780"
            fillOpacity={0.18}
          />
          <Area
            type="monotone"
            dataKey="exposed"
            stackId="2"
            stroke="#4a4a45"
            fill="#4a4a45"
            fillOpacity={0.22}
          />
          <Area
            type="monotone"
            dataKey="infected"
            stackId="3"
            stroke="#e61919"
            fill="#e61919"
            fillOpacity={0.45}
          />
          <Area
            type="monotone"
            dataKey="recovered"
            stackId="4"
            stroke="#5a5a55"
            fill="#5a5a55"
            fillOpacity={0.18}
          />
          <Line
            type="monotone"
            dataKey="deaths"
            stroke="#0a0a0a"
            strokeWidth={2.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
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
    <div className="grid grid-cols-[40px_minmax(160px,260px)_74px] items-center gap-2 max-[760px]:w-full max-[760px]:grid-cols-[40px_1fr_74px]">
      <button
        className={iconButtonClass}
        type="button"
        aria-label={isPlaying ? "Pause playback" : "Start playback"}
        onClick={() => onPlayingChange(!isPlaying)}
      >
        {isPlaying ? (
          <Pause size={17} strokeWidth={2} />
        ) : (
          <Play size={17} strokeWidth={2} />
        )}
      </button>
      <input
        aria-label="Current simulation day"
        className="w-full accent-red"
        type="range"
        min={0}
        max={maxDay}
        value={currentDay}
        onChange={(event) => onCurrentDayChange(Number(event.target.value))}
      />
      <select
        className={`${controlClass} h-[38px] px-[10px]`}
        aria-label="Playback speed"
        value={speed}
        onChange={(event) => onSpeedChange(Number(event.target.value))}
      >
        {speedOptions.map((option) => (
          <option key={option} value={option}>
            {option}x
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
        label="Transmission"
        description="1.00x is the disease baseline. Lower values reduce new exposures; higher values accelerate infections and deaths."
        value={interventions.transmissionRate}
        min={0.15}
        max={1.8}
        step={0.05}
        displayValue={formatMultiplier(interventions.transmissionRate)}
        icon={<Gauge size={16} strokeWidth={2} />}
        onChange={(value) => setInterventions({ transmissionRate: value })}
      />
      <SliderControl
        label="Isolation"
        description="Percent of infectious people effectively isolated. Higher values reduce infectious travel and contacts."
        value={interventions.isolationCompliance}
        min={0}
        max={0.95}
        step={0.05}
        displayValue={formatPercent(interventions.isolationCompliance)}
        icon={<Hospital size={16} strokeWidth={2} />}
        onChange={(value) => setInterventions({ isolationCompliance: value })}
      />
      <SliderControl
        label="Travel"
        description="Percent reduction in movement between nodes and airport importation. Higher values usually lower spread across the region."
        value={interventions.travelRestriction}
        min={0}
        max={1}
        step={0.05}
        displayValue={formatPercent(interventions.travelRestriction)}
        icon={<Plane size={16} strokeWidth={2} />}
        onChange={(value) => setInterventions({ travelRestriction: value })}
      />

      <div className="grid gap-0 border-t border-line-hair pt-2">
        {config.nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={
              closedNodeIds.has(node.id)
                ? "grid min-h-[38px] grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-[10px] border-0 border-b border-line-hair bg-red px-[10px] py-2 text-left font-mono text-[11px] tracking-[0.08em] text-[#fffefa] uppercase transition-colors duration-100 last:border-b-0"
                : "grid min-h-[38px] grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-[10px] border-0 border-b border-line-hair bg-transparent px-[10px] py-2 text-left font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors duration-100 last:border-b-0 hover:bg-paper-soft"
            }
            onClick={() => toggleNodeClosed(node.id)}
          >
            {getNodeIcon(node.type, 15)}
            <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{node.name}</span>
            <span className="font-mono text-[9px] font-bold tracking-[0.12em]">
              {closedNodeIds.has(node.id) ? "CLOSED" : "OPEN"}
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
  icon,
  onChange
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  icon: React.ReactNode;
  onChange: (value: number) => void;
}) {
  return (
    <label className="mb-5 grid gap-2 border-b border-line-hair pb-4 font-mono text-[10px] font-bold tracking-[0.14em] text-ink uppercase last-of-type:border-b-0">
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-ink">
          {icon}
          {label}
        </span>
        <strong className="font-mono text-[13px] font-bold tracking-[0.04em] text-red">{displayValue}</strong>
      </span>
      <span className="block max-w-[36rem] font-mono text-[11px] font-normal leading-[1.5] tracking-normal text-muted normal-case">{description}</span>
      <input
        className="w-full accent-red"
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

  return (
    <section className={panelClass}>
      <div className={panelHeaderClass}>
        <div>
          <p className={eyebrowClass}>Selected node</p>
          <h2 className={panelTitleClass}>{selectedNode.name}</h2>
        </div>
        <div className={isClosed ? `${statusClass} border-red bg-red` : `${statusClass} bg-ink`}>
          {isClosed ? "Closed" : "Open"}
        </div>
      </div>

      <div className="grid grid-cols-3 border-2 border-ink max-[760px]:grid-cols-1">
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
          <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: "#0a0a0a" }}
              tick={{ fill: "#0a0a0a", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
            />
            <YAxis
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={{ stroke: "#0a0a0a" }}
              tick={{ fill: "#0a0a0a", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatNumber(Number(value ?? 0)),
                String(name)
              ]}
              labelFormatter={(label) => `DAY ${label}`}
              contentStyle={{
                background: "#f4f4f0",
                border: "2px solid #0a0a0a",
                borderRadius: 0,
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em"
              }}
            />
            <Line
              type="monotone"
              dataKey="infected"
              stroke="#e61919"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="hospitalized"
              stroke="#0a0a0a"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <dl className="mt-3 grid grid-cols-3 border-2 border-ink max-[760px]:grid-cols-1">
        <div className="min-w-0 border-r border-ink bg-panel px-3 py-[10px] last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
          <dt className={`${labelTextClass} overflow-hidden text-ellipsis whitespace-nowrap`}>Population</dt>
          <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs font-bold tracking-[0.04em] text-ink uppercase">{formatNumber(selectedNode.population)}</dd>
        </div>
        <div className="min-w-0 border-r border-ink bg-panel px-3 py-[10px] last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
          <dt className={`${labelTextClass} overflow-hidden text-ellipsis whitespace-nowrap`}>Capacity</dt>
          <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs font-bold tracking-[0.04em] text-ink uppercase">{formatNumber(selectedNode.hospitalCapacity)}</dd>
        </div>
        <div className="min-w-0 border-r border-ink bg-panel px-3 py-[10px] last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
          <dt className={`${labelTextClass} overflow-hidden text-ellipsis whitespace-nowrap`}>Type</dt>
          <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs font-bold tracking-[0.04em] text-ink uppercase">{selectedNode.type}</dd>
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
    <div className="min-w-0 border-r border-ink bg-panel p-3 last:border-r-0 max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:last:border-b-0">
      <span className={labelTextClass}>{label}</span>
      <strong className="mt-1.5 block font-display text-lg font-normal leading-[0.95] tracking-[-0.03em] text-red">{formatCompact(value)}</strong>
      <small className="mt-1 block font-mono text-[10px] tracking-[0.08em] text-muted uppercase">{detail}</small>
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
    <section className={panelClass}>
      <div className={panelHeaderClass}>
        <div>
          <p className={eyebrowClass}>Incident note</p>
          <h2 className={panelTitleClass}>Explain this</h2>
        </div>
        <button
          className={iconButtonClass}
          type="button"
          aria-label="Generate incident note"
          disabled={status === "loading"}
          onClick={requestNarration}
        >
          <Sparkles size={16} strokeWidth={2} />
        </button>
      </div>
      <p className="m-0 border-l-4 border-red bg-paper-soft p-3 font-mono text-xs leading-[1.6] text-ink">
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
