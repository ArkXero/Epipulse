import { describe, expect, it } from "vitest";
import { denverPreset, nycPreset } from "@/lib/model";
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
});
