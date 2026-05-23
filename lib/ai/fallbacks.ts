import { getPresetKeyForPrompt, presets } from "@/lib/model";
import type {
  NodeType,
  PresetKey,
  ScenarioConfig,
  SimulationDay,
  SimulationMetrics
} from "@/lib/model";
import { formatNumber } from "@/lib/format";

export function fallbackScenario(
  prompt: string,
  fallbackPresetKey?: PresetKey
): ScenarioConfig {
  const promptPresetKey = getPresetKeyForPrompt(prompt);
  const presetKey = promptPresetKey ?? fallbackPresetKey ?? "denver";

  return applyPromptModifiers(structuredClone(presets[presetKey]), prompt);
}

function applyPromptModifiers(
  scenario: ScenarioConfig,
  prompt: string
): ScenarioConfig {
  const normalizedPrompt = prompt.toLowerCase();
  const trimmedPrompt = prompt.trim();
  let r0Multiplier = 1;
  let cfrMultiplier = 1;
  let severeMultiplier = 1;
  let seedMultiplier = 1;

  if (trimmedPrompt) {
    scenario.scenario =
      trimmedPrompt.length > 150
        ? `${trimmedPrompt.slice(0, 147)}...`
        : trimmedPrompt;
  }

  if (
    normalizedPrompt.includes("winter") ||
    normalizedPrompt.includes("cold")
  ) {
    r0Multiplier *= 1.12;
  }

  if (
    normalizedPrompt.includes("summer") ||
    normalizedPrompt.includes("outdoor")
  ) {
    r0Multiplier *= 0.88;
  }

  if (
    normalizedPrompt.includes("fast") ||
    normalizedPrompt.includes("rapid") ||
    normalizedPrompt.includes("explosive") ||
    normalizedPrompt.includes("high transmission")
  ) {
    r0Multiplier *= 1.22;
    seedMultiplier *= 1.2;
  }

  if (
    normalizedPrompt.includes("mild") ||
    normalizedPrompt.includes("slow") ||
    normalizedPrompt.includes("low transmission")
  ) {
    r0Multiplier *= 0.82;
    cfrMultiplier *= 0.75;
    severeMultiplier *= 0.82;
  }

  if (
    normalizedPrompt.includes("severe") ||
    normalizedPrompt.includes("deadly") ||
    normalizedPrompt.includes("high mortality")
  ) {
    cfrMultiplier *= 1.65;
    severeMultiplier *= 1.35;
  }

  scenario.disease = {
    ...scenario.disease,
    r0: clamp(roundTo(scenario.disease.r0 * r0Multiplier, 2), 0.6, 8),
    cfr: clamp(roundTo(scenario.disease.cfr * cfrMultiplier, 4), 0, 0.2),
    pSevere: clamp(
      roundTo(scenario.disease.pSevere * severeMultiplier, 4),
      0,
      0.6
    )
  };

  const seedType = getSeedTypeForPrompt(normalizedPrompt);

  if (seedType) {
    const seedNode = scenario.nodes.find((node) => node.type === seedType);

    if (seedNode) {
      scenario.seedNodeId = seedNode.id;
    }
  }

  const seedNodePopulation =
    scenario.nodes.find((node) => node.id === scenario.seedNodeId)
      ?.population ?? scenario.seedCases + 1;
  const maxSeedCases = Math.max(1, seedNodePopulation - 1);

  scenario.seedCases = Math.max(
    1,
    Math.min(Math.floor(scenario.seedCases * seedMultiplier), maxSeedCases)
  );

  return scenario;
}

function getSeedTypeForPrompt(prompt: string): NodeType | null {
  if (prompt.includes("airport") || prompt.includes("traveler")) {
    return "airport";
  }

  if (prompt.includes("school") || prompt.includes("campus")) {
    return "school";
  }

  if (prompt.includes("transit") || prompt.includes("commuter")) {
    return "transit";
  }

  if (prompt.includes("hospital") || prompt.includes("clinic")) {
    return "hospital";
  }

  if (prompt.includes("downtown") || prompt.includes("office")) {
    return "downtown";
  }

  if (prompt.includes("residential") || prompt.includes("household")) {
    return "residential";
  }

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, places: number) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

export function fallbackNarration({
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
  const delta = previousDay ? day.aggregate.I - previousDay.aggregate.I : 0;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const breach =
    metrics.firstNodeHospitalBreachDay === null
      ? "No node crosses hospital capacity in the current horizon."
      : `The first node capacity breach appears on day ${metrics.firstNodeHospitalBreachDay}.`;

  return `Day ${day.day} in ${config.city.name}: ${formatNumber(
    day.aggregate.I
  )} people are infectious, ${direction} ${formatNumber(
    Math.abs(delta)
  )} from the previous day. The model projects a peak of ${formatNumber(
    metrics.peakInfected
  )} infectious people on day ${metrics.peakInfectedDay}. ${breach}`;
}

export function fallbackAdvice({
  currentDay,
  metrics
}: {
  currentDay: SimulationDay;
  metrics: SimulationMetrics;
}) {
  const hospitalText =
    metrics.firstNodeHospitalBreachDay === null
      ? "hospital load remains below node capacity in this run"
      : `hospital capacity is first exceeded on day ${metrics.firstNodeHospitalBreachDay}`;

  return `Current day ${currentDay.day} shows ${formatNumber(
    currentDay.aggregate.I
  )} infectious people and ${formatNumber(
    currentDay.aggregate.hospitalized
  )} estimated hospitalizations. I would first reduce transmission and raise isolation compliance, then use travel restriction or node closures only where the map shows the steepest growth, because ${hospitalText}.`;
}
