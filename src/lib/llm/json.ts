export function parseLlmJson(raw: unknown): unknown {
  if (typeof raw === "object" && raw !== null) return raw;
  if (typeof raw !== "string") throw new Error("Unreadable LLM response");
  return JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
}
