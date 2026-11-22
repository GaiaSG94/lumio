import { getLlm } from "../llm";
import { getTts } from "../tts";
import { buildSrt, buildVtt } from "../srt";
import { store } from "../storage";
import type { GenerationJob, Project, StepName, StepState } from "../types";
import { STEP_ORDER } from "../types";
import type { Storyboard } from "../schema";

function makeJob(step: StepName, states: Partial<Record<StepName, StepState>>, progress: number, active: boolean): GenerationJob {
  const all = Object.fromEntries(STEP_ORDER.map((s) => [s, "attente"])) as Record<StepName, StepState>;
  for (const [key, value] of Object.entries(states)) all[key as StepName] = value;
  return { active, step, steps: all, progress };
}

function advance(step: StepName, next: StepName, done: StepName[], progress: number): GenerationJob {
  const states = Object.fromEntries(done.map((s) => [s, "fait"])) as Record<StepName, StepState>;
  states[step] = "fait";
  states[next] = "encours";
  return makeJob(next, states, progress, true);
}

async function synthesize(storyboard: Storyboard, projectId: string) {
  const tts = getTts();
  const audio: Record<string, string> = {};
  const durations: Record<string, number> = {};
  for (const scene of storyboard.scenes) {
    const result = await tts.speak({ text: scene.narration, projectId, sceneId: scene.id });
    if (result.url) audio[scene.id] = result.url;
    durations[scene.id] = result.duration;
  }
  const recalibrate = tts.name !== "local-silence";
  const scenes = storyboard.scenes.map((scene) => ({
    ...scene,
    seconds: recalibrate ? Math.max(6, Math.round((durations[scene.id] ?? scene.seconds) + 1.5)) : scene.seconds,
  }));
  return { audio, durations, scenes };
}

export function buildAssets(storyboard: Storyboard, audio: Record<string, string>, durations: Record<string, number>) {
  return {
    audio,
    durations,
    srt: buildSrt(storyboard.scenes),
    vtt: buildVtt(storyboard.scenes),
    transcript: storyboard.scenes.map((s) => `## ${s.title}\n${s.narration}`).join("\n\n"),
    totalDuration: storyboard.scenes.reduce((sum, s) => sum + s.seconds, 0),
  };
}

export async function runGeneration(projectId: string): Promise<void> {
  const project = await store.get(projectId);
  if (!project || project.job.active) return;

  await store.update(projectId, (p) => ({
    ...p,
    status: "generation",
    job: makeJob("script", { script: "encours" }, 8, true),
  }));

  try {
    const current = await store.get(projectId);
    if (!current) return;
    const storyboard = await getLlm().generate({
      sourceText: current.sourceText,
      level: current.level as Storyboard["level"],
      targetSeconds: current.targetSeconds,
    });

    await store.update(projectId, (p) => ({
      ...p,
      title: storyboard.title,
      versions: [
        {
          version: 1,
          storyboard,
          createdAt: new Date().toISOString(),
          note: "Génération initiale",
          touchedSceneIds: storyboard.scenes.map((s) => s.id),
        },
      ],
      job: advance("script", "voix", ["script"], 28),
    }));

    const { audio, durations, scenes } = await synthesize(storyboard, projectId);
    const voiced: Storyboard = { ...storyboard, scenes };

    await store.update(projectId, (p) => ({
      ...p,
      versions: p.versions.map((v) => (v.version === 1 ? { ...v, storyboard: voiced } : v)),
      job: advance("voix", "visuels", ["script", "voix"], 55),
    }));

    await store.update(projectId, (p) => ({
      ...p,
      job: advance("visuels", "montage", ["script", "voix", "visuels"], 72),
    }));

    await store.update(projectId, (p) => ({
      ...p,
      job: advance("montage", "soustitres", ["script", "voix", "visuels", "montage"], 88),
    }));

    await store.update(projectId, (p) => ({
      ...p,
      assets: buildAssets(voiced, audio, durations),
      status: "pret",
      updatedAt: new Date().toISOString(),
      job: makeJob("soustitres", Object.fromEntries(STEP_ORDER.map((s) => [s, "fait"])), 100, false),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    await store.update(projectId, (p) => ({
      ...p,
      status: "erreur",
      job: { ...p.job, active: false, error: message },
    }));
  }
}
