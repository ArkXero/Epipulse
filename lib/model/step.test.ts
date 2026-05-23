import { describe, expect, it } from "vitest";
import { DEFAULT_INTERVENTIONS } from "./constants";
import { runSimulation, seedInitialStates } from "./runSimulation";
import { stepSimulationDay } from "./step";
import type { ScenarioConfig, SimulationConfig } from "./types";

const oneNodeScenario: ScenarioConfig = {
  scenario: "One node outbreak",
  disease: {
    name: "Test fever",
    r0: 2.4,
    incubationDays: 3,
    infectiousDays: 5,
    cfr: 0.01,
    pSevere: 0.08
  },
  city: { name: "Testville", lat: 40, lng: -105 },
  seedNodeId: "residential",
  seedCases: 12,
  nodes: [
    {
      id: "residential",
      name: "Residential Node",
      type: "residential",
      lat: 40,
      lng: -105,
      population: 5000,
      hospitalCapacity: 100
    }
  ]
};

describe("stepSimulationDay", () => {
  it("does not create negative compartments", () => {
    const initialStates = seedInitialStates(oneNodeScenario);
    const nextStates = stepSimulationDay(
      oneNodeScenario,
      initialStates,
      DEFAULT_INTERVENTIONS
    );

    nextStates.forEach((state) => {
      expect(state.S).toBeGreaterThanOrEqual(0);
      expect(state.E).toBeGreaterThanOrEqual(0);
      expect(state.I).toBeGreaterThanOrEqual(0);
      expect(state.R).toBeGreaterThanOrEqual(0);
      expect(state.D).toBeGreaterThanOrEqual(0);
      expect(state.hospitalized).toBeGreaterThanOrEqual(0);
    });
  });

  it("keeps deaths monotonic and total population conserved", () => {
    const timeline = runSimulation({
      ...oneNodeScenario,
      days: 80,
      interventions: DEFAULT_INTERVENTIONS
    });
    const initialTotal =
      timeline[0].aggregate.S +
      timeline[0].aggregate.E +
      timeline[0].aggregate.I +
      timeline[0].aggregate.R +
      timeline[0].aggregate.D;

    for (let index = 1; index < timeline.length; index += 1) {
      const day = timeline[index];
      const previousDay = timeline[index - 1];
      const total =
        day.aggregate.S +
        day.aggregate.E +
        day.aggregate.I +
        day.aggregate.R +
        day.aggregate.D;

      expect(day.aggregate.D).toBeGreaterThanOrEqual(previousDay.aggregate.D);
      expect(total).toBeCloseTo(initialTotal, 8);
    }
  });

  it("produces a one-node epidemic that rises and then falls", () => {
    const config: SimulationConfig = {
      ...oneNodeScenario,
      days: 160,
      interventions: DEFAULT_INTERVENTIONS
    };
    const timeline = runSimulation(config);
    const infected = timeline.map((day) => day.aggregate.I);
    const peak = Math.max(...infected);

    expect(peak).toBeGreaterThan(infected[0] * 1.5);
    expect(infected[infected.length - 1]).toBeLessThan(peak * 0.2);
  });

  it("keeps high isolation from crushing the infected peak", () => {
    const baseline = runSimulation({
      ...oneNodeScenario,
      days: 80,
      interventions: {
        ...DEFAULT_INTERVENTIONS,
        isolationCompliance: 0
      }
    });
    const strongIsolation = runSimulation({
      ...oneNodeScenario,
      days: 80,
      interventions: {
        ...DEFAULT_INTERVENTIONS,
        isolationCompliance: 0.95
      }
    });

    const baselinePeak = Math.max(...baseline.map((day) => day.aggregate.I));
    const isolationPeak = Math.max(
      ...strongIsolation.map((day) => day.aggregate.I)
    );

    expect(isolationPeak).toBeGreaterThan(baselinePeak * 0.75);
  });
});
