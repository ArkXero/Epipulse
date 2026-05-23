import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { fallbackScenario } from "@/lib/ai/fallbacks";
import { getAnthropicModel, hasAnthropicApiKey } from "@/lib/ai/provider";
import { buildScenarioPrompt, scenarioSystemPrompt } from "@/lib/ai/prompts";
import { normalizeScenarioForSimulation } from "@/lib/ai/scenario-normalization";
import {
  scenarioConfigSchema,
  scenarioRequestSchema,
  validateScenarioOrFallback
} from "@/lib/ai/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = scenarioRequestSchema.safeParse(body);
  const prompt = parsed.success ? parsed.data.prompt : "";
  const fallbackPresetKey = parsed.success
    ? parsed.data.fallbackPresetKey
    : undefined;

  if (!parsed.success || !hasAnthropicApiKey()) {
    return NextResponse.json(fallbackScenario(prompt, fallbackPresetKey));
  }

  try {
    const result = await generateObject({
      model: getAnthropicModel(),
      schema: scenarioConfigSchema,
      schemaName: "ScenarioConfig",
      system: scenarioSystemPrompt,
      prompt: buildScenarioPrompt(prompt),
      maxOutputTokens: 2600,
      maxRetries: 1
    });
    const scenario = validateScenarioOrFallback(
      result.object,
      prompt,
      fallbackPresetKey
    );

    return NextResponse.json(
      normalizeScenarioForSimulation(scenario, prompt, fallbackPresetKey)
    );
  } catch {
    return NextResponse.json(fallbackScenario(prompt, fallbackPresetKey));
  }
}
