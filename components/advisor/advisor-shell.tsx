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
import type { AdvisorChatMessage } from "@/lib/ai/schemas";
import { formatCompact, formatNumber } from "@/lib/format";
import { useSimStore } from "@/lib/store/sim-store";

type LocalMessage = AdvisorChatMessage & { id: string };
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
  const { config, timeline, currentDay } = useSimStore();
  const metrics = useMemo(
    () => calculateMetrics(timeline, config.nodes),
    [timeline, config.nodes]
  );
  const current = timeline[currentDay] ?? timeline[0];
  const abortRef = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I'm reading the live Epipulse snapshot. Ask about timing, hospital load, closure tradeoffs, or which intervention to move first."
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agentMessages = useMemo<AgentMessage[]>(
    () =>
      messages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: [{ type: "text", text: message.content }]
      })),
    [messages]
  );

  const handleSend = useCallback(
    async ({ content }: { role: "user"; content: string }) => {
      const trimmedInput = content.trim();

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
      const requestMessages = [...messages, userMessage];
      const nextMessages = [...requestMessages, assistantMessage];
      const controller = new AbortController();

      abortRef.current = controller;
      setMessages(nextMessages);
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
          setMessages((currentMessages) =>
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
          setMessages((currentMessages) =>
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
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [config, current, isStreaming, messages, metrics]
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
  className
}: AgentChatProps) {
  const [draft, setDraft] = useState("");
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
