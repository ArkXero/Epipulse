# 10 — Copy & voice guide

Bio Quiet is a research instrument, not a war room. The voice is **plain, specific, present-tense, sentence-cased.** It explains what the model is doing and what the operator can change. It does not posture.

## Voice rules

1. **Sentence case headlines.** Never ALL CAPS. Even short labels and pills.
2. **Numbers do the talking.** Lead with a real value where possible. "3.6k infectious today" beats "live telemetry stream."
3. **No war metaphor.** "Outbreak," "spread," "transmission," "scenario," "intervention" — fine. "Command," "console," "combat," "deploy," "lock down," "engage" — out.
4. **No fake operational chrome.** No "Unit / EP-001," no "Rev 2.6," no run IDs unless the system actually has them.
5. **Plain epidemiology.** Use the actual terms: SEIR, R₀, infectious, exposed, hospital capacity, attack rate. Don't decorate them ("aggregate telemetry," "epidemic intelligence"). The audience understands the field.
6. **Mention the model's honesty, don't shout it.** The fact that AI doesn't touch the dynamics is a credibility note in a footer, not a hero line.
7. **One emphasis per sentence.** Italics on Newsreader or `--color-accent` on Inter — never both, never red, never bold + italic.

## Words to grep for and remove

Search the codebase for these substrings and replace per the table below.

| Old | Replace with |
|---|---|
| `OUTBREAK COMMAND CONSOLE` | `outbreak simulation` |
| `Outbreak Command Console` | `Outbreak simulation` |
| `EPIPULSE / NETWORK SEIR COMMAND` | `Epipulse — outbreak simulation` |
| `Command Console` | `Dashboard` (when it's the dashboard) or `Epipulse` (when it's the product) |
| `UNIT / EP-001` | *delete* |
| `REV 2.6` | *delete* |
| `LIVE TELEMETRY` | `Model running` (paired with a `.dot` indicator) |
| `[ DELIVERY SYSTEMS ]` | `What the model does` (section eyebrow) |
| `[ OPERATIONAL FLOW ]` | `How it works` |
| `[ TECHNICAL DOSSIER ]` | `Under the hood` |
| `[ NO ACCOUNT / NO TELEMETRY / RUNS IN BROWSER ]` | `Runs in your browser. No account, no tracking.` |
| `RUN THE OUTBREAK.` | `Run a scenario` |
| `The math never lies.` | *delete* — the value prop now lives in a quiet line below the hero: "Deterministic SEIR. AI is used only for scenario text and advisor notes, never for the dynamics." |
| `Outbreak / command / console.` (hero) | `A respiratory virus, simulated.` (see landing spec) |
| `Network SEIR command view` (dashboard kicker) | `Dashboard` (or omit entirely — the page title carries it) |
| `INCIDENT NOTE` / `Explain this` (narration panel) | `Today's note` |
| `Operational guidance from the live run` (advisor) | `Ask the advisor` |

## Replacement copy — by surface

### Page titles & metadata
- `<title>` — `Epipulse — outbreak simulation`
- `<meta description>` — `A deterministic, browser-based SEIR simulator for city-scale outbreaks. Move interventions, watch hospital capacity, ask the advisor.`

### Landing — full new copy

**Eyebrow (above headline)**
> Denver · New York · DC-MD-VA · island scenario

**Headline (Newsreader, sentence case)**
> A respiratory virus, simulated.

**Sub-deck**
> Epipulse runs city-scale, deterministic SEIR outbreaks in your browser. Move interventions, watch hospital capacity, and ask an advisor what to do next.

**Primary CTA**
> Open the dashboard

**Secondary CTA**
> Read the methods

**"What the model does" — six modules (replacing "DELIVERY SYSTEMS")**

01. **Network SEIR.** Deterministic compartment model across heterogeneous city nodes. Audited against analytic solutions.
02. **Mobility graph.** Movement between airports, transit hubs, schools, hospitals, downtown, and residential zones — weighted by population and distance.
03. **Intervention levers.** Transmission scaling, isolation compliance, travel restriction, node closure. The timeline recomputes on every change.
04. **Hospital breach.** Per-node capacity vs. hospitalized load. The first breach day is surfaced as a single, persistent alert.
05. **Claude advisor.** A short briefing from Anthropic Claude grounded in the current simulation snapshot. Text only — the advisor never modifies the model.
06. **Scenario generation.** Structured prompts produce city presets. Without an API key, the deterministic fallback preset still runs.

