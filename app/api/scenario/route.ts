import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { fallbackScenario } from "@/lib/ai/fallbacks";
import { buildScenarioPrompt, scenarioSystemPrompt } from "@/lib/ai/prompts";
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

  if (!parsed.success || !process.env.OPENAI_API_KEY) {
    return NextResponse.json(fallbackScenario(prompt));
  }

  try {
    const result = await generateObject({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-5-mini"),
      schema: scenarioConfigSchema,
      schemaName: "ScenarioConfig",
      system: scenarioSystemPrompt,
      prompt: buildScenarioPrompt(prompt),
      maxOutputTokens: 2600,
      maxRetries: 1
    });
    const scenario = validateScenarioOrFallback(result.object, prompt);

    return NextResponse.json(scenario);
  } catch {
    return NextResponse.json(fallbackScenario(prompt));
  }
}
