import {
  MIN_DISTANCE_KM,
  MOBILITY_OUTBOUND_TARGET
} from "./constants";
import type { Interventions, SimNode } from "./types";

export function haversineDistanceKm(
  a: Pick<SimNode, "lat" | "lng">,
  b: Pick<SimNode, "lat" | "lng">
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function buildGravityWeights(nodes: SimNode[]) {
  return nodes.map((origin, originIndex) => {
    const rawWeights = nodes.map((destination, destinationIndex) => {
      if (originIndex === destinationIndex) {
        return 0;
      }

      const distance = Math.max(
        MIN_DISTANCE_KM,
        haversineDistanceKm(origin, destination)
      );

      return destination.population / distance ** 2;
    });

    const rowTotal = rawWeights.reduce((sum, value) => sum + value, 0);

    if (rowTotal === 0) {
      return rawWeights;
    }

    return rawWeights.map((value) => value / rowTotal);
  });
}

export function buildEffectiveMobilityMatrix(
  nodes: SimNode[],
  interventions: Interventions
) {
  const closedNodeIds = new Set(interventions.closedNodeIds);
  const travelScale = clamp01(1 - interventions.travelRestriction);
  const gravityWeights = buildGravityWeights(nodes);

  return gravityWeights.map((row, originIndex) => {
    const origin = nodes[originIndex];

    return row.map((weight, destinationIndex) => {
      const destination = nodes[destinationIndex];

      if (
        originIndex === destinationIndex ||
        closedNodeIds.has(origin.id) ||
        closedNodeIds.has(destination.id)
      ) {
        return 0;
      }

      return weight * MOBILITY_OUTBOUND_TARGET * travelScale;
    });
  });
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
