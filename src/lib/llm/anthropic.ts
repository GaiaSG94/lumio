import { storyboardSchema, storyboardPatchSchema, type Storyboard, type StoryboardPatch } from "../schema";
import { parseLlmJson } from "./json";
import { patchInstructions, storyboardInstructions } from "./prompts";
import type { GenerateInput, LlmProvider, PatchInput } from "./types";

const API_URL = "https://api.anthropic.com/v1/messages";
const MAX_TOKENS = 4096;

async function ask(system: string, payload: unknown, apiKey: string, model: string): Promise<unknown> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    }),
  });
  if (!response.ok) {
    throw new Error(`Anthropic HTTP ${response.status}`);
  }
  const data = (await response.json()) as { content?: { type: string; text?: string; input?: unknown }[] };
  const block = data.content?.find((c) => c.type === "tool_use");
  const text = block?.input ?? data.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Empty LLM response");
  return parseLlmJson(text);
}

export const anthropicLlm: LlmProvider = {
  name: "anthropic",
  async generate(input: GenerateInput): Promise<Storyboard> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await ask(storyboardInstructions(), { ...input, level: input.level, targetSeconds: input.targetSeconds }, apiKey, model);
      const parsed = storyboardSchema.safeParse(raw);
      if (parsed.success) return parsed.data;
    }
    throw new Error("The LLM did not produce a valid storyboard");
  },
  async patch(input: PatchInput): Promise<StoryboardPatch> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await ask(patchInstructions(), input, apiKey, model);
      const parsed = storyboardPatchSchema.safeParse(raw);
      if (parsed.success) return parsed.data;
    }
    throw new Error("The LLM did not produce a valid patch");
  },
};
