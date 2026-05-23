import { describe, expect, it } from "vitest";
import { calculateMetrics } from "./metrics";
import type { SimNode, SimulationDay } from "./types";

const nodes: SimNode[] = [
  {
    id: "hospital",
    name: "Hospital",
    type: "hospital",
    lat: 40,
    lng: -105,
    population: 1000,
    hospitalCapacity: 20
  },
  {
    id: "school",
    name: "School",
    type: "school",
    lat: 40.02,
    lng: -105.02,
    population: 800,
    hospitalCapacity: 5
  }
];

const timeline: SimulationDay[] = [
  {
    day: 0,
    nodes: [
      { nodeId: "hospital", S: 980, E: 0, I: 20, R: 0, D: 0, hospitalized: 2 },
      { nodeId: "school", S: 800, E: 0, I: 0, R: 0, D: 0, hospitalized: 0 }
    ],
    aggregate: {
      nodeId: "aggregate",
      S: 1780,
      E: 0,
      I: 20,
      R: 0,
      D: 0,
      hospitalized: 2
    }
  },
  {
    day: 3,
    nodes: [
      { nodeId: "hospital", S: 900, E: 20, I: 70, R: 9, D: 1, hospitalized: 21 },
      { nodeId: "school", S: 720, E: 20, I: 45, R: 14, D: 1, hospitalized: 6 }
    ],
    aggregate: {
      nodeId: "aggregate",
      S: 1620,
      E: 40,
      I: 115,
      R: 23,
      D: 2,
      hospitalized: 27
    }
  },
  {
    day: 6,
    nodes: [
      { nodeId: "hospital", S: 880, E: 10, I: 45, R: 60, D: 5, hospitalized: 13 },
      { nodeId: "school", S: 700, E: 10, I: 30, R: 56, D: 4, hospitalized: 4 }
    ],
    aggregate: {
      nodeId: "aggregate",
      S: 1580,
      E: 20,
      I: 75,
      R: 116,
      D: 9,
      hospitalized: 17
    }
  }
];

describe("calculateMetrics", () => {
  it("calculates peak infected and deaths", () => {
    const metrics = calculateMetrics(timeline, nodes);

    expect(metrics.peakInfected).toBe(115);
    expect(metrics.peakInfectedDay).toBe(3);
    expect(metrics.totalDeaths).toBe(9);
  });

  it("calculates aggregate and per-node hospital breach days", () => {
    const metrics = calculateMetrics(timeline, nodes);

    expect(metrics.firstAggregateHospitalBreachDay).toBe(3);
    expect(metrics.firstNodeHospitalBreachDay).toBe(3);
    expect(metrics.firstHospitalBreachNodeId).toBe("hospital");
    expect(metrics.perNodeHospitalBreachDay.hospital).toBe(3);
    expect(metrics.perNodeHospitalBreachDay.school).toBe(3);
  });
});
