import { DEMO_STORYBOARD } from "../demo-storyboard";
import { storyboardSchema, type Scene, type Storyboard, type StoryboardPatch } from "../schema";
import type { GenerateInput, LlmProvider, PatchInput } from "./types";

const STOP_WORDS = new Set(
  "the a an and or but for in on with by that which who what whose this these those his her its their it they we you i he she not more very like well all any each both such is are was were be been being have has had do does did can could should would may might will just also than then into about over under after before when where why how".split(
    " ",
  ),
);

function extractSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);
}

function extractKeywords(text: string, max: number): string[] {
  const words = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z]{4,}/g);
  if (!words) return [];
  const counts = new Map<string, number>();
  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([word]) => word);
}

function fitDurations(scenes: Scene[], target: number): Scene[] {
  const weights = scenes.map((scene) => Math.max(20, scene.narration.split(/\s+/).length));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;
  const values = weights.map((w) => Math.max(6, Math.round((target * w) / totalWeight)));
  let diff = target - values.reduce((sum, v) => sum + v, 0);
  while (diff !== 0) {
    const eligible = values
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => (diff > 0 ? true : v > 6))
      .sort((a, b) => (diff > 0 ? b.v - a.v : a.v - b.v));
    if (!eligible.length) break;
    values[eligible[0].i] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
  }
  return scenes.map((scene, i) => ({ ...scene, seconds: values[i] }));
}

function makeQuiz(scenes: Scene[], concepts: string[]): Storyboard["quiz"] {
  const pool = concepts.length >= 4 ? concepts : [...concepts, "nucleus", "cell", "energy", "water", "air"];
  return scenes.slice(0, 3).map((scene, index) => {
    const keyword = concepts[index] ?? pool[index] ?? concepts[0];
    const sentence = scene.narration.split(/(?<=[.!?])\s+/).find((s) => s.toLowerCase().includes(keyword)) ?? scene.narration;
    const masked = sentence.replace(new RegExp(keyword, "i"), "____");
    const distractors = pool.filter((c) => c !== keyword).slice(0, 3);
    while (distractors.length < 3) distractors.push(`option-${distractors.length + 1}`);
    return {
      question: `Complete the sentence: "${masked}"`,
      choices: [keyword, ...distractors],
      answerIndex: 0,
      explanation: sentence,
      sceneId: scene.id,
    };
  });
}

function localGenerate(input: GenerateInput): Storyboard {
  const source = input.sourceText.trim();
  if (/photosynth/i.test(source) && source.length < 320) {
    const scale = input.targetSeconds / DEMO_STORYBOARD.targetSeconds;
    const scenes = fitDurations(
      DEMO_STORYBOARD.scenes.map((s) => ({ ...s, seconds: Math.round(s.seconds * scale) })),
      input.targetSeconds,
    );
    return storyboardSchema.parse({
      ...DEMO_STORYBOARD,
      level: input.level,
      targetSeconds: input.targetSeconds,
      scenes,
    });
  }

  const rawSentences = extractSentences(source);
  const sentences = rawSentences.length >= 3 ? rawSentences : source.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 12);
  const safeSentences = sentences.length ? sentences : [source, source, source];
  const count = Math.min(7, Math.max(3, Math.round(input.targetSeconds / 30)));
  const concepts = extractKeywords(source, 6);
  const kinds: Scene["kind"][] = ["hook", "explanation", "diagram", "animation", "explanation", "summary", "quiz"];
  const motions: Scene["motion"][] = ["appear", "draw", "zoom", "pan"];

  const scenes: Scene[] = Array.from({ length: count }, (_, i) => {
    const narration = safeSentences[i % safeSentences.length];
    const words = narration.split(/\s+/).slice(0, 9).join(" ");
    return {
      id: `s${i + 1}`,
      title: words.charAt(0).toUpperCase() + words.slice(1),
      kind: i === count - 1 ? "summary" : kinds[i % kinds.length],
      narration,
      visual: `${kinds[i % kinds.length]} illustration: ${concepts.slice(0, 3).join(", ") || "key ideas"}.`,
      keywords: extractKeywords(narration, 4),
      motion: motions[i % motions.length],
      seconds: 20,
    };
  });

  return storyboardSchema.parse({
    title: safeSentences[0].split(/\s+/).slice(0, 10).join(" "),
    level: input.level,
    targetSeconds: input.targetSeconds,
    concepts: concepts.length ? concepts : ["lesson"],
    scenes: fitDurations(scenes, input.targetSeconds),
    quiz: makeQuiz(scenes, concepts.length ? concepts : ["lesson"]),
  });
}

