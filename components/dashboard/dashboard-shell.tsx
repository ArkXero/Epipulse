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
import styles from "./dashboard.module.css";

const speedOptions = [0.5, 1, 2, 4];

const presetPrompts: Record<PresetKey, string> = {
  denver: "A novel respiratory virus emerges in Denver in winter.",
  nyc: "A novel respiratory virus spreads through New York City transit corridors.",
  dmv: "A novel respiratory virus emerges across the DC, Maryland, and Virginia area.",
  island: "A respiratory outbreak reaches an island resort with limited hospital capacity."
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
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Epipulse dashboard">
          <span className={styles.brandMark}>
            <Activity size={18} strokeWidth={2} />
          </span>
          <span>Epipulse</span>
        </Link>
        <nav className={styles.nav}>
          <Link className={styles.navLinkActive} href="/">
            Dashboard
          </Link>
          <Link className={styles.navLink} href="/advisor">
            Advisor
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Network SEIR command view</p>
          <h1>{config.scenario}</h1>
          <p className={styles.subhead}>
            {config.city.name} · {config.disease.name} · R0{" "}
            {config.disease.r0.toFixed(1)}
          </p>
        </div>
        <ScenarioPanel />
      </section>

      <MetricsStrip metrics={metrics} />

      <section className={styles.workspace}>
        <div className={styles.primaryColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>Aggregate trajectory</p>
                <h2>Day {current.day}</h2>
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>Geographic spread</p>
                <h2>{config.city.name}</h2>
              </div>
              <div className={styles.dayBadge}>Day {current.day}</div>
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

        <aside className={styles.sideColumn}>
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
    <form className={styles.scenarioPanel} onSubmit={handleGenerate}>
      <div className={styles.fieldRow}>
        <label htmlFor="preset">Preset</label>
        <select
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
      <div className={styles.fieldRow}>
        <label htmlFor="scenario-prompt">Scenario prompt</label>
        <textarea
          id="scenario-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={3}
        />
      </div>
      {error ? <p className={styles.inlineError}>{error}</p> : null}
      <button
        className={styles.primaryButton}
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
    <section className={styles.metricsStrip}>
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
    <div className={styles.metricCell}>
      <div className={styles.metricIcon}>{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}

function AggregateChart() {
  const timeline = useSimStore((state) => state.timeline);
  const currentDay = useSimStore((state) => state.currentDay);
  const [zoomWindow, setZoomWindow] = useState(timeline.length);

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

  const visibleData = useMemo(() => {
    const fullLength = data.length;

    if (zoomWindow >= fullLength) {
      return data;
    }

    const center = Math.max(0, Math.min(currentDay, fullLength - 1));
    const halfWindow = Math.floor(zoomWindow / 2);
    let start = center - halfWindow;
    let end = start + zoomWindow - 1;

    if (start < 0) {
      start = 0;
      end = zoomWindow - 1;
    }

    if (end >= fullLength) {
      end = fullLength - 1;
      start = Math.max(0, end - zoomWindow + 1);
    }

    return data.slice(start, end + 1);
  }, [currentDay, data, zoomWindow]);

  const minWindow = Math.max(6, Math.round(data.length * 0.12));

  function zoomIn() {
    setZoomWindow((previous) => Math.max(minWindow, Math.round(previous / 2)));
  }

  function zoomOut() {
    setZoomWindow((previous) => Math.min(data.length, previous * 2));
  }

  function resetZoom() {
    setZoomWindow(data.length);
  }

  return (
    <div className={styles.chartFrame}>
      <div className={styles.chartToolbar}>
        <div>
          <p className={styles.eyebrow}>Zoom</p>
          <p className={styles.chartZoomHint}>Focus the timeline around the current day.</p>
        </div>
        <div className={styles.chartZoomControls}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Zoom in on the graph"
            onClick={zoomIn}
          >
            −
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Zoom out on the graph"
            onClick={zoomOut}
          >
            +
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.chartResetButton}`}
            aria-label="Reset graph zoom"
            onClick={resetZoom}
          >
            Reset
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={visibleData}
          margin={{ top: 18, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#ded8c8" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6d7167", fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatCompact}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: "#6d7167", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value, name) => [
              formatNumber(Number(value ?? 0)),
              String(name)
            ]}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{
              background: "#fffefa",
              border: "1px solid #d9d5c8",
              borderRadius: 8,
              boxShadow: "0 14px 35px rgba(32, 33, 29, 0.12)"
            }}
          />
          <Area
            type="monotone"
            dataKey="susceptible"
            stackId="1"
            stroke="#3c647f"
            fill="#3c647f"
            fillOpacity={0.15}
          />
          <Area
            type="monotone"
            dataKey="exposed"
            stackId="2"
            stroke="#a87924"
            fill="#a87924"
            fillOpacity={0.22}
          />
          <Area
            type="monotone"
            dataKey="infected"
            stackId="3"
            stroke="#b04d3f"
            fill="#b04d3f"
            fillOpacity={0.26}
          />
          <Area
            type="monotone"
            dataKey="recovered"
            stackId="4"
            stroke="#2f7d68"
            fill="#2f7d68"
            fillOpacity={0.18}
          />
          <Line
            type="monotone"
            dataKey="deaths"
            stroke="#20211d"
            strokeWidth={2}
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
    <div className={styles.playback}>
      <button
        className={styles.iconButton}
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
        className={styles.scrubber}
        type="range"
        min={0}
        max={maxDay}
        value={currentDay}
        onChange={(event) => onCurrentDayChange(Number(event.target.value))}
      />
      <select
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
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Levers</p>
          <h2>Interventions</h2>
        </div>
        <button
          className={styles.iconButton}
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

      <div className={styles.toggleList}>
        {config.nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className={
              closedNodeIds.has(node.id)
                ? styles.nodeToggleActive
                : styles.nodeToggle
            }
            onClick={() => toggleNodeClosed(node.id)}
          >
            {getNodeIcon(node.type, 15)}
            <span>{node.name}</span>
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
    <label className={styles.sliderControl}>
      <span>
        <span className={styles.sliderLabel}>
          {icon}
          {label}
        </span>
        <strong>{displayValue}</strong>
      </span>
      <span className={styles.sliderCopy}>{description}</span>
      <input
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
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Selected node</p>
          <h2>{selectedNode.name}</h2>
        </div>
        <div className={isClosed ? styles.statusClosed : styles.statusOpen}>
          {isClosed ? "Closed" : "Open"}
        </div>
      </div>

      <div className={styles.nodeStats}>
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

      <div className={styles.miniChart}>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6d7167", fontSize: 11 }}
            />
            <YAxis
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#6d7167", fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [
                formatNumber(Number(value ?? 0)),
                String(name)
              ]}
              labelFormatter={(label) => `Day ${label}`}
              contentStyle={{
                background: "#fffefa",
                border: "1px solid #d9d5c8",
                borderRadius: 8
              }}
            />
            <Line
              type="monotone"
              dataKey="infected"
              stroke="#b04d3f"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="hospitalized"
              stroke="#a87924"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <dl className={styles.nodeFacts}>
        <div>
          <dt>Population</dt>
          <dd>{formatNumber(selectedNode.population)}</dd>
        </div>
        <div>
          <dt>Capacity</dt>
          <dd>{formatNumber(selectedNode.hospitalCapacity)}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{selectedNode.type}</dd>
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
    <div>
      <span>{label}</span>
      <strong>{formatCompact(value)}</strong>
      <small>{detail}</small>
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
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Incident note</p>
          <h2>Explain this</h2>
        </div>
        <button
          className={styles.iconButton}
          type="button"
          aria-label="Generate incident note"
          disabled={status === "loading"}
          onClick={requestNarration}
        >
          <Sparkles size={16} strokeWidth={2} />
        </button>
      </div>
      <p className={styles.reportText}>
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
