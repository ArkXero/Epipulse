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
    },
    {
      id: "anschutz-medical",
      name: "Anschutz Medical Campus",
      type: "hospital",
      lat: 39.7451,
      lng: -104.8366,
      population: 30000,
      hospitalCapacity: 780
    },
    {
      id: "lakewood-residential",
      name: "Lakewood Residential",
      type: "residential",
      lat: 39.7047,
      lng: -105.0814,
      population: 72000,
      hospitalCapacity: 70
    },
    {
      id: "denver-tech-center",
      name: "Denver Tech Center",
      type: "downtown",
      lat: 39.6252,
      lng: -104.9003,
      population: 62000,
      hospitalCapacity: 75
    },
    {
      id: "montbello-school-cluster",
      name: "Montbello School Cluster",
      type: "school",
      lat: 39.7926,
      lng: -104.8339,
      population: 34000,
      hospitalCapacity: 12
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
    },
    {
      id: "laguardia-airport",
      name: "LaGuardia Airport",
      type: "airport",
      lat: 40.7769,
      lng: -73.874,
      population: 58000,
      hospitalCapacity: 0
    },
    {
      id: "penn-station",
      name: "Penn Station Transit Hub",
      type: "transit",
      lat: 40.7506,
      lng: -73.9935,
      population: 110000,
      hospitalCapacity: 0
    },
    {
      id: "columbia-campus",
      name: "Columbia University Campus",
      type: "school",
      lat: 40.8075,
      lng: -73.9626,
      population: 50000,
      hospitalCapacity: 24
    },
    {
      id: "elmhurst-hospital",
      name: "Elmhurst Hospital Center",
      type: "hospital",
      lat: 40.7447,
      lng: -73.8854,
      population: 36000,
      hospitalCapacity: 545
    },
    {
      id: "staten-island-residential",
      name: "Staten Island Residential",
      type: "residential",
      lat: 40.5795,
      lng: -74.1502,
      population: 90000,
      hospitalCapacity: 70
    }
  ]
};

export const dmvPreset: ScenarioConfig = {
  scenario: "Regional respiratory outbreak across DC, Maryland, and Virginia",
  disease: {
    name: "Novel respiratory virus",
    r0: 2.35,
    incubationDays: 4.2,
    infectiousDays: 6.4,
    cfr: 0.006,
    pSevere: 0.036
  },
  city: {
    name: "DC-Maryland-Virginia",
    lat: 38.9072,
    lng: -77.0369
  },
  seedNodeId: "dca-airport",
  seedCases: 22,
  nodes: [
    {
      id: "dca-airport",
      name: "Reagan National Airport",
      type: "airport",
      lat: 38.8512,
      lng: -77.0402,
      population: 39000,
      hospitalCapacity: 0
    },
    {
      id: "union-station-dc",
      name: "Washington Union Station",
      type: "transit",
      lat: 38.8977,
      lng: -77.0062,
      population: 52000,
      hospitalCapacity: 0
    },
    {
      id: "downtown-dc",
      name: "Downtown Washington DC",
      type: "downtown",
      lat: 38.9037,
      lng: -77.0365,
      population: 118000,
      hospitalCapacity: 160
    },
    {
      id: "medstar-washington",
      name: "MedStar Washington Hospital Center",
      type: "hospital",
      lat: 38.9296,
      lng: -77.0146,
      population: 31000,
      hospitalCapacity: 820
    },
    {
      id: "bethesda-campus",
      name: "Bethesda Medical Campus",
      type: "hospital",
      lat: 39.0004,
      lng: -77.0968,
      population: 28000,
      hospitalCapacity: 620
    },
    {
      id: "college-park",
      name: "College Park Campus",
      type: "school",
      lat: 38.9869,
      lng: -76.9426,
      population: 43000,
      hospitalCapacity: 24
    },
    {
      id: "arlington-corridor",
      name: "Arlington Residential Corridor",
      type: "residential",
      lat: 38.8816,
      lng: -77.091,
      population: 95000,
      hospitalCapacity: 80
    },
    {
      id: "alexandria-old-town",
      name: "Alexandria Old Town",
      type: "downtown",
      lat: 38.8048,
      lng: -77.0469,
      population: 64000,
      hospitalCapacity: 58
    },
    {
      id: "silver-spring",
      name: "Silver Spring Residential",
      type: "residential",
      lat: 38.9907,
      lng: -77.0261,
      population: 88000,
      hospitalCapacity: 72
    },
    {
      id: "dulles-airport",
      name: "Dulles International Airport",
      type: "airport",
      lat: 38.9531,
      lng: -77.4565,
      population: 45000,
      hospitalCapacity: 0
    },
    {
      id: "tysons-corner",
      name: "Tysons Corner Business District",
      type: "downtown",
      lat: 38.9187,
      lng: -77.2311,
      population: 85000,
      hospitalCapacity: 90
    },
    {
      id: "georgetown-campus",
      name: "Georgetown Campus",
      type: "school",
      lat: 38.9076,
      lng: -77.0723,
      population: 28000,
      hospitalCapacity: 25
    },
    {
      id: "reston-corridor",
      name: "Reston Residential Corridor",
      type: "residential",
      lat: 38.9586,
      lng: -77.357,
      population: 80000,
      hospitalCapacity: 68
    },
    {
      id: "national-harbor",
      name: "National Harbor District",
      type: "downtown",
      lat: 38.785,
      lng: -77.016,
      population: 45000,
      hospitalCapacity: 35
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
    },
    {
      id: "east-harbor-ferry",
      name: "East Harbor Ferry Terminal",
      type: "transit",
      lat: 21.315,
      lng: -157.805,
      population: 7600,
      hospitalCapacity: 0
    },
    {
      id: "south-beach-resort",
      name: "South Beach Resort Strip",
      type: "residential",
      lat: 21.258,
      lng: -157.82,
      population: 9800,
      hospitalCapacity: 10
    },
    {
      id: "west-island-clinic",
      name: "West Island Clinic",
      type: "hospital",
      lat: 21.292,
      lng: -157.905,
      population: 4200,
      hospitalCapacity: 55
    },
    {
      id: "marina-village",
      name: "Marina Village",
      type: "downtown",
      lat: 21.289,
      lng: -157.846,
      population: 8700,
      hospitalCapacity: 16
    },
    {
      id: "upland-residential",
      name: "Upland Residential",
      type: "residential",
      lat: 21.336,
      lng: -157.875,
      population: 10400,
      hospitalCapacity: 8
    }
  ]
};

