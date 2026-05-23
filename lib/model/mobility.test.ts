import { describe, expect, it } from "vitest";
import { DEFAULT_INTERVENTIONS, MOBILITY_OUTBOUND_TARGET } from "./constants";
import { buildEffectiveMobilityMatrix } from "./mobility";
import type { SimNode } from "./types";

const nodes: SimNode[] = [
  {
    id: "airport",
    name: "Airport",
    type: "airport",
    lat: 39.86,
    lng: -104.67,
    population: 10000,
    hospitalCapacity: 0
  },
  {
    id: "downtown",
    name: "Downtown",
    type: "downtown",
    lat: 39.75,
    lng: -104.99,
    population: 20000,
    hospitalCapacity: 100
  },
  {
    id: "school",
    name: "School",
    type: "school",
    lat: 39.74,
    lng: -105.01,
    population: 8000,
    hospitalCapacity: 10
  }
];

describe("buildEffectiveMobilityMatrix", () => {
  it("builds a square matrix with no self-flow", () => {
    const matrix = buildEffectiveMobilityMatrix(nodes, DEFAULT_INTERVENTIONS);

    expect(matrix).toHaveLength(nodes.length);
    matrix.forEach((row, index) => {
      expect(row).toHaveLength(nodes.length);
      expect(row[index]).toBe(0);
    });
  });

  it("keeps row sums bounded by the outbound target", () => {
    const matrix = buildEffectiveMobilityMatrix(nodes, DEFAULT_INTERVENTIONS);

    matrix.forEach((row) => {
      const rowSum = row.reduce((sum, value) => sum + value, 0);
      expect(rowSum).toBeLessThanOrEqual(MOBILITY_OUTBOUND_TARGET + 1e-12);
    });
  });

  it("scales all open-node flow by travel restriction", () => {
    const baseline = buildEffectiveMobilityMatrix(nodes, DEFAULT_INTERVENTIONS);
    const restricted = buildEffectiveMobilityMatrix(nodes, {
      ...DEFAULT_INTERVENTIONS,
      travelRestriction: 0.75
    });

    expect(restricted[0][1]).toBeCloseTo(baseline[0][1] * 0.25, 10);
    expect(restricted[1][2]).toBeCloseTo(baseline[1][2] * 0.25, 10);
  });

  it("zeros inbound and outbound flow for closed nodes", () => {
    const matrix = buildEffectiveMobilityMatrix(nodes, {
      ...DEFAULT_INTERVENTIONS,
      closedNodeIds: ["downtown"]
    });
    const closedIndex = nodes.findIndex((node) => node.id === "downtown");

    matrix[closedIndex].forEach((value) => expect(value).toBe(0));
    matrix.forEach((row) => expect(row[closedIndex]).toBe(0));
  });
});
