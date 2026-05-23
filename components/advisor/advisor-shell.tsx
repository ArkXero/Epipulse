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

type LocalMessage = AdvisorChatMessage & { id: string };

const shellClass = "w-full max-w-[1320px] mx-auto px-6 pb-16 bg-paper max-[700px]:px-4";
const topbarClass = "flex min-h-[60px] items-center justify-between border-b-2 border-ink py-4 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3";
const brandClass = "inline-flex items-center gap-[10px] font-display text-lg tracking-[-0.02em] uppercase";
const brandMarkClass = "grid h-8 w-8 place-items-center bg-ink text-[#fffefa]";
const navClass = "inline-flex items-center border-2 border-ink";
const navLinkClass = "inline-flex min-h-9 items-center border-r-2 border-ink px-4 font-mono text-[11px] font-bold tracking-[0.12em] text-ink uppercase transition-colors duration-100 last:border-r-0 hover:bg-ink hover:text-[#fffefa]";
const navLinkActiveClass = "inline-flex min-h-9 items-center border-r-2 border-ink bg-red px-4 font-mono text-[11px] font-bold tracking-[0.12em] text-[#fffefa] uppercase last:border-r-0";
const headerGridClass = "grid grid-cols-[minmax(0,1fr)_minmax(360px,520px)] items-end gap-9 border-b-2 border-ink py-12 pb-7 max-[980px]:grid-cols-1 max-[700px]:gap-[22px] max-[700px]:py-[30px] max-[700px]:pb-[22px]";
const kickerClass = "m-0 mb-[14px] font-mono text-[11px] font-bold tracking-[0.14em] text-red uppercase";
const subheadClass = "mt-4 mb-0 font-mono text-xs tracking-[0.06em] text-muted uppercase";
const labelTextClass = "font-mono text-[10px] font-bold tracking-[0.14em] text-muted uppercase";
const messageIconClass = "grid h-8 w-8 place-items-center bg-ink text-[#fffefa]";
const inlineErrorClass = "m-0 bg-red px-[10px] py-2 font-mono text-[11px] tracking-[0.08em] text-[#fffefa] uppercase";

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
          <Link className={navLinkClass} href="/dashboard">
            Dashboard
          </Link>
          <Link className={navLinkActiveClass} href="/advisor">
            Advisor
          </Link>
        </nav>
      </header>

      <section className={headerGridClass}>
        <div>
          <p className={kickerClass}>Advisor</p>
          <h1>Operational guidance from the live run</h1>
          <p className={subheadClass}>
            {config.scenario} · day {current.day} · {config.city.name}
          </p>
        </div>
        <div className="grid grid-cols-2 border-2 border-ink max-[700px]:grid-cols-1">
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

      <section className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 pt-6 max-[980px]:grid-cols-1">
        <div className="flex min-h-[620px] flex-col border-2 border-ink bg-panel">
          <div className="grid flex-1 gap-[14px] overflow-y-auto p-5">
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === "user"
                    ? "grid grid-cols-[32px_minmax(0,1fr)] items-start gap-3"
                    : "grid grid-cols-[32px_minmax(0,1fr)] items-start gap-3"
                }
              >
                <span className={message.role === "user" ? `${messageIconClass} bg-red` : messageIconClass}>
                  {message.role === "user" ? (
                    <UserRound size={16} strokeWidth={2} />
                  ) : (
                    <Bot size={16} strokeWidth={2} />
                  )}
                </span>
                <p
                  className={
                    message.role === "user"
                      ? "m-0 border-2 border-ink bg-ink p-[14px] font-mono text-[13px] leading-[1.6] text-[#fffefa]"
                      : "m-0 border-2 border-ink bg-paper-soft p-[14px] font-mono text-[13px] leading-[1.6] text-ink"
                  }
                >
                  {message.content || "Thinking"}
                </p>
              </article>
            ))}
          </div>

          <form className="m-0 grid gap-[10px] border-t-2 border-ink px-5 py-[18px] pb-5" onSubmit={handleSubmit}>
            <label className={labelTextClass} htmlFor="advisor-message">Message</label>
            <textarea
              className="min-h-24 w-full resize-y border-2 border-ink bg-paper p-3 font-mono text-[13px] leading-[1.5] text-ink focus:outline-2 focus:outline-red"
              id="advisor-message"
              value={input}
              rows={3}
              onChange={(event) => setInput(event.target.value)}
            />
            {error ? <p className={inlineErrorClass}>{error}</p> : null}
            <button
              className="inline-flex min-h-[42px] min-w-[140px] items-center justify-center justify-self-end gap-2 border-2 border-ink bg-ink px-4 font-mono text-xs font-bold tracking-[0.12em] text-[#fffefa] uppercase transition-colors duration-100 hover:border-red hover:bg-red disabled:cursor-not-allowed disabled:opacity-55"
              type="submit"
              disabled={isStreaming}
            >
              <Send size={16} strokeWidth={2} />
              {isStreaming ? "Sending" : "Send"}
            </button>
          </form>
        </div>

        <aside className="border-2 border-ink bg-panel">
          <div className="flex items-center justify-between gap-[14px] border-b-2 border-ink px-[18px] py-4">
            <p className={kickerClass}>Context</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 border-2 border-ink px-[10px] py-1.5 font-mono text-[11px] font-bold tracking-[0.12em] text-ink uppercase transition-colors duration-100 hover:border-red hover:bg-red hover:text-[#fffefa]"
            >
              Dashboard
              <ArrowUpRight size={15} strokeWidth={2} />
            </Link>
          </div>

          <dl className="m-0 grid gap-0 bg-panel p-0">
            <div className="flex justify-between gap-4 border-b border-ink px-[18px] py-[14px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
              <dt className={labelTextClass}>Current infectious</dt>
              <dd className="m-0 font-mono text-[13px] font-bold tracking-[0.04em] text-red uppercase">{formatNumber(current.aggregate.I)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-ink px-[18px] py-[14px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
              <dt className={labelTextClass}>Current deaths</dt>
              <dd className="m-0 font-mono text-[13px] font-bold tracking-[0.04em] text-red uppercase">{formatNumber(current.aggregate.D)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-ink px-[18px] py-[14px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
              <dt className={labelTextClass}>Hospital breach</dt>
              <dd className="m-0 font-mono text-[13px] font-bold tracking-[0.04em] text-red uppercase">
                {metrics.firstNodeHospitalBreachDay === null
                  ? "None"
                  : `Day ${metrics.firstNodeHospitalBreachDay}`}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-ink px-[18px] py-[14px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
              <dt className={labelTextClass}>Transmission scale</dt>
              <dd className="m-0 font-mono text-[13px] font-bold tracking-[0.04em] text-red uppercase">{config.interventions.transmissionRate.toFixed(2)}x</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-ink px-[18px] py-[14px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
              <dt className={labelTextClass}>Isolation</dt>
              <dd className="m-0 font-mono text-[13px] font-bold tracking-[0.04em] text-red uppercase">
                {Math.round(config.interventions.isolationCompliance * 100)}%
              </dd>
            </div>
            <div className="flex justify-between gap-4 px-[18px] py-[14px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1">
              <dt className={labelTextClass}>Travel restriction</dt>
              <dd className="m-0 font-mono text-[13px] font-bold tracking-[0.04em] text-red uppercase">
                {Math.round(config.interventions.travelRestriction * 100)}%
              </dd>
            </div>
          </dl>

          <div className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-[10px] border-t-2 border-ink bg-red px-4 py-[14px] font-mono text-[11px] leading-[1.5] tracking-[0.06em] text-[#fffefa] uppercase">
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
    <div className="min-w-0 border-r border-b border-ink bg-panel p-[18px] even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 max-[700px]:border-r-0 max-[700px]:border-b max-[700px]:last:border-b-0 max-[700px]:[&:nth-last-child(-n+2)]:border-b">
      <span className={labelTextClass}>{label}</span>
      <strong className="mt-2 block font-display text-[1.6rem] font-normal leading-[0.95] tracking-[-0.03em] text-red">{value}</strong>
    </div>
  );
}