export const laPreset: ScenarioConfig = {
  scenario: "Respiratory outbreak across Los Angeles mobility corridors",
  disease: {
    name: "Novel respiratory virus",
    r0: 2.45,
    incubationDays: 4.1,
    infectiousDays: 6.3,
    cfr: 0.0065,
    pSevere: 0.038
  },
  city: {
    name: "Los Angeles",
    lat: 34.0522,
    lng: -118.2437
  },
  seedNodeId: "lax-airport",
  seedCases: 26,
  nodes: [
    {
      id: "lax-airport",
      name: "Los Angeles International Airport",
      type: "airport",
      lat: 33.9416,
      lng: -118.4085,
      population: 72000,
      hospitalCapacity: 0
    },
    {
      id: "la-union-station",
      name: "Los Angeles Union Station",
      type: "transit",
      lat: 34.0562,
      lng: -118.2365,
      population: 68000,
      hospitalCapacity: 0
    },
    {
      id: "downtown-la",
      name: "Downtown Los Angeles",
      type: "downtown",
      lat: 34.0407,
      lng: -118.2468,
      population: 145000,
      hospitalCapacity: 190
    },
    {
      id: "usc-campus",
      name: "USC Campus",
      type: "school",
      lat: 34.0224,
      lng: -118.2851,
      population: 56000,
      hospitalCapacity: 24
    },
    {
      id: "ucla-health",
      name: "UCLA Health Medical Center",
      type: "hospital",
      lat: 34.0658,
      lng: -118.447,
      population: 42000,
      hospitalCapacity: 780
    },
    {
      id: "cedars-sinai",
      name: "Cedars-Sinai Medical Center",
      type: "hospital",
      lat: 34.0755,
      lng: -118.3806,
      population: 36000,
      hospitalCapacity: 890
    },
    {
      id: "hollywood-district",
      name: "Hollywood District",
      type: "downtown",
      lat: 34.1016,
      lng: -118.3269,
      population: 118000,
      hospitalCapacity: 85
    },
    {
      id: "santa-monica",
      name: "Santa Monica Residential",
      type: "residential",
      lat: 34.0195,
      lng: -118.4912,
      population: 92000,
      hospitalCapacity: 90
    },
    {
      id: "long-beach-port",
      name: "Long Beach Port Corridor",
      type: "transit",
      lat: 33.7701,
      lng: -118.1937,
      population: 96000,
      hospitalCapacity: 60
    },
    {
      id: "koreatown",
      name: "Koreatown Residential",
      type: "residential",
      lat: 34.058,
      lng: -118.301,
      population: 124000,
      hospitalCapacity: 75
    },
    {
      id: "san-fernando-valley",
      name: "San Fernando Valley",
      type: "residential",
      lat: 34.1826,
      lng: -118.4397,
      population: 180000,
      hospitalCapacity: 120
    },
    {
      id: "pasadena-school-cluster",
      name: "Pasadena School Cluster",
      type: "school",
      lat: 34.1478,
      lng: -118.1445,
      population: 52000,
      hospitalCapacity: 22
    }
  ]
};

