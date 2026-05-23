import { DEFAULT_DAYS, DEFAULT_INTERVENTIONS } from "./constants";
import type { ScenarioConfig, SimulationConfig } from "./types";

export const denverPreset: ScenarioConfig = {
  scenario: "Winter respiratory outbreak in Denver",
  disease: {
    name: "Novel respiratory virus",
    r0: 2.2,
    incubationDays: 4.5,
    infectiousDays: 6.5,
    cfr: 0.006,
    pSevere: 0.035
  },
  city: {
    name: "Denver",
    lat: 39.7392,
    lng: -104.9903
  },
  seedNodeId: "denver-airport",
  seedCases: 18,
  nodes: [
    {
      id: "denver-airport",
      name: "Denver International Airport",
      type: "airport",
      lat: 39.8561,
      lng: -104.6737,
      population: 42000,
      hospitalCapacity: 0
    },
    {
      id: "denver-downtown",
      name: "Downtown Denver",
      type: "downtown",
      lat: 39.7487,
      lng: -104.9959,
      population: 78000,
      hospitalCapacity: 120
    },
    {
      id: "denver-union-station",
      name: "Union Station Transit Hub",
      type: "transit",
      lat: 39.753,
      lng: -105.0,
      population: 31000,
      hospitalCapacity: 0
    },
    {
      id: "denver-health",
      name: "Denver Health Medical Center",
      type: "hospital",
      lat: 39.7279,
      lng: -104.9911,
      population: 21000,
      hospitalCapacity: 520
    },
    {
      id: "auraria-campus",
      name: "Auraria Campus",
      type: "school",
      lat: 39.7447,
      lng: -105.0059,
      population: 26000,
      hospitalCapacity: 20
    },
    {
      id: "capitol-hill",
      name: "Capitol Hill Residential",
      type: "residential",
      lat: 39.7338,
      lng: -104.9798,
      population: 56000,
      hospitalCapacity: 40
    },
    {
      id: "cherry-creek",
      name: "Cherry Creek District",
      type: "downtown",
      lat: 39.7206,
      lng: -104.9588,
      population: 39000,
      hospitalCapacity: 45
    }
  ]
};

export const nycPreset: ScenarioConfig = {
  scenario: "Dense transit-linked respiratory outbreak in New York City",
  disease: {
    name: "Novel respiratory virus",
    r0: 2.6,
    incubationDays: 3.8,
    infectiousDays: 6.2,
    cfr: 0.007,
    pSevere: 0.04
  },
  city: {
    name: "New York City",
    lat: 40.7128,
    lng: -74.006
  },
  seedNodeId: "jfk-airport",
  seedCases: 28,
  nodes: [
    {
      id: "jfk-airport",
      name: "John F. Kennedy International Airport",
      type: "airport",
      lat: 40.6413,
      lng: -73.7781,
      population: 68000,
      hospitalCapacity: 0
    },
    {
      id: "midtown",
      name: "Midtown Manhattan",
      type: "downtown",
      lat: 40.7549,
      lng: -73.984,
      population: 160000,
      hospitalCapacity: 220
    },
    {
      id: "grand-central",
      name: "Grand Central Terminal",
      type: "transit",
      lat: 40.7527,
      lng: -73.9772,
      population: 91000,
      hospitalCapacity: 0
    },
    {
      id: "nyu-langone",
      name: "NYU Langone Health",
      type: "hospital",
      lat: 40.742,
      lng: -73.974,
      population: 48000,
      hospitalCapacity: 930
    },
    {
      id: "brooklyn-heights",
      name: "Brooklyn Heights",
      type: "residential",
      lat: 40.696,
      lng: -73.9933,
      population: 122000,
      hospitalCapacity: 120
    },
    {
      id: "queens-school-zone",
      name: "Queens School Cluster",
      type: "school",
      lat: 40.7282,
      lng: -73.7949,
      population: 84000,
      hospitalCapacity: 40
    },
    {
      id: "bronx-residential",
      name: "South Bronx Residential",
      type: "residential",
      lat: 40.8176,
      lng: -73.9182,
      population: 132000,
      hospitalCapacity: 100
    }
  ]
};

export const islandPreset: ScenarioConfig = {
  scenario: "Island resort outbreak with one airport and limited care",
  disease: {
    name: "Novel respiratory virus",
    r0: 1.9,
    incubationDays: 5,
    infectiousDays: 7,
    cfr: 0.004,
    pSevere: 0.025
  },
  city: {
    name: "Harbor Isle",
    lat: 21.3069,
    lng: -157.8583
  },
  seedNodeId: "harbor-airport",
  seedCases: 8,
  nodes: [
    {
      id: "harbor-airport",
      name: "Harbor Isle Airport",
      type: "airport",
      lat: 21.318,
      lng: -157.922,
      population: 9000,
      hospitalCapacity: 0
    },
    {
      id: "central-clinic",
      name: "Central Island Clinic",
      type: "hospital",
      lat: 21.309,
      lng: -157.86,
      population: 6800,
      hospitalCapacity: 95
    },
    {
      id: "port-market",
      name: "Port Market District",
      type: "downtown",
      lat: 21.304,
      lng: -157.87,
      population: 14300,
      hospitalCapacity: 20
    },
    {
      id: "north-school",
      name: "North Shore School",
      type: "school",
      lat: 21.35,
      lng: -157.92,
      population: 5200,
      hospitalCapacity: 5
    },
    {
      id: "lagoon-resort",
      name: "Lagoon Resort Quarter",
      type: "residential",
      lat: 21.276,
      lng: -157.827,
      population: 11800,
      hospitalCapacity: 12
    }
  ]
};

export const presets = {
  denver: denverPreset,
  nyc: nycPreset,
  island: islandPreset
} satisfies Record<string, ScenarioConfig>;

export type PresetKey = keyof typeof presets;

export function createPresetSimulation(
  presetKey: PresetKey = "denver"
): SimulationConfig {
  return {
    ...structuredClone(presets[presetKey]),
    days: DEFAULT_DAYS,
    interventions: { ...DEFAULT_INTERVENTIONS }
  };
}

export function getPresetForPrompt(prompt: string): ScenarioConfig {
  const normalizedPrompt = prompt.toLowerCase();

  if (
    normalizedPrompt.includes("new york") ||
    normalizedPrompt.includes("nyc") ||
    normalizedPrompt.includes("manhattan")
  ) {
    return structuredClone(nycPreset);
  }

  if (
    normalizedPrompt.includes("island") ||
    normalizedPrompt.includes("resort") ||
    normalizedPrompt.includes("harbor")
  ) {
    return structuredClone(islandPreset);
  }

  return structuredClone(denverPreset);
}
