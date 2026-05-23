import { anthropic } from "@ai-sdk/anthropic";

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

export function hasAnthropicApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropicModel() {
  return anthropic(process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL);
}