export const miamiPreset: ScenarioConfig = {
  scenario: "Respiratory outbreak across Miami travel and resort corridors",
  disease: {
    name: "Novel respiratory virus",
    r0: 2.5,
    incubationDays: 3.9,
    infectiousDays: 6.1,
    cfr: 0.0065,
    pSevere: 0.039
  },
  city: {
    name: "Miami",
    lat: 25.7617,
    lng: -80.1918
  },
  seedNodeId: "miami-airport",
  seedCases: 24,
  nodes: [
    {
      id: "miami-airport",
      name: "Miami International Airport",
      type: "airport",
      lat: 25.7959,
      lng: -80.287,
      population: 62000,
      hospitalCapacity: 0
    },
    {
      id: "downtown-miami",
      name: "Downtown Miami",
      type: "downtown",
      lat: 25.7743,
      lng: -80.1937,
      population: 105000,
      hospitalCapacity: 150
    },
    {
      id: "portmiami",
      name: "PortMiami Cruise Terminal",
      type: "transit",
      lat: 25.7781,
      lng: -80.1794,
      population: 54000,
      hospitalCapacity: 0
    },
    {
      id: "jackson-memorial",
      name: "Jackson Memorial Hospital",
      type: "hospital",
      lat: 25.7906,
      lng: -80.2127,
      population: 43000,
      hospitalCapacity: 1550
    },
    {
      id: "miami-beach",
      name: "Miami Beach Resort District",
      type: "residential",
      lat: 25.7907,
      lng: -80.13,
      population: 88000,
      hospitalCapacity: 80
    },
    {
      id: "little-havana",
      name: "Little Havana Residential",
      type: "residential",
      lat: 25.765,
      lng: -80.2197,
      population: 94000,
      hospitalCapacity: 65
    },
    {
      id: "fiu-campus",
      name: "FIU Campus",
      type: "school",
      lat: 25.7563,
      lng: -80.3756,
      population: 62000,
      hospitalCapacity: 22
    },
    {
      id: "wynwood-district",
      name: "Wynwood District",
      type: "downtown",
      lat: 25.801,
      lng: -80.199,
      population: 58000,
      hospitalCapacity: 35
    },
    {
      id: "coral-gables",
      name: "Coral Gables Residential",
      type: "residential",
      lat: 25.7215,
      lng: -80.2684,
      population: 72000,
      hospitalCapacity: 70
    },
    {
      id: "doral-logistics",
      name: "Doral Logistics Corridor",
      type: "transit",
      lat: 25.8195,
      lng: -80.3553,
      population: 68000,
      hospitalCapacity: 28
    },
    {
      id: "aventura-hospital",
      name: "Aventura Hospital",
      type: "hospital",
      lat: 25.9661,
      lng: -80.1434,
      population: 26000,
      hospitalCapacity: 450
    },
    {
      id: "homestead-residential",
      name: "Homestead Residential",
      type: "residential",
      lat: 25.4687,
      lng: -80.4776,
      population: 78000,
      hospitalCapacity: 52
    }
  ]
};

export const presets = {
  denver: denverPreset,
  nyc: nycPreset,
  dmv: dmvPreset,
  island: islandPreset,
  la: laPreset,
  miami: miamiPreset
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

export function getPresetKeyForPrompt(prompt: string): PresetKey | null {
  const normalizedPrompt = prompt.toLowerCase();

  if (
    normalizedPrompt.includes("new york") ||
    normalizedPrompt.includes("nyc") ||
    normalizedPrompt.includes("manhattan")
  ) {
    return "nyc";
  }

  if (
    /\bdc\b/.test(normalizedPrompt) ||
    normalizedPrompt.includes("d.c.") ||
    normalizedPrompt.includes("washington") ||
    normalizedPrompt.includes("maryland") ||
    normalizedPrompt.includes("virginia") ||
    /\bdmv\b/.test(normalizedPrompt)
  ) {
    return "dmv";
  }

  if (
    normalizedPrompt.includes("island") ||
    normalizedPrompt.includes("resort") ||
    normalizedPrompt.includes("harbor")
  ) {
    return "island";
  }

  if (
    normalizedPrompt.includes("denver") ||
    normalizedPrompt.includes("colorado")
  ) {
    return "denver";
  }

  return null;
}

export function getPresetForPrompt(prompt: string): ScenarioConfig {
  return structuredClone(presets[getPresetKeyForPrompt(prompt) ?? "denver"]);
}
