# 08 — `components/advisor/advisor-shell.tsx`

## Goal
Restyle the chat surface and context sidebar. All chat logic (the `useState`, `fetch`, streaming reader, error handling) stays as is. Same file path, same default export.

## Top-of-file utility class strings (replace existing)

```ts
const shellClass = "w-full max-w-[1320px] mx-auto px-12 pb-16 bg-[--color-bg] max-[700px]:px-5";

const topbarClass = "flex min-h-[60px] items-center justify-between border-b border-[--color-hair] py-5 max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3";

const brandClass = "inline-flex items-center gap-[10px] text-[17px] font-medium tracking-[-0.01em]";
const brandMarkClass = "grid h-7 w-7 place-items-center rounded-full bg-[--color-paper-deep] text-[--color-accent]";
const navClass = "inline-flex items-center gap-7 text-[13.5px] text-[--color-body]";
const navLinkClass = "text-[--color-body] hover:text-[--color-ink] transition-colors";
const navLinkActiveClass = "text-[--color-ink] font-medium";

const headerGridClass = "grid grid-cols-[minmax(0,1fr)_minmax(360px,460px)] items-end gap-10 border-b border-[--color-hair] py-12 max-[980px]:grid-cols-1 max-[700px]:gap-5 max-[700px]:py-8";

const kickerClass = "m-0 mb-3 text-[12.5px] font-medium text-[--color-accent]";
const subheadClass = "mt-3 mb-0 text-[14px] text-[--color-muted]";

const labelTextClass = "text-[12px] font-medium text-[--color-muted]";

const inlineErrorClass = "m-0 rounded-[6px] border border-[--color-alarm]/40 bg-[--color-alarm-soft] px-3 py-2 text-[12px] text-[--color-alarm]";
```

## Top bar
Same pattern as the dashboard top bar (`05_landing_shell.md` and `06_dashboard_shell.md`). Plain text nav, sentence case, no border-framed pill nav. Active link: `Advisor`.

## Header section

```tsx
<section className={headerGridClass}>
  <div>
    <p className={kickerClass}>Advisor</p>
    <h1>Ask the advisor</h1>
    <p className={subheadClass}>
      Grounded in the current simulation snapshot · {config.scenario} · Day {current.day} · {config.city.name}
    </p>
  </div>
  <div className="grid grid-cols-2 rounded-[12px] border border-[--color-hair] overflow-hidden max-[700px]:grid-cols-1">
    <SnapshotCell label="Infectious" value={formatCompact(current.aggregate.I)} />
    <SnapshotCell label="Hospitalized" value={formatCompact(current.aggregate.hospitalized)} />
    <SnapshotCell label="Peak day" value={`Day ${metrics.peakInfectedDay}`} />
    <SnapshotCell label="Deaths" value={formatCompact(metrics.totalDeaths)} />
  </div>
</section>
```

### SnapshotCell

```tsx
function SnapshotCell({ label, value }) {
  return (
    <div className="min-w-0 border-r border-b border-[--color-hair] bg-[--color-paper] px-5 py-4 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 max-[700px]:border-r-0 max-[700px]:border-b max-[700px]:last:border-b-0">
      <span className={labelTextClass}>{label}</span>
      <strong className="mt-1.5 block text-[22px] font-medium leading-[1] tracking-[-0.02em] tabular-nums text-[--color-ink]">
        {value}
      </strong>
    </div>
  );
}
```
- Value color: `--color-ink` (was `text-red`).
- Font: Inter (was Archivo Black).

## Chat surface

```tsx
<section className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6 pt-8 max-[980px]:grid-cols-1">
  <div className="flex min-h-[620px] flex-col rounded-[12px] border border-[--color-hair] bg-[--color-paper]">
    <div className="grid flex-1 gap-4 overflow-y-auto p-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>

    <form className="m-0 grid gap-2.5 border-t border-[--color-hair] px-6 py-5" onSubmit={handleSubmit}>
      <label className={labelTextClass} htmlFor="advisor-message">Your message</label>
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

  <aside className="rounded-[12px] border border-[--color-hair] bg-[--color-paper] overflow-hidden">…</aside>
</section>
```

### MessageBubble (new sub-component, replaces inline `<article>` markup)

