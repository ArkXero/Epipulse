import { create } from "zustand";
import {
  DEFAULT_DAYS,
  DEFAULT_INTERVENTIONS,
  INTERVENTION_LIMITS,
  createPresetSimulation,
  presets,
  runSimulation
} from "@/lib/model";
import type {
  Interventions,
  PresetKey,
  ScenarioConfig,
  SimulationConfig,
  SimulationDay
} from "@/lib/model";

export interface AdvisorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: AdvisorMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I am reading the live Epipulse snapshot. Ask about timing, hospital load, closure tradeoffs, or which intervention to move first."
};

interface SimStore {
  config: SimulationConfig;
  timeline: SimulationDay[];
  currentDay: number;
  isPlaying: boolean;
  speed: number;
  selectedNodeId: string;
  advisorMessages: AdvisorMessage[];
  setAdvisorMessages: (messages: AdvisorMessage[]) => void;
  setPreset: (presetKey: PresetKey) => void;
  setScenario: (scenario: ScenarioConfig) => void;
  setCurrentDay: (day: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeed: (speed: number) => void;
  setSelectedNodeId: (nodeId: string) => void;
  setInterventions: (interventions: Partial<Interventions>) => void;
  toggleNodeClosed: (nodeId: string) => void;
  resetInterventions: () => void;
}

const initialConfig = createPresetSimulation("denver");

export const useSimStore = create<SimStore>((set) => ({
  config: initialConfig,
  timeline: runSimulation(initialConfig),
  currentDay: 0,
  isPlaying: false,
  speed: 1,
  selectedNodeId: initialConfig.nodes[0].id,
  advisorMessages: [WELCOME_MESSAGE],
  setAdvisorMessages: (advisorMessages) => set({ advisorMessages }),
  setPreset: (presetKey) => {
    const preset = presets[presetKey];
    const config: SimulationConfig = {
      ...structuredClone(preset),
      days: DEFAULT_DAYS,
      interventions: { ...DEFAULT_INTERVENTIONS }
    };

    set({
      config,
      timeline: runSimulation(config),
      currentDay: 0,
      isPlaying: false,
      selectedNodeId: config.nodes[0].id
    });
  },
  setScenario: (scenario) => {
    const config: SimulationConfig = {
      ...structuredClone(scenario),
      days: DEFAULT_DAYS,
      interventions: { ...DEFAULT_INTERVENTIONS }
    };

    set({
      config,
      timeline: runSimulation(config),
      currentDay: 0,
      isPlaying: false,
      selectedNodeId: config.nodes[0].id
    });
  },
  setCurrentDay: (day) =>
    set((state) => ({
      currentDay: clampDay(day, state.timeline.length - 1)
    })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setInterventions: (interventionPatch) =>
    set((state) => {
      const config: SimulationConfig = {
        ...state.config,
        interventions: normalizeInterventions({
          ...state.config.interventions,
          ...interventionPatch
        })
      };
      const timeline = runSimulation(config);

      return {
        config,
        timeline,
        currentDay: clampDay(state.currentDay, timeline.length - 1)
      };
    }),
  toggleNodeClosed: (nodeId) =>
    set((state) => {
      const closedNodeIds = state.config.interventions.closedNodeIds.includes(
        nodeId
      )
        ? state.config.interventions.closedNodeIds.filter((id) => id !== nodeId)
        : [...state.config.interventions.closedNodeIds, nodeId];
      const config: SimulationConfig = {
        ...state.config,
        interventions: {
          ...state.config.interventions,
          closedNodeIds
        }
      };
      const timeline = runSimulation(config);

      return {
        config,
        timeline,
        currentDay: clampDay(state.currentDay, timeline.length - 1)
      };
    }),
  resetInterventions: () =>
    set((state) => {
      const config: SimulationConfig = {
        ...state.config,
        interventions: { ...DEFAULT_INTERVENTIONS }
      };
      const timeline = runSimulation(config);

      return {
        config,
        timeline,
        currentDay: clampDay(state.currentDay, timeline.length - 1)
      };
    })
}));

function clampDay(day: number, maxDay: number) {
  return Math.max(0, Math.min(maxDay, Math.round(day)));
}

function normalizeInterventions(interventions: Interventions): Interventions {
  return {
    transmissionRate: clamp(
      interventions.transmissionRate,
      INTERVENTION_LIMITS.transmissionRate.min,
      INTERVENTION_LIMITS.transmissionRate.max
    ),
    isolationCompliance: clamp(
      interventions.isolationCompliance,
      INTERVENTION_LIMITS.isolationCompliance.min,
      INTERVENTION_LIMITS.isolationCompliance.max
    ),
    travelRestriction: clamp(
      interventions.travelRestriction,
      INTERVENTION_LIMITS.travelRestriction.min,
      INTERVENTION_LIMITS.travelRestriction.max
    ),
    closedNodeIds: interventions.closedNodeIds
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
