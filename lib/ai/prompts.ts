import type {
  ScenarioConfig,
  SimulationDay,
  SimulationMetrics
} from "@/lib/model";
import type { AdvisorChatMessage } from "./schemas";

export const scenarioSystemPrompt = [
  "You generate bounded outbreak scenario inputs for Epipulse.",
  "Return only the structured object requested by the schema.",
  "Never include mobility matrices or time-series results.",
  "Use 5 to 9 nodes unless the prompt clearly needs fewer.",
  "Keep all nodes geographically close to the city center and use stable kebab-case ids.",
  "Use plausible but conservative disease values for a respiratory illness."
].join(" ");

export function buildScenarioPrompt(prompt: string) {
  return [
    `User scenario: ${prompt}`,
    "Create a city-scale scenario with one seed node and realistic populations.",
    "Include at most 15 nodes. Hospitals should have capacity; other nodes may have zero or low capacity."
  ].join("\n");
}

export function buildNarrationPrompt({
  config,
  day,
  previousDay,
  metrics
}: {
  config: ScenarioConfig;
  day: SimulationDay;
  previousDay?: SimulationDay;
  metrics: SimulationMetrics;
}) {
  const deltaI = previousDay
    ? day.aggregate.I - previousDay.aggregate.I
    : day.aggregate.I;

  return [
    "Write a concise 2 to 3 sentence incident report.",
    "Mention the live simulation numbers and avoid claiming model uncertainty beyond the deterministic setup.",
    `Scenario: ${config.scenario}`,
    `City: ${config.city.name}`,
    `Day: ${day.day}`,
    `Infectious: ${Math.round(day.aggregate.I)}`,
    `Infectious change from previous day: ${Math.round(deltaI)}`,
    `Hospitalized: ${Math.round(day.aggregate.hospitalized)}`,
    `Deaths: ${Math.round(day.aggregate.D)}`,
    `Peak infected: ${Math.round(metrics.peakInfected)} on day ${metrics.peakInfectedDay}`,
    `First hospital breach day: ${metrics.firstNodeHospitalBreachDay ?? "none"}`
  ].join("\n");
}

export const advisorSystemPrompt = [
  "You are an incident commander advising a public-health operations team.",
  "Base every recommendation on the provided deterministic Epipulse snapshot.",
  "Do not invent new simulation results, do not change app state, and do not request private data.",
  "Be specific about tradeoffs across transmission, isolation, travel, closures, hospitals, and timing.",
  "Keep answers short, direct, and operational."
].join(" ");

export function buildAdvisorPrompt({
  messages,
  config,
  currentDay,
  metrics
}: {
  messages: AdvisorChatMessage[];
  config: ScenarioConfig;
  currentDay: SimulationDay;
  metrics: SimulationMetrics;
}) {
  const latestQuestion = messages[messages.length - 1]?.content ?? "";

  return [
    "Current Epipulse snapshot:",
    `Scenario: ${config.scenario}`,
    `City: ${config.city.name}`,
    `Disease: ${config.disease.name}, R0 ${config.disease.r0}, CFR ${config.disease.cfr}`,
    `Day ${currentDay.day}: S ${Math.round(currentDay.aggregate.S)}, E ${Math.round(currentDay.aggregate.E)}, I ${Math.round(currentDay.aggregate.I)}, R ${Math.round(currentDay.aggregate.R)}, D ${Math.round(currentDay.aggregate.D)}, hospitalized ${Math.round(currentDay.aggregate.hospitalized)}`,
    `Peak infected: ${Math.round(metrics.peakInfected)} on day ${metrics.peakInfectedDay}`,
    `Total deaths by horizon: ${Math.round(metrics.totalDeaths)}`,
    `First node hospital breach: ${metrics.firstHospitalBreachNodeId ?? "none"} on day ${metrics.firstNodeHospitalBreachDay ?? "none"}`,
    "Node snapshot:",
    ...currentDay.nodes.map((state) => {
      const node = config.nodes.find((candidate) => candidate.id === state.nodeId);
      return `${node?.name ?? state.nodeId}: I ${Math.round(state.I)}, hospitalized ${Math.round(state.hospitalized)}, deaths ${Math.round(state.D)}, capacity ${node?.hospitalCapacity ?? 0}`;
    }),
    "",
    "Conversation so far:",
    ...messages.map((message) => `${message.role}: ${message.content}`),
    "",
    `Answer the latest user question: ${latestQuestion}`
  ].join("\n");
}