**"How it works" — operational flow (replacing the previous numbered chrome)**

01. **Configure.** Pick a preset or generate one from a prompt.
02. **Simulate.** 120 days of per-node SEIR integration, recomputed on every change.
03. **Intervene.** Close nodes, raise isolation, restrict travel. Compare timelines.
04. **Brief.** Ask the advisor what to look at next.

**"Under the hood" — table (replacing TECHNICAL DOSSIER)**

| Layer | Library | What it does |
|---|---|---|
| Runtime | Next.js 16, React 19 | App Router. Server-only AI routes. Client-side simulation. |
| Model | `lib/model` | Floating-point SEIR compartments. Mobility from population × distance. |
| State | Zustand | Shared simulation store. Reactive recompute on intervention change. |
| Charts | Recharts | Aggregate SEIR-D area. Per-node infected and hospitalized lines. |
| Map | Leaflet | City-scale node placement. Marker size and tint reflect infectious load. |
| AI | Anthropic Claude | Scenario generation, narration, advisor. Output is text only. |
| Tests | Vitest | Model invariants. Schema validation. Deterministic regression. |

**Footer line (replacing "STATUS NOMINAL," "DETERMINISTIC / OPEN MODEL / NO PHI")**
> Epipulse · open-source SEIR simulation · 2026

### Dashboard

- Topbar brand: `Epipulse` (no chrome around it)
- Nav: `Home · Dashboard · Advisor` (no all-caps)
- Page eyebrow above scenario title: just the scenario summary, e.g. *"Denver, Colorado · Day 42 of 120"*
- Page H1: the scenario string from config (e.g. *"Winter respiratory outbreak in Denver"*)
- Scenario sub-deck: *"R₀ {disease.r0} · {nodes.length} nodes · {disease.name}"*
- Metric strip labels: `Peak infectious / Projected deaths / Hospital breach / Population modelled`
- Aggregate chart H2: `Daily compartments` &nbsp;·&nbsp; meta: `Day 0 — 120`
- Map H2: `Where infection sits on day {N}` &nbsp;·&nbsp; meta: `{nodes.length} city nodes`
- Intervention card H3: `Interventions` (was `LEVERS / INTERVENTIONS`)
- Slider descriptions: keep the existing prose, drop the all-caps treatment.
- Node detail H3: `Selected node`
- Narration card H3: `Today's note` (was `INCIDENT NOTE / Explain this`)
- Narration button: `Regenerate` (was the sparkles icon button labelled "Generate incident note")

### Advisor

- Page eyebrow: `Advisor`
- Page H1: `Ask the advisor`
- Sub-deck: `Grounded in the current simulation snapshot.`
- Welcome message (assistant's first bubble): *"I'm reading the live Epipulse snapshot. Ask about timing, hospital load, closure tradeoffs, or which intervention to move first."* (existing copy — fine, lowercase 'i'm' becomes "I'm")
- Input placeholder: `Ask about day {currentDay}…`
- Submit button: `Send`
- Context aside H3: `Context`
- Footer note (replaces the alert-triangle red banner): *"Advice is generated text. Model state changes only through the dashboard controls."* — render as a quiet `--color-muted` italic line, not a red banner.

## Punctuation & numbers

- R-naught: `R₀` (use the subscript glyph, not `R0`).
- Days: `Day 42 of 120`, not `D42` or `DAY 42`.
- Big numbers: `293k`, `3.6k`, `15,420` (use `formatCompact` for headline; `formatNumber` for body).
- Percents: `55%`, never `55.0%` unless precision matters.
- Multipliers: `0.70×` (use the multiplication sign U+00D7, not lowercase `x`).
- Em-dash for sentence breaks: `peak transmission today — 3.6k infectious` (the em-dash, not double hyphens).

---

Voice check: if a sentence would sound at home in *The Economist* or *Our World in Data*, it fits. If it would sound at home in a Tom Clancy thriller or a Plague Inc. trailer, rewrite it.
