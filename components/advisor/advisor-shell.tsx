"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Send,
  UserRound
} from "lucide-react";
import { calculateMetrics } from "@/lib/model";
import { formatCompact, formatNumber } from "@/lib/format";
import { useSimStore } from "@/lib/store/sim-store";
import type { AdvisorMessage } from "@/lib/store/sim-store";
import type { SimulationConfig, SimulationDay, SimulationMetrics } from "@/lib/model/types";
import styles from "./advisor.module.css";

type LocalMessage = AdvisorMessage;

export function AdvisorShell() {
  const { config, timeline, currentDay, advisorMessages, setAdvisorMessages } = useSimStore();
  const metrics = useMemo(
    () => calculateMetrics(timeline, config.nodes),
    [timeline, config.nodes]
  );
  const current = timeline[currentDay] ?? timeline[0];
  const messages = advisorMessages;
  const setMessages = (
    updater: LocalMessage[] | ((prev: LocalMessage[]) => LocalMessage[])
  ) => {
    if (typeof updater === "function") {
      setAdvisorMessages(updater(useSimStore.getState().advisorMessages));
    } else {
      setAdvisorMessages(updater);
    }
  };
  const [input, setInput] = useState("What should we do on the current day?");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || isStreaming) {
      return;
    }

    const userMessage: LocalMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput
    };
    const assistantMessage: LocalMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: ""
    };
    const nextMessages = [...messages, userMessage, assistantMessage];

    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content
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
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: streamedText }
              : message
          )
        );
      }
    } catch {
      setError("Advisor is unavailable. The local simulation state is unchanged.");
      setMessages((currentMessages) =>
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
      setIsStreaming(false);
    }
  }

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
          <Link className={styles.navLink} href="/">
            Dashboard
          </Link>
          <Link className={styles.navLinkActive} href="/advisor">
            Advisor
          </Link>
        </nav>
      </header>

      <section className={styles.headerGrid}>
        <div>
          <p className={styles.kicker}>Advisor</p>
          <h1>Operational guidance from the live run</h1>
          <p className={styles.subhead}>
            {config.scenario} · day {current.day} · {config.city.name}
          </p>
        </div>
        <div className={styles.snapshot}>
          <SnapshotCell label="Infectious" value={formatCompact(current.aggregate.I)} />
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

      <section className={styles.advisorGrid}>
        <div className={styles.chatPanel}>
          <div className={styles.messages}>
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                <span className={styles.messageIcon}>
                  {message.role === "user" ? (
                    <UserRound size={16} strokeWidth={2} />
                  ) : (
                    <Bot size={16} strokeWidth={2} />
                  )}
                </span>
                <p>{message.content || "Thinking"}</p>
              </article>
            ))}
          </div>

          <form className={styles.composer} onSubmit={handleSubmit}>
            <label htmlFor="advisor-message">Message</label>
            <textarea
              id="advisor-message"
              value={input}
              rows={3}
              onChange={(event) => setInput(event.target.value)}
            />
            {error ? <p className={styles.inlineError}>{error}</p> : null}
            <button type="submit" disabled={isStreaming}>
              <Send size={16} strokeWidth={2} />
              {isStreaming ? "Sending" : "Send"}
            </button>
          </form>
        </div>

        <aside className={styles.contextPanel}>
          <div className={styles.contextHeader}>
            <p className={styles.kicker}>Context</p>
            <Link href="/" className={styles.backLink}>
              Dashboard
              <ArrowUpRight size={15} strokeWidth={2} />
            </Link>
          </div>

          <p className={`${styles.kicker} ${styles.sectionLabel}`}>Situation</p>
          <dl className={styles.contextList}>
            <div>
              <dt>Current infectious</dt>
              <dd>{formatNumber(current.aggregate.I)}</dd>
            </div>
            <div>
              <dt>Current deaths</dt>
              <dd>{formatNumber(current.aggregate.D)}</dd>
            </div>
            <div>
              <dt>Hospital breach</dt>
              <dd>
                {metrics.firstNodeHospitalBreachDay === null
                  ? "None"
                  : `Day ${metrics.firstNodeHospitalBreachDay}`}
              </dd>
            </div>
            <div>
              <dt>Transmission scale</dt>
              <dd>{config.interventions.transmissionRate.toFixed(2)}x</dd>
            </div>
            <div>
              <dt>Isolation</dt>
              <dd>
                {Math.round(config.interventions.isolationCompliance * 100)}%
              </dd>
            </div>
            <div>
              <dt>Travel restriction</dt>
              <dd>
                {Math.round(config.interventions.travelRestriction * 100)}%
              </dd>
            </div>
          </dl>

          <p className={`${styles.kicker} ${styles.sectionLabel}`}>Disease Profile</p>
          <dl className={styles.contextList}>
            <div>
              <dt>Pathogen</dt>
              <dd>{config.disease.name}</dd>
            </div>
            <div>
              <dt>R₀</dt>
              <dd>{config.disease.r0.toFixed(1)}</dd>
            </div>
            <div>
              <dt>Incubation</dt>
              <dd>{config.disease.incubationDays} days</dd>
            </div>
            <div>
              <dt>Infectious period</dt>
              <dd>{config.disease.infectiousDays} days</dd>
            </div>
            <div>
              <dt>Case fatality rate</dt>
              <dd>{(config.disease.cfr * 100).toFixed(2)}%</dd>
            </div>
            <div>
              <dt>Severe cases</dt>
              <dd>{(config.disease.pSevere * 100).toFixed(1)}%</dd>
            </div>
            <div>
              <dt>Origin node</dt>
              <dd>
                {config.nodes.find((n) => n.id === config.seedNodeId)?.name ?? config.seedNodeId}
              </dd>
            </div>
            <div>
              <dt>Seed cases</dt>
              <dd>{config.seedCases}</dd>
            </div>
          </dl>

          <div className={styles.alertBox}>
            <AlertTriangle size={17} strokeWidth={2} />
            <span>
              Advice is generated text. Model state changes only through the
              dashboard controls.
            </span>
          </div>
        </aside>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoCard}>
          <p className={styles.kicker}>Causes</p>
          <h2 className={styles.infoHeading}>
            Why {config.disease.name} spreads so rapidly
          </h2>
          <ul className={styles.causesList}>
            <li>
              <strong>High reproduction number (R₀ {config.disease.r0.toFixed(1)})</strong>
              — each infectious person infects an average of {config.disease.r0.toFixed(1)} others
              before recovery. Values above 1.0 guarantee exponential growth without
              intervention.
            </li>
            <li>
              <strong>Silent incubation ({config.disease.incubationDays} days)</strong>
              — exposed individuals show no symptoms for nearly {Math.round(config.disease.incubationDays)} days
              while already capable of infecting close contacts, making early detection
              and quarantine extremely difficult.
            </li>
            <li>
              <strong>Extended infectious window ({config.disease.infectiousDays} days)</strong>
              — once symptomatic, a case remains contagious for {config.disease.infectiousDays} days.
              Combined with the incubation gap, total transmission exposure spans
              roughly {Math.round(config.disease.incubationDays + config.disease.infectiousDays)} days per case.
            </li>
            <li>
              <strong>Airport seeding at {config.nodes.find((n) => n.id === config.seedNodeId)?.name ?? config.seedNodeId}</strong>
              — origin at a high-throughput transit node means the pathogen dispersed
              across multiple districts before the first case was confirmed. Travel hubs
              act as multipliers, not origins.
            </li>
            <li>
              <strong>Respiratory droplet transmission</strong>
              — spread via shared air in enclosed spaces (transit, schools, offices)
              makes population density and ventilation the primary environmental risk
              factors, not direct contact.
            </li>
            <li>
              <strong>Severe case burden ({(config.disease.pSevere * 100).toFixed(1)}% severe, {(config.disease.cfr * 100).toFixed(2)}% fatal)</strong>
              — even a moderate severe rate strains hospital capacity disproportionately
              when absolute case counts are large, creating secondary mortality from
              deferred non-outbreak care.
            </li>
          </ul>
        </div>

        <ContainmentSlider config={config} timeline={timeline} metrics={metrics} />
      </section>
    </main>
  );
}

function SnapshotCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

type ActionStatus = "effective" | "diminishing" | "late";

interface ContainmentAction {
  name: string;
  status: ActionStatus;
  advice: string;
}

function ContainmentSlider({
  config,
  timeline,
  metrics
}: {
  config: SimulationConfig;
  timeline: SimulationDay[];
  metrics: SimulationMetrics;
}) {
  const [day, setDay] = useState(0);
  const snap = timeline[day] ?? timeline[0];
  const { disease, nodes, seedNodeId, seedCases } = config;
  const totalPop = nodes.reduce((s, n) => s + n.population, 0);
  const infectRate = snap.aggregate.I / totalPop;
  const seedNodeName = nodes.find((n) => n.id === seedNodeId)?.name ?? seedNodeId;
  const maxDay = timeline.length - 1;

  const phase =
    day < disease.incubationDays
      ? "Early Detection"
      : day < metrics.peakInfectedDay * 0.55
      ? "Growth"
      : day < metrics.peakInfectedDay * 1.1
      ? "Peak"
      : day < metrics.peakInfectedDay * 1.6
      ? "Declining"
      : "Recovery";

  const phaseStyle =
    phase === "Early Detection"
      ? styles.phaseEarly
      : phase === "Growth"
      ? styles.phaseGrowth
      : phase === "Peak"
      ? styles.phasePeak
      : phase === "Declining"
      ? styles.phaseDeclining
      : styles.phaseRecovery;

  function actionStatus(effective: boolean, diminishing: boolean): ActionStatus {
    if (effective) return "effective";
    if (diminishing) return "diminishing";
    return "late";
  }

  const actions: ContainmentAction[] = [
    {
      name: "Isolate origin node",
      status: actionStatus(
        day < disease.incubationDays,
        day < disease.incubationDays * 2.5
      ),
      advice:
        day < disease.incubationDays
          ? `Close ${seedNodeName} now. Spread has not yet seeded secondary nodes — this is the highest-leverage action available.`
          : day < disease.incubationDays * 2.5
          ? `Partial value remains. Restrict but monitor — test all travelers out of ${seedNodeName}. Community chains are forming.`
          : `Community spread is established across multiple nodes. Origin closure no longer contains the outbreak.`
    },
    {
      name: "Contact tracing",
      status: actionStatus(infectRate < 0.005, infectRate < 0.02),
      advice:
        infectRate < 0.005
          ? `Case counts are manageable (${formatCompact(snap.aggregate.I)} infectious). Trace aggressively — each broken chain matters at this scale.`
          : infectRate < 0.02
          ? `Tracing is becoming overwhelmed. Focus on high-risk nodes (transit, schools). Abandon breadth, prioritize depth.`
          : `Too many active chains to trace individually. Shift resources to population-level measures.`
    },
    {
      name: "Travel restrictions",
      status: actionStatus(
        day < metrics.peakInfectedDay * 0.4,
        day < metrics.peakInfectedDay * 1.1
      ),
      advice:
        day < metrics.peakInfectedDay * 0.4
          ? `High impact now. Cutting inter-node flow prevents seeding of clean districts. Target the ${Math.round(disease.r0 * 10) / 10}x R₀ multiplier in transit hubs.`
          : day < metrics.peakInfectedDay * 1.1
          ? `Still effective at preventing cross-node surge. Keep restriction above 50% through Day ${metrics.peakInfectedDay}.`
          : `Peak is past. Maintain 30–40% restriction until infectious count drops below ${formatCompact(seedCases * 5)} to prevent rebound.`
    },
    {
      name: "School & venue closures",
      status: actionStatus(
        day >= Math.round(disease.incubationDays) && day < metrics.peakInfectedDay * 0.7,
        day < metrics.peakInfectedDay * 1.15
      ),
      advice:
        day < disease.incubationDays
          ? `Not yet critical. Prepare closure orders but wait for confirmed community spread before triggering — economic cost is high.`
          : day < metrics.peakInfectedDay * 0.7
          ? `Close schools and high-density venues now. Dense enclosed spaces are the primary amplifier at R₀ ${disease.r0.toFixed(1)}.`
          : day < metrics.peakInfectedDay * 1.15
          ? `Closures are limiting peak height. Hold through Day ${metrics.peakInfectedDay} before staged reopening.`
          : `Begin reopening low-risk residential areas first. Monitor for ${Math.round(disease.incubationDays * 2)}-day uptick window after each step.`
    },
    {
      name: "Isolation compliance",
      status: actionStatus(
        day < metrics.peakInfectedDay,
        day < metrics.peakInfectedDay * 1.4
      ),
      advice:
        day < metrics.peakInfectedDay
          ? `Every 10% compliance increase cuts effective R by ~${(disease.r0 * 0.07).toFixed(2)}. Push above 70% before Day ${metrics.peakInfectedDay} to avoid full peak.`
          : day < metrics.peakInfectedDay * 1.4
          ? `Peak passed but R may still exceed 1. Hold compliance — secondary waves form within ${Math.round(disease.infectiousDays * 3)} days of premature lift.`
          : `Compliance can be gradually relaxed. Keep at 40%+ until daily new infections fall for 14 consecutive days.`
    },
    {
      name: "Hospital surge preparation",
      status: actionStatus(
        metrics.firstNodeHospitalBreachDay !== null && day < metrics.firstNodeHospitalBreachDay - 10,
        metrics.firstNodeHospitalBreachDay !== null && day < metrics.firstNodeHospitalBreachDay + 5
      ),
      advice:
        metrics.firstNodeHospitalBreachDay === null
          ? `No hospital breach projected in this run. Current pSevere (${(disease.pSevere * 100).toFixed(1)}%) stays within capacity.`
          : day < metrics.firstNodeHospitalBreachDay - 10
          ? `Breach projected Day ${metrics.firstNodeHospitalBreachDay}. You have ${metrics.firstNodeHospitalBreachDay - day} days — pre-position surge beds, redirect elective admissions, staff up now.`
          : day < metrics.firstNodeHospitalBreachDay + 5
          ? `Breach imminent or active. Activate overflow protocols. ${(disease.pSevere * 100).toFixed(1)}% severe rate means ${formatCompact(Math.round(snap.aggregate.I * disease.pSevere))} current patients need beds.`
          : `Breach window is passing. Begin standing down surge capacity gradually — keep ${Math.round(disease.pSevere * 100 * 1.3)}% buffer until Day ${metrics.peakInfectedDay + 14}.`
    }
  ];

  return (
    <div className={styles.infoCard}>
      <p className={styles.kicker}>Containment</p>
      <h2 className={styles.infoHeading}>What can still be done</h2>

      <div className={styles.sliderHeader}>
        <div className={styles.sliderDayLabel}>
          <span className={`${styles.phaseTag} ${phaseStyle}`}>{phase}</span>
          <span className={styles.sliderDay}>Day {day}</span>
        </div>
        <div className={styles.sliderStats}>
          <span><strong>{formatCompact(snap.aggregate.I)}</strong> infectious</span>
          <span><strong>{formatCompact(snap.aggregate.hospitalized)}</strong> hospitalized</span>
          <span><strong>{formatCompact(snap.aggregate.D)}</strong> deaths</span>
        </div>
      </div>

      <div className={styles.sliderTrackWrap}>
        <input
          type="range"
          min={0}
          max={maxDay}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className={styles.sliderInput}
          aria-label="Select day"
        />
        <div className={styles.sliderEdgeLabels}>
          <span>Day 0</span>
          <span>Day {maxDay}</span>
        </div>
        <div className={styles.sliderPinsRow}>
          {metrics.firstNodeHospitalBreachDay !== null && (
            <span
              className={styles.sliderMarkerPin}
              style={{ left: `${(metrics.firstNodeHospitalBreachDay / maxDay) * 100}%` }}
              title={`Hospital breach Day ${metrics.firstNodeHospitalBreachDay}`}
            >
              ⚠ {metrics.firstNodeHospitalBreachDay}
            </span>
          )}
          <span
            className={styles.sliderMarkerPin}
            style={{ left: `${(metrics.peakInfectedDay / maxDay) * 100}%` }}
            title={`Peak Day ${metrics.peakInfectedDay}`}
          >
            ↑ {metrics.peakInfectedDay}
          </span>
        </div>
      </div>

      <ul className={styles.actionList}>
        {actions.map((action) => (
          <li key={action.name} className={`${styles.actionRow} ${styles[`action--${action.status}`]}`}>
            <div className={styles.actionMeta}>
              <span className={`${styles.statusDot} ${styles[`dot--${action.status}`]}`} />
              <strong>{action.name}</strong>
              <span className={styles.statusLabel}>
                {action.status === "effective" ? "Effective" : action.status === "diminishing" ? "Diminishing" : "Too late"}
              </span>
            </div>
            <p>{action.advice}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
