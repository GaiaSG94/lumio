import { storyboardSchema, storyboardPatchSchema, type Storyboard, type StoryboardPatch } from "../schema";
import { parseLlmJson } from "./json";
import { storyboardInstructions, patchInstructions } from "./prompts";
import type { GenerateInput, LlmProvider, PatchInput } from "./types";

const DEFAULT_BASE_URL = "https://api.inferhub.dev/v1";
const DEFAULT_MODEL = "combo/cheap";

function config() {
  const apiKey = process.env.INFERHUB_API_KEY || process.env.ENV_USER_INFERHUB_API_KEY;
  if (!apiKey) throw new Error("INFERHUB_API_KEY manquante");
  return {
    apiKey,
    baseUrl: (process.env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ""),
    model: process.env.LLM_MODEL || DEFAULT_MODEL,
  };
}

async function ask(system: string, payload: unknown): Promise<unknown> {
  const { apiKey, baseUrl, model } = config();
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      "x-max-input-price": process.env.LLM_MAX_INPUT_PRICE || "0.01",
      "x-max-output-price": process.env.LLM_MAX_OUTPUT_PRICE || "0.05",
    },
    signal: AbortSignal.timeout(90_000),
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Routeur LLM HTTP ${response.status}`);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Réponse LLM vide");
  return parseLlmJson(text);
}

export const gatewayLlm: LlmProvider = {
  name: "inferhub-gateway",
  async generate(input: GenerateInput): Promise<Storyboard> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const parsed = storyboardSchema.safeParse(await ask(storyboardInstructions(), input));
      if (parsed.success) return parsed.data;
    }
    throw new Error("Le routeur n'a pas produit un storyboard valide");
  },
  async patch(input: PatchInput): Promise<StoryboardPatch> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const parsed = storyboardPatchSchema.safeParse(await ask(patchInstructions(), input));
      if (parsed.success) return parsed.data;
    }
    throw new Error("Le routeur n'a pas produit un patch valide");
  },
};
