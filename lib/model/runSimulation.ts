import { DEFAULT_DAYS, DEFAULT_INTERVENTIONS } from "./constants";
import { stepSimulationDay } from "./step";
import type {
  NodeState,
  ScenarioConfig,
  SimulationConfig,
  SimulationDay
} from "./types";

export function createSimulationConfig(
  scenario: ScenarioConfig,
  overrides: Partial<Pick<SimulationConfig, "days" | "interventions">> = {}
): SimulationConfig {
  return {
    ...scenario,
    days: overrides.days ?? DEFAULT_DAYS,
    interventions: {
      ...DEFAULT_INTERVENTIONS,
      ...overrides.interventions,
      closedNodeIds: overrides.interventions?.closedNodeIds ?? []
    }
  };
}

export function runSimulation(config: SimulationConfig): SimulationDay[] {
  const days = Math.max(0, Math.floor(config.days));
  const timeline: SimulationDay[] = [];
  let states = seedInitialStates(config);

  timeline.push(toSimulationDay(0, states));

  for (let day = 1; day <= days; day += 1) {
    states = stepSimulationDay(config, states, config.interventions);
    timeline.push(toSimulationDay(day, states));
  }

  return timeline;
}

export function seedInitialStates(config: ScenarioConfig): NodeState[] {
  return config.nodes.map((node) => {
    const seedCases =
      node.id === config.seedNodeId
        ? Math.min(node.population, Math.max(0, config.seedCases))
        : 0;

    return {
      nodeId: node.id,
      S: node.population - seedCases,
      E: 0,
      I: seedCases,
      R: 0,
      D: 0,
      hospitalized: seedCases * config.disease.pSevere
    };
  });
}

export function aggregateStates(states: NodeState[]): NodeState {
  return states.reduce<NodeState>(
    (aggregate, state) => ({
      nodeId: "aggregate",
      S: aggregate.S + state.S,
      E: aggregate.E + state.E,
      I: aggregate.I + state.I,
      R: aggregate.R + state.R,
      D: aggregate.D + state.D,
      hospitalized: aggregate.hospitalized + state.hospitalized
    }),
    {
      nodeId: "aggregate",
      S: 0,
      E: 0,
      I: 0,
      R: 0,
      D: 0,
      hospitalized: 0
    }
  );
}

function toSimulationDay(day: number, states: NodeState[]): SimulationDay {
  const copiedStates = states.map((state) => ({ ...state }));

  return {
    day,
    nodes: copiedStates,
    aggregate: aggregateStates(copiedStates)
  };
}