function shorten(text: string): string {
  const first = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  return first.length > 60 ? `${first.slice(0, 57).trimEnd()}…` : first;
}

function localPatch({ storyboard, message }: PatchInput): StoryboardPatch {
  const m = message.toLowerCase();
  const notes: string[] = [];
  const original = storyboard.scenes;
  let scenes = original.map((s) => ({ ...s }));

  if (/shorter|shorten|brief|concise/.test(m)) {
    scenes = scenes.map((s) => ({ ...s, narration: shorten(s.narration), seconds: Math.max(8, Math.round(s.seconds * 0.75)) }));
    notes.push("I shortened each narration and reduced scene durations.");
  }
  if (/longer|expand|more detail|detailed/.test(m)) {
    scenes = scenes.map((s) => ({ ...s, seconds: Math.round(s.seconds * 1.25) }));
    notes.push("I gave each scene more time on screen.");
  }
  if (/diagram|schema|draw|illustration/.test(m)) {
    let changed = 0;
    scenes = scenes.map((s) => {
      if (changed < 2 && (s.kind === "explanation" || s.kind === "animation")) {
        changed++;
        return { ...s, kind: "diagram" as const, visual: `Flow diagram: ${s.keywords.slice(0, 3).join(" → ") || "key steps"}.`, motion: "draw" as const };
      }
      return s;
    });
    notes.push(`I turned ${changed} scene(s) into animated diagrams.`);
  }
  if (/slower|slow down/.test(m)) {
    scenes = scenes.map((s) => ({ ...s, seconds: Math.round(s.seconds * 1.2) }));
    notes.push("I slowed down the voiceover.");
  }
  if (/faster|speed up/.test(m)) {
    scenes = scenes.map((s) => ({ ...s, seconds: Math.max(8, Math.round(s.seconds * 0.85)) }));
    notes.push("I sped up the voiceover.");
  }

  const replace = message.match(/replace\s+"?([^"]+)"?\s+(?:with|by)\s+"?([^"]+)"?/i);
  if (replace) {
    const [, from, to] = replace;
    scenes = scenes.map((s) => ({ ...s, narration: s.narration.replace(new RegExp(from, "gi"), to) }));
    notes.push(`I replaced "${from}" with "${to}" in the narration.`);
  }

  const removal = message.match(/(?:remove|delete|drop)\s+(?:scene\s+)?(\d+|s\d+)/i);
  if (removal && scenes.length > 3) {
    const token = removal[1];
    const index = /^\d+$/.test(token) ? Number(token) - 1 : scenes.findIndex((s) => s.id === token);
    if (index >= 0 && index < scenes.length) {
      scenes = scenes.filter((_, i) => i !== index);
      notes.push("I removed the requested scene.");
    }
  }

  if (/add/.test(m) && scenes.length < 11) {
    scenes.push({
      id: `s${Date.now().toString(36).slice(-5)}`,
      title: "Going further",
      kind: "summary",
      narration: `To remember the essentials, review the key ideas: ${storyboard.concepts.slice(0, 4).join(", ")}.`,
      visual: "An animated list of the key takeaways.",
      keywords: storyboard.concepts.slice(0, 4),
      motion: "appear",
      seconds: 18,
    });
    notes.push("I added a summary scene.");
  }

  if (!notes.length) {
    scenes = scenes.map((s) => ({ ...s, narration: shorten(s.narration) }));
    notes.push("I applied your request and tightened the relevant narration.");
  }

  const touchedSceneIds = scenes
    .filter((scene) => {
      const before = original.find((s) => s.id === scene.id);
      return !before || JSON.stringify(before) !== JSON.stringify(scene);
    })
    .map((s) => s.id);

  return {
    reply: notes.join(" "),
    scenePatches: scenes.map(({ id, title, kind, narration, visual, keywords, motion, seconds }) => ({
      id,
      title,
      kind,
      narration,
      visual,
      keywords,
      motion,
      seconds,
    })),
    addedScenes: [],
    removedSceneIds: original.filter((s) => !scenes.some((n) => n.id === s.id)).map((s) => s.id),
    quizPatches: [],
  };
}

export const demoLlm: LlmProvider = {
  name: "local-demo",
  async generate(input) {
    return localGenerate(input);
  },
  async patch(input) {
    return localPatch(input);
  },
};

export { localGenerate, localPatch };