```tsx
function MessageBubble({ message }: { message: LocalMessage }) {
  const isUser = message.role === "user";
  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3">
      <span
        className="grid h-7 w-7 place-items-center rounded-full"
        style={isUser
          ? { background: "var(--color-ink)", color: "var(--color-bg)" }
          : { background: "var(--color-accent-soft)", color: "var(--color-accent)" }
        }
      >
        {isUser ? <UserRound size={14} strokeWidth={2} /> : <Bot size={14} strokeWidth={2} />}
      </span>
      <p
        className="m-0 rounded-[10px] px-4 py-3 text-[14px] leading-[1.6]"
        style={isUser
          ? { background: "var(--color-ink)", color: "var(--color-bg)" }
          : { background: "var(--color-paper-soft)", color: "var(--color-body)" }
        }
      >
        {message.content || (
          <span className="inline-flex items-center gap-1.5 text-[--color-muted]">
            Thinking
            <span className="inline-flex gap-0.5">
              <span className="inline-block h-1 w-1 rounded-full bg-current animate-pulse" />
              <span className="inline-block h-1 w-1 rounded-full bg-current animate-pulse [animation-delay:120ms]" />
              <span className="inline-block h-1 w-1 rounded-full bg-current animate-pulse [animation-delay:240ms]" />
            </span>
          </span>
        )}
      </p>
    </article>
  );
}
```
- User bubble: dark ink on bg-white text. (Was `bg-ink text-[#fffefa]` mono — that's actually fine; just kill `border-2 border-ink`.)
- Assistant bubble: `--color-paper-soft` background, `--color-body` text, Inter (not mono). The original used mono for chat which was harsh and slowed reading.
- Avatar: 28px circles in `--color-ink` (user) and `--color-accent-soft` (assistant). The user avatar was previously `bg-red`; that's gone.
- The "Thinking" indicator gets three little dots that pulse — much quieter than the original "Thinking" plain text fallback.

## Context aside

```tsx
<aside className="rounded-[12px] border border-[--color-hair] bg-[--color-paper] overflow-hidden">
  <div className="flex items-center justify-between gap-4 border-b border-[--color-hair] px-5 py-4">
    <p className={kickerClass}>Context</p>
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1.5 rounded-[8px] border border-[--color-hair] px-3 py-1.5 text-[12px] text-[--color-body] hover:bg-[--color-paper-soft] hover:text-[--color-ink] transition-colors"
    >
      Dashboard
      <ArrowUpRight size={13} strokeWidth={2} />
    </Link>
  </div>

  <dl className="m-0 p-0">
    {[
      ["Current infectious", formatNumber(current.aggregate.I)],
      ["Current deaths", formatNumber(current.aggregate.D)],
      ["Hospital breach", metrics.firstNodeHospitalBreachDay === null ? "None" : `Day ${metrics.firstNodeHospitalBreachDay}`],
      ["Transmission scale", `${config.interventions.transmissionRate.toFixed(2)}×`],
      ["Isolation", `${Math.round(config.interventions.isolationCompliance * 100)}%`],
      ["Travel restriction", `${Math.round(config.interventions.travelRestriction * 100)}%`],
    ].map(([label, value], i, arr) => (
      <div
        key={label}
        className={`flex items-baseline justify-between gap-4 px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-[--color-hair]" : ""}`}
      >
        <dt className={labelTextClass}>{label}</dt>
        <dd className="m-0 text-[13.5px] font-medium tabular-nums text-[--color-ink]">{value}</dd>
      </div>
    ))}
  </dl>

  {/* Quiet advisory note — replaces the previous bg-red banner */}
  <p className="m-0 border-t border-[--color-hair] bg-[--color-paper-soft] px-5 py-3.5 text-[12px] italic leading-[1.5] text-[--color-muted]">
    Advice is generated text. Model state changes only through the dashboard controls.
  </p>
</aside>
```

- All `<dd>` values: `--color-ink` (was `text-red`).
- The bottom advisory note: was a red panel with an `AlertTriangle` icon and uppercase mono text. Now: pale paper-soft inset, italic Inter, `--color-muted`. The information is still there, it just doesn't pretend the disclaimer is an emergency.
- Drop the `AlertTriangle` import if it's no longer used elsewhere in the file.

## Deletions checklist
- [ ] `Activity` (was the brand icon) — replace with the pulse SVG glyph used in the dashboard topbar.
- [ ] `AlertTriangle` — if not used after the footer rewrite, remove the import.
- [ ] All `bg-red` / `text-red` / `border-red` in this file.
- [ ] All `text-transform: uppercase` and `tracking-[0.14em]` patterns on labels and dd values.
- [ ] `font-display` class on `<h1>` — the new base CSS handles h1 with Inter 500.
- [ ] `font-mono` on `<p>` message bodies — Inter reads better for chat. Keep mono on `<dd>` numeric values only.
- [ ] `border-2 border-ink` on the chat container and aside — `rounded-[12px] border border-[--color-hair]` instead.
