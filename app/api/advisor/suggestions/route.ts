import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { getAnthropicModel, hasAnthropicApiKey } from "@/lib/ai/provider";
import {
  suggestionsRequestSchema,
  suggestionsResponseSchema
} from "@/lib/ai/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = suggestionsRequestSchema.safeParse(body);

  if (!parsed.success || !hasAnthropicApiKey()) {
    return NextResponse.json({ suggestedChanges: [] });
  }

  try {
    const result = await generateObject({
      model: getAnthropicModel(),
      schema: suggestionsResponseSchema,
      schemaName: "AdvisorSuggestions",
      prompt: [
        "Suggest up to four intervention changes for this Epipulse state.",
        "Return only structured changes supported by the schema.",
        `User message: ${parsed.data.message}`,
        `Day ${parsed.data.currentDay.day}, infected ${Math.round(
          parsed.data.currentDay.aggregate.I
        )}, hospitalized ${Math.round(
          parsed.data.currentDay.aggregate.hospitalized
        )}, peak infected ${Math.round(parsed.data.metrics.peakInfected)}.`
      ].join("\n"),
      maxOutputTokens: 900,
      maxRetries: 1
    });

    return NextResponse.json(result.object);
  } catch {
    return NextResponse.json({ suggestedChanges: [] });
  }
}
