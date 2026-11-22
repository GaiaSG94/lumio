import { anthropicLlm } from "./anthropic";
import { demoLlm } from "./demo";
import { gatewayLlm } from "./gateway";
import type { LlmProvider } from "./types";

export function getLlm(): LlmProvider {
  if (process.env.ANTHROPIC_API_KEY) return anthropicLlm;
  if (process.env.INFERHUB_API_KEY || process.env.ENV_USER_INFERHUB_API_KEY) return gatewayLlm;
  return demoLlm;
}

export type { LlmProvider, GenerateInput, PatchInput } from "./types";
