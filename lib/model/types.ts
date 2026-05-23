export type NodeType =
  | "airport"
  | "hospital"
  | "school"
  | "transit"
  | "downtown"
  | "residential";

export interface ScenarioConfig {
  scenario: string;
  disease: {
    name: string;
    r0: number;
    incubationDays: number;
    infectiousDays: number;
    cfr: number;
    pSevere: number;
  };
  city: {
    name: string;
    lat: number;
    lng: number;
  };
  nodes: SimNode[];
  seedNodeId: string;
  seedCases: number;
}

export interface SimNode {
  id: string;
  name: string;
  type: NodeType;
  lat: number;
  lng: number;
  population: number;
  hospitalCapacity: number;
}

export interface Interventions {
  transmissionRate: number;
  isolationCompliance: number;
  travelRestriction: number;
  closedNodeIds: string[];
}

export interface SimulationConfig extends ScenarioConfig {
  days: number;
  interventions: Interventions;
}

export interface NodeState {
  nodeId: string;
  S: number;
  E: number;
  I: number;
  R: number;
  D: number;
  hospitalized: number;
}

export interface SimulationDay {
  day: number;
  nodes: NodeState[];
  aggregate: NodeState;
}

export interface SimulationMetrics {
  peakInfected: number;
  peakInfectedDay: number;
  totalDeaths: number;
  totalPopulation: number;
  finalRecovered: number;
  firstAggregateHospitalBreachDay: number | null;
  firstNodeHospitalBreachDay: number | null;
  firstHospitalBreachNodeId: string | null;
  perNodeHospitalBreachDay: Record<string, number | null>;
}
