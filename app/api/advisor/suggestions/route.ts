import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import {
  suggestionsRequestSchema,
  suggestionsResponseSchema
} from "@/lib/ai/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = suggestionsRequestSchema.safeParse(body);

  if (!parsed.success || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ suggestedChanges: [] });
  }

  try {
    const result = await generateObject({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-5-mini"),
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
