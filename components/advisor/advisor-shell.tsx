"use client";

import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { calculateMetrics } from "@/lib/model";
import type {
  SimulationConfig,
  SimulationDay,
  SimulationMetrics
} from "@/lib/model";
import { formatCompact, formatNumber } from "@/lib/format";
import { useSimStore, type AdvisorMessage } from "@/lib/store/sim-store";

type ChatStatus = "ready" | "streaming" | "submitted" | "idle";

type MessagePart =
  | { type: "text"; text: string }
  | { type: "error"; title?: string; message: string };

type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
};

type AgentChatProps = {
  messages: AgentMessage[];
  onSend?: (message: { role: "user"; content: string }) => void;
  onStop?: () => void;
  status?: ChatStatus;
  error?: { message: string; title?: string } | null;
  emptyStatePosition?: "default" | "center";
  className?: string;
  draft?: string;
  onDraftChange?: (draft: string) => void;
};

const shellClass =
  "w-full max-w-[1320px] mx-auto px-12 pb-16 bg-[--color-bg] max-[700px]:px-5";
const topbarClass =
  "flex min-h-[60px] items-center justify-between border-b border-[--color-hair] py-5 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3";
const brandClass =
  "inline-flex items-center gap-[10px] text-[17px] font-medium tracking-[-0.01em]";
const brandMarkClass =
  "grid h-7 w-7 place-items-center rounded-full bg-[--color-paper-deep] text-[--color-accent]";
const navClass = "inline-flex items-center gap-7 text-[13.5px] text-[--color-body]";
const navLinkClass =
  "text-[--color-body] hover:text-[--color-ink] transition-colors";
const navLinkActiveClass = "text-[--color-ink] font-medium";
const headerGridClass =
  "grid grid-cols-[minmax(0,1fr)_minmax(360px,460px)] items-end gap-10 border-b border-[--color-hair] py-12 max-[980px]:grid-cols-1 max-[700px]:gap-5 max-[700px]:py-8";
const kickerClass = "m-0 mb-3 text-[12.5px] font-medium text-[--color-accent]";
const subheadClass = "mt-3 mb-0 text-[14px] text-[--color-muted]";
const labelTextClass = "text-[12px] font-medium text-[--color-muted]";

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

const SendIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const StopIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export function AdvisorShell() {
  const {
    config,
    timeline,
    currentDay,
    advisorMessages,
    advisorDraft,
    setAdvisorMessages,
    updateAdvisorMessages,
    setAdvisorDraft
  } = useSimStore();
  const metrics = useMemo(
    () => calculateMetrics(timeline, config.nodes),
    [timeline, config.nodes]
  );
  const current = timeline[currentDay] ?? timeline[0];
  const abortRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentMessages = useMemo<AgentMessage[]>(
    () =>
      advisorMessages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: [{ type: "text", text: message.content }]
      })),
    [advisorMessages]
  );

  const handleSend = useCallback(
    async ({ content }: { role: "user"; content: string }) => {
      const trimmedInput = content.trim();

      if (!trimmedInput || isStreaming) {
        return;
      }

      const userMessage: AdvisorMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedInput
      };
      const assistantMessage: AdvisorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: ""
      };
      const requestMessages = [...advisorMessages, userMessage];
      const nextMessages = [...requestMessages, assistantMessage];
      const controller = new AbortController();

      abortRef.current = controller;
      setAdvisorMessages(nextMessages);
      setAdvisorDraft("");
      setIsStreaming(true);
      setError(null);

      try {
        const response = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: requestMessages.map(({ role, content: messageContent }) => ({
              role,
              content: messageContent
            })),
            config,
            currentDay: current,
            metrics
          })
        });

        if (!response.ok || !response.body) {
          throw new Error("Advisor request failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamedText = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          streamedText += decoder.decode(value, { stream: true });
          updateAdvisorMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: streamedText }
                : message
            )
          );
        }
      } catch (sendError) {
        const stopped =
          sendError instanceof DOMException && sendError.name === "AbortError";

        if (stopped) {
          updateAdvisorMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: "Stopped before the advisor finished responding."
                  }
                : message
            )
          );
          return;
        }

        setError("Advisor is unavailable. The local simulation state is unchanged.");
        updateAdvisorMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id
              ? {
                  ...message,
                  content:
                    "The advisor stream is unavailable. Reduce transmission first, increase isolation compliance where feasible, and watch hospital breach timing before closing additional nodes."
                }
              : message
          )
        );
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [
      advisorMessages,
      config,
      current,
      isStreaming,
      metrics,
      setAdvisorDraft,
      setAdvisorMessages,
      updateAdvisorMessages
    ]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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
          <Link className={navLinkClass} href="/dashboard">
            Dashboard
          </Link>
          <Link className={navLinkActiveClass} href="/advisor">
            Advisor
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-[12px] text-[--color-muted]">
          <span className="dot" />
          Model running
        </div>
      </header>

      <section className={headerGridClass}>
        <div>
          <p className={kickerClass}>Advisor</p>
          <h1>Ask the advisor</h1>
          <p className={subheadClass}>
            Grounded in the current simulation snapshot · {config.scenario} ·
            Day {current.day} · {config.city.name}
          </p>
        </div>
        <div className="grid grid-cols-2 overflow-hidden rounded-[12px] border border-[--color-hair] max-[700px]:grid-cols-1">
          <SnapshotCell
            label="Infectious"
            value={formatCompact(current.aggregate.I)}
          />
          <SnapshotCell
            label="Hospitalized"
            value={formatCompact(current.aggregate.hospitalized)}
          />
          <SnapshotCell
            label="Peak day"
            value={`Day ${metrics.peakInfectedDay}`}
          />
          <SnapshotCell
            label="Deaths"
            value={formatCompact(metrics.totalDeaths)}
          />
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 pt-8 max-[980px]:grid-cols-1">
        <div className="min-h-[650px] overflow-hidden rounded-[12px] border border-[--color-hair] bg-[--color-paper] shadow-[0_18px_45px_-32px_rgba(38,34,27,0.45)]">
          <AgentChat
            messages={agentMessages}
            onSend={handleSend}
            onStop={handleStop}
            status={isStreaming ? "streaming" : "ready"}
            error={
              error
                ? {
                    title: "Request failed",
                    message: error
                  }
                : null
            }
            className="h-[650px]"
            draft={advisorDraft}
            onDraftChange={setAdvisorDraft}
          />
        </div>

        <aside className="overflow-hidden rounded-[12px] border border-[--color-hair] bg-[--color-paper]">
          <div className="flex items-center justify-between gap-4 border-b border-[--color-hair] px-5 py-4">
            <p className={kickerClass}>Context</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[--color-hair] px-3 py-1.5 text-[12px] text-[--color-body] transition-colors hover:bg-[--color-paper-soft] hover:text-[--color-ink] active:translate-y-px"
            >
              Dashboard
              <ArrowUpRightIcon />
            </Link>
          </div>

          <p className="m-0 border-b border-[--color-hair] px-5 py-3 text-[12px] font-medium text-[--color-muted]">
            Situation
          </p>
          <dl className="m-0 p-0">
            {[
              ["Current infectious", formatNumber(current.aggregate.I)],
              ["Current deaths", formatNumber(current.aggregate.D)],
              [
                "Hospital breach",
                metrics.firstNodeHospitalBreachDay === null
                  ? "None"
                  : `Day ${metrics.firstNodeHospitalBreachDay}`
              ],
              [
                "Transmission scale",
                `${config.interventions.transmissionRate.toFixed(2)}×`
              ],
              [
                "Isolation",
                `${Math.round(config.interventions.isolationCompliance * 100)}%`
              ],
              [
                "Travel restriction",
                `${Math.round(config.interventions.travelRestriction * 100)}%`
              ]
            ].map(([label, value], index, entries) => (
              <div
                key={label}
                className={`flex items-baseline justify-between gap-4 px-5 py-3.5 ${
                  index < entries.length - 1
                    ? "border-b border-[--color-hair]"
                    : ""
                }`}
              >
                <dt className={labelTextClass}>{label}</dt>
                <dd className="m-0 text-[13.5px] font-medium tabular-nums text-[--color-ink]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="m-0 border-y border-[--color-hair] px-5 py-3 text-[12px] font-medium text-[--color-muted]">
            Disease profile
          </p>
          <dl className="m-0 p-0">
            {[
              ["Pathogen", config.disease.name],
              ["R0", config.disease.r0.toFixed(1)],
              ["Incubation", `${config.disease.incubationDays} days`],
              ["Infectious period", `${config.disease.infectiousDays} days`],
              ["CFR", `${(config.disease.cfr * 100).toFixed(2)}%`],
              ["Severe cases", `${(config.disease.pSevere * 100).toFixed(1)}%`],
              [
                "Origin node",
                config.nodes.find((node) => node.id === config.seedNodeId)
                  ?.name ?? config.seedNodeId
              ],
              ["Seed cases", formatNumber(config.seedCases)]
            ].map(([label, value], index, entries) => (
              <div
                key={label}
                className={`flex items-baseline justify-between gap-4 px-5 py-3.5 ${
                  index < entries.length - 1
                    ? "border-b border-[--color-hair]"
                    : ""
                }`}
              >
                <dt className={labelTextClass}>{label}</dt>
                <dd className="m-0 text-right text-[13.5px] font-medium tabular-nums text-[--color-ink]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="m-0 border-t border-[--color-hair] bg-[--color-paper-soft] px-5 py-3.5 text-[12px] italic leading-[1.5] text-[--color-muted]">
            Advice is generated text. Model state changes only through the
            dashboard controls.
          </p>
        </aside>
      </section>

      <section className="grid grid-cols-2 gap-6 pt-6 max-[980px]:grid-cols-1">
        <CausesPanel config={config} current={current} />
        <ContainmentAdvisor
          key={`${config.scenario}-${config.seedNodeId}-${config.seedCases}`}
          config={config}
          timeline={timeline}
          metrics={metrics}
          initialDay={currentDay}
        />
      </section>
    </main>
  );
}

type ActionStatus = "monitoring" | "effective" | "diminishing" | "late";

type ContainmentAction = {
  name: string;
  status: ActionStatus;
  advice: string;
};

function CausesPanel({
  config,
  current
}: {
  config: SimulationConfig;
  current: SimulationDay;
}) {
  const seedNodeName =
    config.nodes.find((node) => node.id === config.seedNodeId)?.name ??
    config.seedNodeId;
  const zeroOutbreak =
    config.seedCases === 0 &&
    current.aggregate.E === 0 &&
    current.aggregate.I === 0;
  const causes = zeroOutbreak
    ? [
        {
          title: "No seed infections loaded",
          body: `${config.city.name} is running the selected disease profile with zero seed cases, so the model has no active transmission chain to propagate.`
        },
        {
          title: "Importation is suppressed",
          body: "Airport importation stays off for this intentional no-outbreak scenario, so background travel does not create cases on its own."
        },
        {
          title: "Preparedness view",
          body: `R0 ${config.disease.r0.toFixed(
            1
          )}, a ${config.disease.incubationDays}-day incubation period, and a ${config.disease.infectiousDays}-day infectious period remain available for planning once a seed case is introduced.`
        },
        {
          title: "Monitoring priority",
          body: "Use the run to confirm that dashboards, map state, narration, and advisor guidance handle a clean surveillance baseline."
        }
      ]
    : [
        {
          title: `High reproduction number (R0 ${config.disease.r0.toFixed(1)})`,
          body: `Each infectious person produces about ${config.disease.r0.toFixed(
            1
          )} secondary infections before recovery when controls are absent, so growth compounds quickly.`
        },
        {
          title: `Silent incubation (${config.disease.incubationDays} days)`,
          body: `Exposed people can move through the network before confirmation, which makes early detection and quarantine difficult.`
        },
        {
          title: `Extended infectious window (${config.disease.infectiousDays} days)`,
          body: `Cases remain contagious long enough for transit, schools, offices, and household contacts to overlap across roughly ${Math.round(
            config.disease.incubationDays + config.disease.infectiousDays
          )} days.`
        },
        {
          title: `Origin at ${seedNodeName}`,
          body: `${formatNumber(
            config.seedCases
          )} seed cases start in a connected node, allowing early movement to push exposure beyond the origin before the first peak is visible.`
        },
        {
          title: "Respiratory transmission",
          body: "Shared indoor air in dense settings makes population density, ventilation, and gathering duration the main environmental risk factors."
        },
        {
          title: `Severe burden (${(config.disease.pSevere * 100).toFixed(
            1
          )}% severe, ${(config.disease.cfr * 100).toFixed(2)}% fatal)`,
          body: "Even moderate severe-case rates strain beds when absolute case counts grow, raising the risk of capacity-driven secondary harm."
        }
      ];

  return (
    <article className="rounded-[12px] border border-[--color-hair] bg-[--color-paper] p-6 shadow-[0_18px_45px_-36px_rgba(38,34,27,0.5)]">
      <p className={kickerClass}>Causes</p>
      <h2 className="m-0 text-[20px] font-medium tracking-[-0.015em] text-[--color-ink]">
        {zeroOutbreak
          ? "Why this run stays quiet"
          : `Why ${config.disease.name} accelerates`}
      </h2>
      <ul className="m-0 mt-5 grid list-none gap-4 p-0">
        {causes.map((cause) => (
          <li key={cause.title} className="grid gap-1.5">
            <strong className="text-[13.5px] font-medium text-[--color-ink]">
              {cause.title}
            </strong>
            <p className="m-0 text-[13px] leading-[1.6] text-[--color-body]">
              {cause.body}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ContainmentAdvisor({
  config,
  timeline,
  metrics,
  initialDay
}: {
  config: SimulationConfig;
  timeline: SimulationDay[];
  metrics: SimulationMetrics;
  initialDay: number;
}) {
  const maxDay = Math.max(0, timeline.length - 1);
  const [rawDay, setRawDay] = useState(() => clampIndex(initialDay, maxDay));
  const day = clampIndex(rawDay, maxDay);

  const snap = timeline[day] ?? timeline[0];
  const disease = config.disease;
  const seedNodeName =
    config.nodes.find((node) => node.id === config.seedNodeId)?.name ??
    config.seedNodeId;
  const totalPopulation = config.nodes.reduce(
    (sum, node) => sum + node.population,
    0
  );
  const infectiousRate =
    totalPopulation > 0 ? snap.aggregate.I / totalPopulation : 0;
  const zeroOutbreak =
    config.seedCases === 0 &&
    snap.aggregate.E === 0 &&
    snap.aggregate.I === 0;
  const safePeakDay = Math.max(1, metrics.peakInfectedDay);
  const phase = zeroOutbreak
    ? "Monitoring"
    : day < disease.incubationDays
      ? "Early detection"
      : day < safePeakDay * 0.55
        ? "Growth"
        : day < safePeakDay * 1.1
          ? "Peak"
          : day < safePeakDay * 1.6
            ? "Declining"
            : "Recovery";
  const actions = zeroOutbreak
    ? createMonitoringActions(config)
    : createContainmentActions({
        day,
        disease,
        infectiousRate,
        metrics,
        seedCases: config.seedCases,
        seedNodeName,
        snap
      });

  return (
    <article className="rounded-[12px] border border-[--color-hair] bg-[--color-paper] p-6 shadow-[0_18px_45px_-36px_rgba(38,34,27,0.5)]">
      <p className={kickerClass}>Containment</p>
      <h2 className="m-0 text-[20px] font-medium tracking-[-0.015em] text-[--color-ink]">
        What can still be done
      </h2>

      <div className="mt-5 rounded-[10px] border border-[--color-hair] bg-[--color-paper-soft] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-7 items-center rounded-full border px-3 text-[11.5px] font-medium"
              style={phaseStyle(phase)}
            >
              {phase}
            </span>
            <span className="text-[13px] font-medium tabular-nums text-[--color-ink]">
              Day {day}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-[12px] text-[--color-body]">
            <span>
              <strong className="font-medium tabular-nums text-[--color-ink]">
                {formatCompact(snap.aggregate.I)}
              </strong>{" "}
              infectious
            </span>
            <span>
              <strong className="font-medium tabular-nums text-[--color-ink]">
                {formatCompact(snap.aggregate.hospitalized)}
              </strong>{" "}
              hospitalized
            </span>
            <span>
              <strong className="font-medium tabular-nums text-[--color-ink]">
                {formatCompact(snap.aggregate.D)}
              </strong>{" "}
              deaths
            </span>
          </div>
        </div>

        <div className="relative mt-5 pb-8">
          <input
            type="range"
            min={0}
            max={maxDay}
            value={day}
            onChange={(event) => setRawDay(Number(event.target.value))}
            className="w-full"
            style={{ accentColor: "var(--color-accent)" }}
            aria-label="Select containment day"
          />
          <div className="mt-1 flex justify-between text-[11px] text-[--color-muted]">
            <span>Day 0</span>
            <span>Day {maxDay}</span>
          </div>
          {maxDay > 0 ? (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-5 text-[10.5px] text-[--color-muted]">
              <span
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${markerPercent(metrics.peakInfectedDay, maxDay)}%` }}
                title={`Peak day ${metrics.peakInfectedDay}`}
              >
                Peak {metrics.peakInfectedDay}
              </span>
              {metrics.firstNodeHospitalBreachDay !== null ? (
                <span
                  className="absolute -translate-x-1/2 whitespace-nowrap text-[--color-alarm]"
                  style={{
                    left: `${markerPercent(
                      metrics.firstNodeHospitalBreachDay,
                      maxDay
                    )}%`
                  }}
                  title={`Hospital breach day ${metrics.firstNodeHospitalBreachDay}`}
                >
                  Breach {metrics.firstNodeHospitalBreachDay}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <ul className="m-0 mt-5 grid list-none gap-3 p-0">
        {actions.map((action) => (
          <li
            key={action.name}
            className="rounded-[10px] border border-[--color-hair] bg-[--color-bg] p-4"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: statusColor(action.status) }}
              />
              <strong className="text-[13.5px] font-medium text-[--color-ink]">
                {action.name}
              </strong>
              <span className="text-[11.5px] text-[--color-muted]">
                {statusLabel(action.status)}
              </span>
            </div>
            <p className="m-0 mt-2 text-[12.5px] leading-[1.55] text-[--color-body]">
              {action.advice}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function createMonitoringActions(config: SimulationConfig): ContainmentAction[] {
  const seedNodeName =
    config.nodes.find((node) => node.id === config.seedNodeId)?.name ??
    config.nodes[0]?.name ??
    config.seedNodeId;

  return [
    {
      name: "Maintain surveillance",
      status: "monitoring",
      advice:
        "No active outbreak is present. Keep syndromic and laboratory reporting online so the first imported case is visible quickly."
    },
    {
      name: "Verify origin readiness",
      status: "monitoring",
      advice: `${seedNodeName} is the configured origin if a seed is introduced. Keep screening, isolation rooms, and escalation contacts current.`
    },
    {
      name: "Avoid emergency closures",
      status: "monitoring",
      advice:
        "With zero infections, broad closures and travel restrictions have no containment target. Preserve readiness without triggering outbreak-cost measures."
    },
    {
      name: "Hospital surge preparation",
      status: "monitoring",
      advice: "No hospital breach projected. Maintain baseline staffing checks and defer surge activation until cases appear."
    }
  ];
}

function createContainmentActions({
  day,
  disease,
  infectiousRate,
  metrics,
  seedCases,
  seedNodeName,
  snap
}: {
  day: number;
  disease: SimulationConfig["disease"];
  infectiousRate: number;
  metrics: SimulationMetrics;
  seedCases: number;
  seedNodeName: string;
  snap: SimulationDay;
}): ContainmentAction[] {
  const actionStatus = (
    effective: boolean,
    diminishing: boolean
  ): ActionStatus => {
    if (effective) {
      return "effective";
    }

    if (diminishing) {
      return "diminishing";
    }

    return "late";
  };

  return [
    {
      name: "Isolate origin node",
      status: actionStatus(
        day < disease.incubationDays,
        day < disease.incubationDays * 2.5
      ),
      advice:
        day < disease.incubationDays
          ? `Close ${seedNodeName} now. Spread has not yet fully surfaced, so this is the highest-leverage action available.`
          : day < disease.incubationDays * 2.5
            ? `Partial value remains. Restrict ${seedNodeName} and test outbound contacts while community chains are forming.`
            : "Community spread is established across multiple nodes. Origin closure is now a mitigation tool, not containment by itself."
    },
    {
      name: "Contact tracing",
      status: actionStatus(infectiousRate < 0.005, infectiousRate < 0.02),
      advice:
        infectiousRate < 0.005
          ? `Case counts are manageable at ${formatCompact(
              snap.aggregate.I
            )} infectious. Trace aggressively while each broken chain still changes the curve.`
          : infectiousRate < 0.02
            ? "Tracing is becoming overloaded. Focus on transit, schools, and hospital-linked clusters instead of broad coverage."
            : "Active chains exceed practical tracing capacity. Shift resources toward population-level isolation and exposure reduction."
    },
    {
      name: "Travel restrictions",
      status: actionStatus(
        day < metrics.peakInfectedDay * 0.4,
        day < metrics.peakInfectedDay * 1.1
      ),
      advice:
        day < metrics.peakInfectedDay * 0.4
          ? "High impact now. Cutting inter-node flow prevents clean districts from being seeded through transit and airport movement."
          : day < metrics.peakInfectedDay * 1.1
            ? `Still useful for limiting cross-node surge. Hold meaningful restrictions through Day ${metrics.peakInfectedDay}.`
            : `Peak is past. Keep moderate restriction until infectious counts fall below ${formatCompact(
                seedCases * 5
              )} to reduce rebound risk.`
    },
    {
      name: "School and venue closures",
      status: actionStatus(
        day >= Math.round(disease.incubationDays) &&
          day < metrics.peakInfectedDay * 0.7,
        day < metrics.peakInfectedDay * 1.15
      ),
      advice:
        day < disease.incubationDays
          ? "Prepare closure orders, but wait for confirmed community spread before triggering high-cost venue closures."
          : day < metrics.peakInfectedDay * 0.7
            ? `Close schools and dense venues now. Enclosed mixing is the primary amplifier at R0 ${disease.r0.toFixed(1)}.`
            : day < metrics.peakInfectedDay * 1.15
              ? `Closures are limiting peak height. Hold them through Day ${metrics.peakInfectedDay} before staged reopening.`
              : `Reopen lower-risk areas first and watch for a ${Math.round(
                  disease.incubationDays * 2
                )}-day uptick after each step.`
    },
    {
      name: "Isolation compliance",
      status: actionStatus(
        day < metrics.peakInfectedDay,
        day < metrics.peakInfectedDay * 1.4
      ),
      advice:
        day < metrics.peakInfectedDay
          ? `Every 10% compliance gain cuts effective spread. Push above 70% before Day ${metrics.peakInfectedDay} to lower the peak.`
          : day < metrics.peakInfectedDay * 1.4
            ? `Peak has passed, but secondary waves can form within ${Math.round(
                disease.infectiousDays * 3
              )} days of an early lift.`
            : "Compliance can relax gradually once daily infections continue falling and hospitals stay below capacity."
    },
    {
      name: "Hospital surge preparation",
      status: actionStatus(
        metrics.firstNodeHospitalBreachDay !== null &&
          day < metrics.firstNodeHospitalBreachDay - 10,
        metrics.firstNodeHospitalBreachDay !== null &&
          day < metrics.firstNodeHospitalBreachDay + 5
      ),
      advice:
        metrics.firstNodeHospitalBreachDay === null
          ? `No hospital breach projected. Current severe-case rate (${(
              disease.pSevere * 100
            ).toFixed(1)}%) stays within modeled capacity.`
          : day < metrics.firstNodeHospitalBreachDay - 10
            ? `Breach is projected on Day ${
                metrics.firstNodeHospitalBreachDay
              }. There are ${
                metrics.firstNodeHospitalBreachDay - day
              } days to pre-position beds, staff, and transfer paths.`
            : day < metrics.firstNodeHospitalBreachDay + 5
              ? `Breach is imminent or active. Activate overflow protocols for about ${formatCompact(
                  Math.round(snap.aggregate.I * disease.pSevere)
                )} current severe cases.`
              : `The breach window is passing. Stand down gradually and keep a buffer through Day ${
                  metrics.peakInfectedDay + 14
                }.`
    }
  ];
}

function phaseStyle(phase: string) {
  if (phase === "Monitoring") {
    return {
      background: "var(--color-paper)",
      borderColor: "var(--color-hair)",
      color: "var(--color-muted)"
    };
  }

  if (phase === "Peak") {
    return {
      background: "var(--color-alarm-soft)",
      borderColor: "color-mix(in srgb, var(--color-alarm) 35%, transparent)",
      color: "var(--color-alarm)"
    };
  }

  return {
    background: "var(--color-accent-soft)",
    borderColor: "color-mix(in srgb, var(--color-accent) 35%, transparent)",
    color: "var(--color-accent)"
  };
}

function statusLabel(status: ActionStatus) {
  switch (status) {
    case "monitoring":
      return "Monitoring";
    case "effective":
      return "Effective";
    case "diminishing":
      return "Diminishing";
    case "late":
      return "Late-stage";
  }
}

function statusColor(status: ActionStatus) {
  switch (status) {
    case "monitoring":
      return "var(--color-muted)";
    case "effective":
      return "var(--color-accent)";
    case "diminishing":
      return "var(--color-e)";
    case "late":
      return "var(--color-alarm)";
  }
}

function markerPercent(day: number, maxDay: number) {
  if (maxDay <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (day / maxDay) * 100));
}

function clampIndex(day: number, maxDay: number) {
  return Math.max(0, Math.min(maxDay, Math.round(day)));
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] whitespace-pre-wrap break-words rounded-[16px] bg-[--color-paper-soft] px-4 py-2.5 text-[14px] leading-[1.55] text-[--color-ink] shadow-[inset_0_0_0_1px_var(--color-hair)]">
        {text}
      </div>
    </div>
  );
}

function AssistantText({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] whitespace-pre-wrap break-words text-[15px] leading-[1.75] text-[--color-body]">
        {text}
      </div>
    </div>
  );
}

function ThinkingText() {
  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-2 text-[14px] text-[--color-muted]">
        Thinking
        <span className="inline-flex gap-1">
          <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
          <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
          <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
        </span>
      </div>
    </div>
  );
}

function ErrorBubble({
  title = "Request failed",
  message
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="flex justify-start">
      <div className="rounded-[8px] border border-[--color-alarm]/30 bg-[--color-alarm-soft] px-4 py-2.5 text-sm">
        <div className="font-medium text-[--color-ink]">{title}</div>
        <div className="mt-0.5 text-[--color-alarm]">{message}</div>
      </div>
    </div>
  );
}

function MessageList({ messages }: { messages: AgentMessage[] }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto flex max-w-[680px] flex-col gap-5">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col gap-2">
            {message.parts.map((part, index) => {
              if (part.type === "error") {
                return (
                  <ErrorBubble
                    key={`${message.id}-${index}`}
                    title={part.title}
                    message={part.message}
                  />
                );
              }

              if (!part.text) {
                return <ThinkingText key={`${message.id}-${index}`} />;
              }

              if (message.role === "user") {
                return (
                  <UserBubble key={`${message.id}-${index}`} text={part.text} />
                );
              }

              return (
                <AssistantText key={`${message.id}-${index}`} text={part.text} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function InputBar({
  onSend,
  onStop,
  status = "ready",
  placeholder = "Ask about the current run...",
  className,
  value: controlledValue,
  onChange,
  disabled
}: {
  onSend?: (message: { role: "user"; content: string }) => void;
  onStop?: () => void;
  status?: ChatStatus;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const [internal, setInternal] = useState("");
  const isControlled = controlledValue !== undefined;
  const input = isControlled ? controlledValue : internal;
  const ref = useRef<HTMLTextAreaElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";
  const hasInput = input.trim().length > 0;

  const setInput = useCallback(
    (value: string) => {
      if (isControlled) {
        onChange?.(value);
      } else {
        setInternal(value);
      }
    },
    [isControlled, onChange]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.style.height = "0";
    const nextHeight = Math.min(element.scrollHeight, 120);
    element.style.height = `${nextHeight}px`;
    element.style.overflowY = element.scrollHeight > 120 ? "auto" : "hidden";
  }, [input]);

  const submit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) {
      return;
    }

    onSend?.({ role: "user", content: trimmed });
    setInput("");
  }, [disabled, input, isStreaming, onSend, setInput]);

  return (
    <div className={cn("w-full shrink-0 px-4 pb-4", className)}>
      <div className="mx-auto max-w-[680px]">
        <div
          className="relative cursor-text rounded-[16px] border border-[--color-hair] bg-[--color-bg] shadow-[0_12px_28px_-22px_rgba(38,34,27,0.55)] transition-[border-color,box-shadow] duration-200 focus-within:border-[--color-accent]"
          onClick={(event) => {
            if (
              event.target === event.currentTarget ||
              !(event.target as HTMLElement).closest("button, textarea")
            ) {
              ref.current?.focus();
            }
          }}
        >
          <div className="min-h-[58px] px-3.5 pb-0 pt-3">
            <label className="sr-only" htmlFor="advisor-message">
              Your message
            </label>
            <textarea
              ref={ref}
              id="advisor-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit();
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full resize-none overflow-hidden border-0 bg-transparent text-[14px] leading-[1.6] text-[--color-ink] outline-none placeholder:text-[--color-muted]",
                disabled && "cursor-not-allowed opacity-50"
              )}
            />
          </div>
          <div className="flex items-center justify-between gap-3 px-2 pb-2 pt-1">
            <p className="m-0 px-1.5 text-[11.5px] text-[--color-muted]">
              Press Enter to send. Shift Enter for a new line.
            </p>
            <button
              type="button"
              aria-label={isStreaming ? "Stop" : "Send"}
              onClick={() => {
                if (isStreaming) {
                  onStop?.();
                } else if (hasInput) {
                  submit();
                }
              }}
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[background,color,transform,opacity] duration-150 active:translate-y-px",
                isStreaming || hasInput
                  ? ""
                  : "bg-[--color-paper-deep] text-[--color-muted]"
              )}
              style={
                isStreaming || hasInput
                  ? {
                      background: "var(--color-ink)",
                      color: "var(--color-bg)"
                    }
                  : undefined
              }
            >
              {isStreaming ? <StopIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AgentChat = memo(function AgentChat({
  messages,
  onSend,
  onStop,
  status = "ready",
  error,
  emptyStatePosition = "default",
  className,
  draft: controlledDraft,
  onDraftChange
}: AgentChatProps) {
  const [internalDraft, setInternalDraft] = useState("");
  const draft = controlledDraft ?? internalDraft;
  const setDraft = onDraftChange ?? setInternalDraft;
  const messagesWithError: AgentMessage[] = useMemo(() => {
    if (!error) {
      return messages;
    }

    return [
      ...messages,
      {
        id: "agent-chat-error",
        role: "assistant",
        parts: [
          {
            type: "error",
            title: error.title ?? "Request failed",
            message: error.message
          }
        ]
      }
    ];
  }, [error, messages]);

  const isEmpty = !error && messages.length === 0;
  const isCenteredEmpty = isEmpty && emptyStatePosition === "center";
  const inputBarNode: ReactNode = (
    <InputBar
      onSend={onSend}
      onStop={onStop}
      status={status}
      value={draft}
      onChange={setDraft}
      className={isCenteredEmpty ? "px-0 pb-0" : undefined}
    />
  );

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {isCenteredEmpty ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-4">
          <div className="w-full max-w-[680px]">{inputBarNode}</div>
        </div>
      ) : (
        <MessageList messages={messagesWithError} />
      )}
      {!isCenteredEmpty && inputBarNode}
    </div>
  );
});

function SnapshotCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-r border-b border-[--color-hair] bg-[--color-paper] px-5 py-4 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 max-[700px]:border-r-0 max-[700px]:border-b max-[700px]:last:border-b-0">
      <span className={labelTextClass}>{label}</span>
      <strong className="mt-1.5 block text-[22px] font-medium leading-[1] tracking-[-0.02em] tabular-nums text-[--color-ink]">
        {value}
      </strong>
    </div>
  );
}
