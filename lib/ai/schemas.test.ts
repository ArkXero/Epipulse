import { describe, expect, it } from "vitest";
import { denverPreset, dmvPreset, nycPreset } from "@/lib/model";
import { fallbackScenario, hasMeaningfulDiseasePrompt } from "./fallbacks";
import { normalizeScenarioForSimulation } from "./scenario-normalization";
import {
  scenarioConfigSchema,
  validateScenarioOrFallback
} from "./schemas";

describe("AI scenario schema", () => {
  it("accepts the bundled Denver preset", () => {
    const result = scenarioConfigSchema.safeParse(denverPreset);

    expect(result.success).toBe(true);
  });

  it("falls back to the best preset for invalid generated output", () => {
    const invalidScenario = {
      ...denverPreset,
      nodes: [
        {
          ...denverPreset.nodes[0],
          lat: 120
        }
      ],
      seedNodeId: "missing-node"
    };
    const fallback = validateScenarioOrFallback(
      invalidScenario,
      "A transit outbreak in NYC"
    );

    expect(fallback.city.name).toBe(nycPreset.city.name);
    expect(fallback.seedNodeId).toBe(nycPreset.seedNodeId);
  });

  it("matches DC, Maryland, and Virginia prompts to the DMV preset", () => {
    const fallback = validateScenarioOrFallback(
      { scenario: "" },
      "A winter surge starts around Washington DC and northern Virginia"
    );

    expect(fallback.city.name).toBe(dmvPreset.city.name);
  });

  it("lets an edited prompt override the selected preset fallback", () => {
    const fallback = fallbackScenario(
      "A respiratory surge begins around Washington DC",
      "denver"
    );

    expect(fallback.city.name).toBe(dmvPreset.city.name);
  });

  it("keeps the selected preset when the prompt has no known location", () => {
    const fallback = fallbackScenario(
      "A severe winter wave with faster transmission",
      "nyc"
    );

    expect(hasMeaningfulDiseasePrompt("A severe winter wave")).toBe(true);
    expect(fallback.city.name).toBe(nycPreset.city.name);
    expect(fallback.scenario).toBe("A severe winter wave with faster transmission");
    expect(fallback.disease.r0).toBeGreaterThan(nycPreset.disease.r0);
    expect(fallback.disease.cfr).toBeGreaterThan(nycPreset.disease.cfr);
  });

  it("returns a zero-outbreak scenario for a non-outbreak prompt", () => {
    const fallback = fallbackScenario("a", "nyc");

    expect(fallback.city.name).toBe(nycPreset.city.name);
    expect(fallback.scenario).toBe("No disease outbreak indicated");
    expect(fallback.seedCases).toBe(0);
  });

  it("returns a zero-outbreak scenario for negated outbreak language", () => {
    const prompt = "no outbreak occurred";
    const fallback = fallbackScenario(prompt, "nyc");

    expect(hasMeaningfulDiseasePrompt(prompt)).toBe(false);
    expect(fallback.seedCases).toBe(0);
  });

  it("accepts zero-outbreak scenario configs", () => {
    const result = scenarioConfigSchema.safeParse(
      fallbackScenario("no outbreak", "nyc")
    );

    expect(result.success).toBe(true);
  });

  it("normalizes clinically literal AI disease inputs for outbreak demos", () => {
    const aiScenario = {
      ...dmvPreset,
      disease: {
        name: "Hantavirus Pulmonary Syndrome",
        r0: 1.4,
        incubationDays: 14,
        infectiousDays: 7,
        cfr: 0.18,
        pSevere: 0.45
      },
      seedCases: 12
    };
    const normalized = normalizeScenarioForSimulation(
      aiScenario,
      "Hantavirus Oubreak in the DMV area of Dc, maryland, and virginia",
      "dmv"
    );

    expect(normalized.disease.r0).toBeGreaterThanOrEqual(
      dmvPreset.disease.r0
    );
    expect(normalized.disease.incubationDays).toBeLessThanOrEqual(6.5);
    expect(normalized.disease.cfr).toBeLessThanOrEqual(0.03);
    expect(normalized.disease.pSevere).toBeLessThanOrEqual(0.12);
    expect(normalized.seedCases).toBeGreaterThanOrEqual(dmvPreset.seedCases);
  });
});
