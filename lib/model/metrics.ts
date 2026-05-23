import type { SimNode, SimulationDay, SimulationMetrics } from "./types";

export function calculateMetrics(
  timeline: SimulationDay[],
  nodes: SimNode[]
): SimulationMetrics {
  const peak = timeline.reduce(
    (currentPeak, day) =>
      day.aggregate.I > currentPeak.value
        ? { day: day.day, value: day.aggregate.I }
        : currentPeak,
    { day: 0, value: 0 }
  );
  const lastDay = timeline[timeline.length - 1];
  const totalCapacity = nodes.reduce(
    (sum, node) => sum + node.hospitalCapacity,
    0
  );
  const firstAggregateHospitalBreachDay =
    timeline.find((day) => day.aggregate.hospitalized > totalCapacity)?.day ??
    null;
  const perNodeHospitalBreachDay = Object.fromEntries(
    nodes.map((node) => {
      const breachDay =
        timeline.find((day) => {
          const state = day.nodes.find((entry) => entry.nodeId === node.id);
          return state ? state.hospitalized > node.hospitalCapacity : false;
        })?.day ?? null;

      return [node.id, breachDay];
    })
  );
  const firstNodeBreach = Object.entries(perNodeHospitalBreachDay)
    .filter((entry): entry is [string, number] => entry[1] !== null)
    .sort((a, b) => a[1] - b[1])[0];

  return {
    peakInfected: peak.value,
    peakInfectedDay: peak.day,
    totalDeaths: lastDay?.aggregate.D ?? 0,
    totalPopulation: lastDay
      ? lastDay.aggregate.S +
        lastDay.aggregate.E +
        lastDay.aggregate.I +
        lastDay.aggregate.R +
        lastDay.aggregate.D
      : 0,
    finalRecovered: lastDay?.aggregate.R ?? 0,
    firstAggregateHospitalBreachDay,
    firstNodeHospitalBreachDay: firstNodeBreach?.[1] ?? null,
    firstHospitalBreachNodeId: firstNodeBreach?.[0] ?? null,
    perNodeHospitalBreachDay
  };
}
