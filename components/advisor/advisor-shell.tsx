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
import type { AdvisorChatMessage } from "@/lib/ai/schemas";
import { formatCompact, formatNumber } from "@/lib/format";
import { useSimStore } from "@/lib/store/sim-store";
import styles from "./advisor.module.css";

type LocalMessage = AdvisorChatMessage & { id: string };

export function AdvisorShell() {
  const { config, timeline, currentDay } = useSimStore();
  const metrics = useMemo(
    () => calculateMetrics(timeline, config.nodes),
    [timeline, config.nodes]
  );
  const current = timeline[currentDay] ?? timeline[0];
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I am reading the live Epipulse snapshot. Ask about timing, hospital load, closure tradeoffs, or which intervention to move first."
    }
  ]);
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

          <div className={styles.alertBox}>
            <AlertTriangle size={17} strokeWidth={2} />
            <span>
              Advice is generated text. Model state changes only through the
              dashboard controls.
            </span>
          </div>
        </aside>
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
