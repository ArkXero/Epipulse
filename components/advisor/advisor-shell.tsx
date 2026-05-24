"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, Bot, Send, UserRound } from "lucide-react";
import { calculateMetrics } from "@/lib/model";
import type { AdvisorChatMessage } from "@/lib/ai/schemas";
import { formatCompact, formatNumber } from "@/lib/format";
import { useSimStore } from "@/lib/store/sim-store";

type LocalMessage = AdvisorChatMessage & { id: string };

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
const inlineErrorClass =
  "m-0 rounded-[6px] border border-[--color-alarm]/40 bg-[--color-alarm-soft] px-3 py-2 text-[12px] text-[--color-alarm]";

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
        <div className="flex min-h-[620px] flex-col rounded-[12px] border border-[--color-hair] bg-[--color-paper]">
          <div className="grid flex-1 gap-4 overflow-y-auto p-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          <form
            className="m-0 grid gap-2.5 border-t border-[--color-hair] px-6 py-5"
            onSubmit={handleSubmit}
          >
            <label className={labelTextClass} htmlFor="advisor-message">
              Your message
            </label>
            <textarea
              className="min-h-24 w-full resize-y rounded-[8px] border border-[--color-hair] bg-[--color-bg] p-3 text-[14px] leading-[1.5] text-[--color-ink] focus:border-[--color-accent]"
              id="advisor-message"
              value={input}
              rows={3}
              placeholder={`Ask about day ${current.day}…`}
              onChange={(event) => setInput(event.target.value)}
            />
            {error ? <p className={inlineErrorClass}>{error}</p> : null}
            <button
              className="inline-flex min-h-10 min-w-[140px] items-center justify-center justify-self-end gap-2 rounded-full bg-[--color-accent] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[--color-accent-deep] disabled:cursor-not-allowed disabled:opacity-55"
              type="submit"
              disabled={isStreaming}
            >
              {isStreaming ? "Sending…" : "Send"}
              <Send size={14} strokeWidth={2} />
            </button>
          </form>
        </div>

        <aside className="overflow-hidden rounded-[12px] border border-[--color-hair] bg-[--color-paper]">
          <div className="flex items-center justify-between gap-4 border-b border-[--color-hair] px-5 py-4">
            <p className={kickerClass}>Context</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[--color-hair] px-3 py-1.5 text-[12px] text-[--color-body] transition-colors hover:bg-[--color-paper-soft] hover:text-[--color-ink]"
            >
              Dashboard
              <ArrowUpRight size={13} strokeWidth={2} />
            </Link>
          </div>

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

          <p className="m-0 border-t border-[--color-hair] bg-[--color-paper-soft] px-5 py-3.5 text-[12px] italic leading-[1.5] text-[--color-muted]">
            Advice is generated text. Model state changes only through the
            dashboard controls.
          </p>
        </aside>
      </section>
    </main>
  );
}

function MessageBubble({ message }: { message: LocalMessage }) {
  const isUser = message.role === "user";

  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3">
      <span
        className="grid h-7 w-7 place-items-center rounded-full"
        style={
          isUser
            ? { background: "var(--color-ink)", color: "var(--color-bg)" }
            : {
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)"
              }
        }
      >
        {isUser ? (
          <UserRound size={14} strokeWidth={2} />
        ) : (
          <Bot size={14} strokeWidth={2} />
        )}
      </span>
      <p
        className="m-0 rounded-[10px] px-4 py-3 text-[14px] leading-[1.6]"
        style={
          isUser
            ? { background: "var(--color-ink)", color: "var(--color-bg)" }
            : {
                background: "var(--color-paper-soft)",
                color: "var(--color-body)"
              }
        }
      >
        {message.content || (
          <span className="inline-flex items-center gap-1.5 text-[--color-muted]">
            Thinking
            <span className="inline-flex gap-0.5">
              <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-current" />
              <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
              <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
            </span>
          </span>
        )}
      </p>
    </article>
  );
}

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
