import { generateText } from "ai";
import { NextResponse } from "next/server";
import { fallbackNarration } from "@/lib/ai/fallbacks";
import { getAnthropicModel, hasAnthropicApiKey } from "@/lib/ai/provider";
import { buildNarrationPrompt } from "@/lib/ai/prompts";
import { narrateRequestSchema } from "@/lib/ai/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = narrateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ report: "No valid simulation snapshot was provided." });
  }

  if (!hasAnthropicApiKey()) {
    return NextResponse.json({ report: fallbackNarration(parsed.data) });
  }

  try {
    const result = await generateText({
      model: getAnthropicModel(),
      prompt: buildNarrationPrompt(parsed.data),
      maxOutputTokens: 180,
      maxRetries: 1
    });

    return NextResponse.json({ report: result.text.trim() });
  } catch {
    return NextResponse.json({ report: fallbackNarration(parsed.data) });
  }
}
