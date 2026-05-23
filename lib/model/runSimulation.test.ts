import { describe, expect, it } from "vitest";
import { DEFAULT_INTERVENTIONS } from "./constants";
import { calculateMetrics } from "./metrics";
import { runSimulation } from "./runSimulation";
import type { ScenarioConfig, SimulationConfig } from "./types";

const twoNodeScenario: ScenarioConfig = {
  scenario: "Two node spread",
  disease: {
    name: "Test fever",
    r0: 2.7,
    incubationDays: 3,
    infectiousDays: 5,
    cfr: 0.004,
    pSevere: 0.04
  },
  city: { name: "Testville", lat: 40, lng: -105 },
  seedNodeId: "school",
  seedCases: 20,
  nodes: [
    {
      id: "school",
      name: "Central School",
      type: "school",
      lat: 40,
      lng: -105,
      population: 7000,
      hospitalCapacity: 12
    },
    {
      id: "residential",
      name: "West Residential",
      type: "residential",
      lat: 40.03,
      lng: -105.05,
      population: 9000,
      hospitalCapacity: 90
    }
  ]
};

describe("runSimulation", () => {
  it("applies seed cases on day zero", () => {
    const timeline = runSimulation({
      ...twoNodeScenario,
      days: 10,
      interventions: DEFAULT_INTERVENTIONS
    });
    const seedNode = timeline[0].nodes.find((node) => node.nodeId === "school");
    const otherNode = timeline[0].nodes.find(
      (node) => node.nodeId === "residential"
    );

    expect(seedNode?.I).toBe(twoNodeScenario.seedCases);
    expect(seedNode?.S).toBe(7000 - twoNodeScenario.seedCases);
    expect(otherNode?.I).toBe(0);
  });

  it("spreads to another node through mobility", () => {
    const timeline = runSimulation({
      ...twoNodeScenario,
      days: 45,
      interventions: DEFAULT_INTERVENTIONS
    });
    const lateResidential = timeline
      .at(-1)
      ?.nodes.find((node) => node.nodeId === "residential");

    expect(lateResidential).toBeDefined();
    expect(
      (lateResidential?.E ?? 0) +
        (lateResidential?.I ?? 0) +
        (lateResidential?.R ?? 0) +
        (lateResidential?.D ?? 0)
    ).toBeGreaterThan(0);
  });

  it("lowers cross-node spread when travel is restricted", () => {
    const openTimeline = runSimulation({
      ...twoNodeScenario,
      days: 45,
      interventions: DEFAULT_INTERVENTIONS
    });
    const restrictedTimeline = runSimulation({
      ...twoNodeScenario,
      days: 45,
      interventions: {
        ...DEFAULT_INTERVENTIONS,
        travelRestriction: 1
      }
    });
    const openResidential = openTimeline
      .at(-1)
      ?.nodes.find((node) => node.nodeId === "residential");
    const restrictedResidential = restrictedTimeline
      .at(-1)
      ?.nodes.find((node) => node.nodeId === "residential");
    const openAffected =
      (openResidential?.E ?? 0) +
      (openResidential?.I ?? 0) +
      (openResidential?.R ?? 0) +
      (openResidential?.D ?? 0);
    const restrictedAffected =
      (restrictedResidential?.E ?? 0) +
      (restrictedResidential?.I ?? 0) +
      (restrictedResidential?.R ?? 0) +
      (restrictedResidential?.D ?? 0);

    expect(openAffected).toBeGreaterThan(restrictedAffected);
  });

  it("changes outcomes when a seeded school is closed", () => {
    const openConfig: SimulationConfig = {
      ...twoNodeScenario,
      days: 80,
      interventions: DEFAULT_INTERVENTIONS
    };
    const closedConfig: SimulationConfig = {
      ...twoNodeScenario,
      days: 80,
      interventions: {
        ...DEFAULT_INTERVENTIONS,
        closedNodeIds: ["school"]
      }
    };
    const openPeak = calculateMetrics(
      runSimulation(openConfig),
      openConfig.nodes
    ).peakInfected;
    const closedPeak = calculateMetrics(
      runSimulation(closedConfig),
      closedConfig.nodes
    ).peakInfected;

    expect(closedPeak).toBeLessThan(openPeak);
  });
});
