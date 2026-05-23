import {
  AIRPORT_EXTERNAL_IMPORT_MAX,
  CLOSED_CONTACT_MULTIPLIER,
  CONTACT_MULTIPLIERS
} from "./constants";
import { buildEffectiveMobilityMatrix } from "./mobility";
import type {
  Interventions,
  NodeState,
  ScenarioConfig,
  SimNode
} from "./types";

export function stepSimulationDay(
  scenario: ScenarioConfig,
  previousStates: NodeState[],
  interventions: Interventions
) {
  const afterMobility = applyMobility(
    scenario.nodes,
    previousStates,
    interventions
  );

  return afterMobility.map((state) =>
    applyLocalSeir(scenario, state, interventions)
  );
}

function applyMobility(
  nodes: SimNode[],
  states: NodeState[],
  interventions: Interventions
) {
  const matrix = buildEffectiveMobilityMatrix(nodes, interventions);
  const stayingStates = states.map((state) => ({ ...state }));
  const infectiousTravelScale = Math.max(
    0,
    Math.min(1, 1 - interventions.isolationCompliance)
  );

  for (let originIndex = 0; originIndex < states.length; originIndex += 1) {
    const origin = states[originIndex];
    const outboundFractions = matrix[originIndex] ?? [];

    for (
      let destinationIndex = 0;
      destinationIndex < outboundFractions.length;
      destinationIndex += 1
    ) {
      const fraction = outboundFractions[destinationIndex] ?? 0;

      if (fraction <= 0 || originIndex === destinationIndex) {
        continue;
      }

      const moved = {
        S: origin.S * fraction,
        E: origin.E * fraction,
        I: origin.I * fraction * infectiousTravelScale,
        R: origin.R * fraction,
        D: 0
      };

      stayingStates[originIndex].S -= moved.S;
      stayingStates[originIndex].E -= moved.E;
      stayingStates[originIndex].I -= moved.I;
      stayingStates[originIndex].R -= moved.R;

      stayingStates[destinationIndex].S += moved.S;
      stayingStates[destinationIndex].E += moved.E;
      stayingStates[destinationIndex].I += moved.I;
      stayingStates[destinationIndex].R += moved.R;
    }
  }

  return stayingStates.map((state) => normalizeState(state));
}

function applyLocalSeir(
  scenario: ScenarioConfig,
  state: NodeState,
  interventions: Interventions
) {
  const node = scenario.nodes.find((candidate) => candidate.id === state.nodeId);

  if (!node) {
    return state;
  }

  const closedNodeIds = new Set(interventions.closedNodeIds);
  const contactMultiplier = closedNodeIds.has(node.id)
    ? CLOSED_CONTACT_MULTIPLIER
    : CONTACT_MULTIPLIERS[node.type];
  const isolationScale = Math.max(
    0,
    Math.min(1, 1 - interventions.isolationCompliance)
  );
  const livingPopulation = Math.max(1, state.S + state.E + state.I + state.R);
  const beta =
    (scenario.disease.r0 / scenario.disease.infectiousDays) *
    interventions.transmissionRate *
    contactMultiplier;
  const isZeroOutbreak =
    scenario.seedCases === 0 &&
    state.I === 0 &&
    state.E === 0 &&
    state.R === 0 &&
    state.D === 0;
  const forceOfInfection = beta * state.S * state.I * isolationScale;
  const localExposed = clampTransition(
    forceOfInfection / livingPopulation,
    state.S
  );
  const importExposed = isZeroOutbreak
    ? 0
    : getExternalImportation(node, state, interventions);
  const totalNewExposed = clampTransition(
    localExposed + importExposed,
    state.S
  );
  const newlyInfectious = clampTransition(
    state.E / scenario.disease.incubationDays,
    state.E
  );
  const leavingInfectious = clampTransition(
    state.I / scenario.disease.infectiousDays,
    state.I
  );
  const newDeaths = leavingInfectious * scenario.disease.cfr;
  const newRecovered = leavingInfectious - newDeaths;

  const nextState: NodeState = {
    nodeId: state.nodeId,
    S: state.S - totalNewExposed,
    E: state.E + totalNewExposed - newlyInfectious,
    I: state.I + newlyInfectious - leavingInfectious,
    R: state.R + newRecovered,
    D: state.D + newDeaths,
    hospitalized: 0
  };

  nextState.hospitalized = Math.max(
    0,
    nextState.I * scenario.disease.pSevere
  );

  return normalizeState(nextState);
}

function getExternalImportation(
  node: SimNode,
  state: NodeState,
  interventions: Interventions
) {
  if (
    node.type !== "airport" ||
    interventions.closedNodeIds.includes(node.id)
  ) {
    return 0;
  }

  const travelScale = Math.max(0, Math.min(1, 1 - interventions.travelRestriction));
  return Math.min(state.S, AIRPORT_EXTERNAL_IMPORT_MAX * travelScale);
}

function clampTransition(value: number, available: number) {
  if (!Number.isFinite(value) || value <= 0 || available <= 0) {
    return 0;
  }

  return Math.min(value, available);
}

function normalizeState(state: NodeState): NodeState {
  const normalized = {
    ...state,
    S: snapNonNegative(state.S),
    E: snapNonNegative(state.E),
    I: snapNonNegative(state.I),
    R: snapNonNegative(state.R),
    D: snapNonNegative(state.D),
    hospitalized: snapNonNegative(state.hospitalized)
  };

  return normalized;
}

function snapNonNegative(value: number) {
  if (!Number.isFinite(value) || value < 1e-9) {
    return 0;
  }

  return value;
}
