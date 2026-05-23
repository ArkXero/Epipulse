import { streamText } from "ai";
import { fallbackAdvice } from "@/lib/ai/fallbacks";
import { getAnthropicModel, hasAnthropicApiKey } from "@/lib/ai/provider";
import { advisorSystemPrompt, buildAdvisorPrompt } from "@/lib/ai/prompts";
import { advisorRequestSchema } from "@/lib/ai/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = advisorRequestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response("No valid simulation snapshot was provided.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  if (!hasAnthropicApiKey()) {
    return new Response(fallbackAdvice(parsed.data), {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  try {
    const result = streamText({
      model: getAnthropicModel(),
      system: advisorSystemPrompt,
      prompt: buildAdvisorPrompt(parsed.data),
      maxOutputTokens: 420,
      maxRetries: 1
    });

    return result.toTextStreamResponse();
  } catch {
    return new Response(fallbackAdvice(parsed.data), {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
