export function storyboardInstructions(): string {
  return `You write a storyboard for an educational video. Reply with ONE valid JSON object only.
Exact format:
{
  "title": string,
  "level": "primary"|"middle"|"high"|"adults",
  "targetSeconds": number,
  "concepts": string[],
  "scenes": [{ "id": "s1", "title": string, "kind": "hook"|"explanation"|"diagram"|"animation"|"summary"|"quiz",
     "narration": string, "visual": string, "keywords": string[],
     "motion": "zoom"|"draw"|"appear"|"pan", "seconds": number }],
  "quiz": [{ "question": string, "choices": string[4], "answerIndex": number,
     "explanation": string, "sceneId": string }]
}
Rules: use ONLY facts from the source text, invent no facts. Write the narration in clear, spoken English.
Use 4 to 8 scenes. The sum of seconds must equal the requested target duration. Every quiz sceneId must exist.`;
}

export function patchInstructions(): string {
  return `You edit an educational video storyboard according to the user's request.
Reply with ONE valid JSON object only:
{
  "reply": string (short reply in English, one or two sentences),
  "scenePatches": [{ "id": string, ...only the fields to change among title, kind, narration, visual, keywords, motion, seconds }],
  "addedScenes": [],
  "removedSceneIds": [],
  "title": optional string,
  "quizPatches": []
}
Include in scenePatches only the scenes that actually changed. Invent no new facts.
Keep the same scene IDs as the ones provided.`;
}
