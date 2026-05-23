import type { Interventions, NodeType } from "./types";

export const DEFAULT_DAYS = 120;
export const MOBILITY_OUTBOUND_TARGET = 0.08;
export const AIRPORT_EXTERNAL_IMPORT_MAX = 0.25;
export const CLOSED_CONTACT_MULTIPLIER = 0.02;
export const MIN_DISTANCE_KM = 0.4;

export const DEFAULT_INTERVENTIONS: Interventions = {
  transmissionRate: 1,
  isolationCompliance: 0,
  travelRestriction: 0,
  closedNodeIds: []
};

export const CONTACT_MULTIPLIERS: Record<NodeType, number> = {
  airport: 1.18,
  hospital: 0.86,
  school: 1.34,
  transit: 1.28,
  downtown: 1.14,
  residential: 0.74
};

export const INTERVENTION_LIMITS = {
  transmissionRate: { min: 0.15, max: 1.8 },
  isolationCompliance: { min: 0, max: 0.95 },
  travelRestriction: { min: 0, max: 1 }
};
