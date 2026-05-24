# Epipulse

Epipulse is a Next.js App Router MVP for running deterministic city-scale outbreak scenarios. The epidemic math lives in `/lib/model`; Anthropic Claude is only used for structured scenario inputs, short narration, and advisor text.

## Stack

- Next.js, React, TypeScript, App Router
- Zustand for shared simulation state
- Recharts for SEIR/D curves
- Leaflet and React Leaflet for the client-only map
- AI SDK with Anthropic Claude for server-only API routes
- Vitest for model and schema tests

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `ANTHROPIC_API_KEY` in `.env.local` to enable scenario generation, narration, and advisor responses. `ANTHROPIC_MODEL` defaults to `claude-sonnet-4-6`.

The app still works without an API key: `/api/scenario`, `/api/narrate`, and `/api/advisor` return deterministic preset or canned fallback output.

## Scripts

```bash
npm test
npm run typecheck
npm run build
npm run lint
```

## Demo Flow

1. Open `/` and load the Denver preset.
2. Press play and watch the aggregate curve and map markers change over time.
3. Lower transmission or raise isolation and confirm the timeline recomputes immediately.
4. Close the airport or school nodes and compare peak infections and hospital breach timing.
5. Generate a scenario with: `A novel respiratory virus emerges in Denver in winter.`
6. Open `/advisor` and ask about the current day. The response uses the live simulation snapshot.

## Model Notes

- The network model uses floating-point SEIR compartments internally and rounds only for display.
- Mobility is generated from node populations and haversine distances; AI output is never allowed to provide a mobility matrix.
- Open nodes normalize to 8% daily outbound mobility before travel restriction.
- Isolation reduces infectious mobility and local contact by `(1 - isolationCompliance)`.
- Closed nodes have zero inbound/outbound mobility and a near-zero contact multiplier.
- Airports add external importation by transferring up to `0.25` susceptible people per day into exposed while open.

## API Routes

- `POST /api/scenario`: `{ prompt } -> ScenarioConfig`
- `POST /api/narrate`: `{ config, day, previousDay?, metrics } -> { report }`
- `POST /api/advisor`: streamed text response for `{ messages, config, currentDay, metrics }`
- `POST /api/advisor/suggestions`: structured suggested intervention changes

Hope you enjoy the project!
