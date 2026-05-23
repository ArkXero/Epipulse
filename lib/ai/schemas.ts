import { z } from "zod";
import { getPresetForPrompt } from "@/lib/model";
import type { ScenarioConfig } from "@/lib/model";

export const nodeTypeSchema = z.enum([
  "airport",
  "hospital",
  "school",
  "transit",
  "downtown",
  "residential"
]);

export const simNodeSchema = z.object({
  id: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(96),
  type: nodeTypeSchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  population: z.number().positive().max(2_000_000),
  hospitalCapacity: z.number().min(0).max(20_000)
});

export const scenarioConfigSchema = z
  .object({
    scenario: z.string().min(4).max(160),
    disease: z.object({
      name: z.string().min(2).max(96),
      r0: z.number().min(0.6).max(8),
      incubationDays: z.number().min(1).max(21),
      infectiousDays: z.number().min(1).max(30),
      cfr: z.number().min(0).max(0.2),
      pSevere: z.number().min(0).max(0.6)
    }),
    city: z.object({
      name: z.string().min(2).max(80),
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }),
    nodes: z.array(simNodeSchema).min(2).max(15),
    seedNodeId: z.string().min(2).max(48),
    seedCases: z.number().positive().max(10_000)
  })
  .superRefine((config, context) => {
    const ids = new Set<string>();

    for (const node of config.nodes) {
      if (ids.has(node.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate node id: ${node.id}`,
          path: ["nodes"]
        });
      }

      ids.add(node.id);
    }

    const seedNode = config.nodes.find((node) => node.id === config.seedNodeId);

    if (!seedNode) {
      context.addIssue({
        code: "custom",
        message: "seedNodeId must match a generated node id",
        path: ["seedNodeId"]
      });
    } else if (config.seedCases >= seedNode.population) {
      context.addIssue({
        code: "custom",
        message: "seedCases must be smaller than the seed node population",
        path: ["seedCases"]
      });
    }
  });

export const scenarioRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(1500)
});

export const nodeStateSchema = z.object({
  nodeId: z.string(),
  S: z.number().nonnegative(),
  E: z.number().nonnegative(),
  I: z.number().nonnegative(),
  R: z.number().nonnegative(),
  D: z.number().nonnegative(),
  hospitalized: z.number().nonnegative()
});

export const simulationDaySchema = z.object({
  day: z.number().int().nonnegative(),
  nodes: z.array(nodeStateSchema),
  aggregate: nodeStateSchema
});

export const simulationMetricsSchema = z.object({
  peakInfected: z.number().nonnegative(),
  peakInfectedDay: z.number().int().nonnegative(),
  totalDeaths: z.number().nonnegative(),
  totalPopulation: z.number().nonnegative(),
  finalRecovered: z.number().nonnegative(),
  firstAggregateHospitalBreachDay: z.number().int().nonnegative().nullable(),
  firstNodeHospitalBreachDay: z.number().int().nonnegative().nullable(),
  firstHospitalBreachNodeId: z.string().nullable(),
  perNodeHospitalBreachDay: z.record(
    z.string(),
    z.number().int().nonnegative().nullable()
  )
});

export const narrateRequestSchema = z.object({
  config: scenarioConfigSchema,
  day: simulationDaySchema,
  previousDay: simulationDaySchema.optional(),
  metrics: simulationMetricsSchema
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(3000)
});

export const advisorRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
  config: scenarioConfigSchema,
  currentDay: simulationDaySchema,
  metrics: simulationMetricsSchema
});

export const suggestedChangeSchema = z.object({
  label: z.string().min(2).max(80),
  rationale: z.string().min(2).max(240),
  interventions: z
    .object({
      transmissionRate: z.number().min(0.15).max(1.8).optional(),
      isolationCompliance: z.number().min(0).max(0.95).optional(),
      travelRestriction: z.number().min(0).max(1).optional(),
      closedNodeIds: z.array(z.string()).max(15).optional()
    })
    .optional()
});

export const suggestionsRequestSchema = z.object({
  message: z.string().min(1).max(3000),
  config: scenarioConfigSchema,
  currentDay: simulationDaySchema,
  metrics: simulationMetricsSchema
});

export const suggestionsResponseSchema = z.object({
  suggestedChanges: z.array(suggestedChangeSchema).max(4)
});

export function validateScenarioOrFallback(
  candidate: unknown,
  prompt: string
): ScenarioConfig {
  const result = scenarioConfigSchema.safeParse(candidate);

  if (!result.success) {
    return getPresetForPrompt(prompt);
  }

  return result.data;
}

export type AdvisorChatMessage = z.infer<typeof chatMessageSchema>;
export type SuggestedChange = z.infer<typeof suggestedChangeSchema>;
