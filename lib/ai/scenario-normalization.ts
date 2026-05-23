import {
  getPresetKeyForPrompt,
  presets
} from "@/lib/model";
import type { PresetKey, ScenarioConfig } from "@/lib/model";

export function normalizeScenarioForSimulation(
  scenario: ScenarioConfig,
  prompt: string,
  fallbackPresetKey?: PresetKey
): ScenarioConfig {
  const presetKey = getPresetKeyForPrompt(prompt) ?? fallbackPresetKey ?? "denver";
  const baseline = presets[presetKey];
  const normalized = structuredClone(scenario);
  const outbreakPrompt = isOutbreakPrompt(prompt);
  const severePrompt = isSeverePrompt(prompt);
  const minimumR0 = outbreakPrompt ? baseline.disease.r0 : 0.6;
  const maximumCfr = severePrompt ? 0.06 : 0.03;
  const maximumSevere = severePrompt ? 0.18 : 0.12;

  normalized.disease = {
    ...normalized.disease,
    r0: roundTo(clamp(normalized.disease.r0, minimumR0, 4.2), 2),
    incubationDays: roundTo(
      clamp(normalized.disease.incubationDays, 2, outbreakPrompt ? 6.5 : 14),
      1
    ),
    infectiousDays: roundTo(
      clamp(normalized.disease.infectiousDays, 3, 12),
      1
    ),
    cfr: roundTo(clamp(normalized.disease.cfr, 0.001, maximumCfr), 4),
    pSevere: roundTo(
      clamp(normalized.disease.pSevere, 0.01, maximumSevere),
      4
    )
  };

  if (outbreakPrompt) {
    const seedFloor = Math.max(1, baseline.seedCases);
    normalized.seedCases = Math.max(normalized.seedCases, seedFloor);
  }

  const seedNode = normalized.nodes.find(
    (node) => node.id === normalized.seedNodeId
  );

  if (!seedNode) {
    normalized.seedNodeId = normalized.nodes[0].id;
  }

  const seedPopulation =
    normalized.nodes.find((node) => node.id === normalized.seedNodeId)
      ?.population ?? normalized.seedCases + 1;

  normalized.seedCases = Math.min(
    Math.max(1, Math.round(normalized.seedCases)),
    Math.max(1, seedPopulation - 1)
  );

  return normalized;
}

function isOutbreakPrompt(prompt: string) {
  const normalizedPrompt = prompt.toLowerCase();

  return (
    normalizedPrompt.includes("outbreak") ||
    normalizedPrompt.includes("oubreak") ||
    normalizedPrompt.includes("epidemic") ||
    normalizedPrompt.includes("surge") ||
    normalizedPrompt.includes("wave") ||
    normalizedPrompt.includes("spreads") ||
    normalizedPrompt.includes("spread")
  );
}

function isSeverePrompt(prompt: string) {
  const normalizedPrompt = prompt.toLowerCase();

  return (
    normalizedPrompt.includes("severe") ||
    normalizedPrompt.includes("deadly") ||
    normalizedPrompt.includes("high mortality")
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundTo(value: number, places: number) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}
