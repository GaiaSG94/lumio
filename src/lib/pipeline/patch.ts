import { storyboardSchema, type Storyboard, type StoryboardPatch } from "../schema";

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyPatch(
  storyboard: Storyboard,
  patch: StoryboardPatch,
): { storyboard: Storyboard; touchedSceneIds: string[] } {
  const before = new Map(storyboard.scenes.map((scene) => [scene.id, scene]));
  let scenes = storyboard.scenes.map((scene) => ({ ...scene }));

  for (const change of patch.scenePatches) {
    const index = scenes.findIndex((scene) => scene.id === change.id);
    if (index < 0) continue;
    const { id: _id, ...fields } = change;
    const defined = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    scenes[index] = { ...scenes[index], ...defined };
  }

  for (const removed of patch.removedSceneIds) {
    if (scenes.length > 3) scenes = scenes.filter((scene) => scene.id !== removed);
  }
  scenes.push(...patch.addedScenes.map((scene) => ({ ...scene })));
  if (scenes.length < 3) scenes = storyboard.scenes.map((scene) => ({ ...scene }));

  const ids = new Set(scenes.map((scene) => scene.id));
  let quiz = storyboard.quiz.filter((q) => ids.has(q.sceneId)).map((q) => ({ ...q }));
  if (!quiz.length) {
    quiz = [
      {
        question: `What is the subject of "${storyboard.title}"?`,
        choices: [...storyboard.concepts.slice(0, 3), "None of these answers"],
        answerIndex: 0,
        explanation: storyboard.concepts[0],
        sceneId: scenes[0].id,
      },
    ];
  }
  for (const change of patch.quizPatches) {
    const target = quiz[change.index];
    if (!target) continue;
    const { index: _index, ...fields } = change;
    const defined = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
    quiz[change.index] = { ...target, ...defined };
  }
  quiz = quiz.map((q) => ({ ...q, answerIndex: clamp(q.answerIndex, 0, Math.max(0, q.choices.length - 1)) }));

  const total = clamp(scenes.reduce((sum, scene) => sum + scene.seconds, 0), 60, 600);
  const next = storyboardSchema.parse({
    ...storyboard,
    ...(patch.title ? { title: patch.title } : {}),
    scenes,
    quiz,
    targetSeconds: total,
  });

  const touched = scenes
    .filter((scene) => !same(before.get(scene.id), scene))
    .map((scene) => scene.id);

  return { storyboard: next, touchedSceneIds: touched };
}
