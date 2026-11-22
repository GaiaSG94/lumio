import { newId } from "../ids";
import { getLlm } from "../llm";
import { getTts } from "../tts";
import { store } from "../storage";
import type { Project } from "../types";
import { buildAssets } from "./generate";
import { applyPatch } from "./patch";

export async function chatUpdate(projectId: string, message: string): Promise<Project | null> {
  const project = await store.get(projectId);
  if (!project || !project.versions.length) return null;

  const current = project.versions[project.versions.length - 1].storyboard;
  const patch = await getLlm().patch({ storyboard: current, message });
  const { storyboard, touchedSceneIds } = applyPatch(current, patch);

  const audio = { ...(project.assets?.audio ?? {}) };
  const durations = { ...(project.assets?.durations ?? {}) };
  const tts = getTts();
  for (const sceneId of touchedSceneIds) {
    const scene = storyboard.scenes.find((s) => s.id === sceneId);
    if (!scene) continue;
    const result = await tts.speak({ text: scene.narration, projectId, sceneId });
    if (result.url) audio[sceneId] = result.url;
    durations[sceneId] = result.duration;
  }

  const now = new Date().toISOString();
  const labels = touchedSceneIds.map((id) => {
    const index = storyboard.scenes.findIndex((s) => s.id === id);
    return `Scène ${index + 1} · ${storyboard.scenes[index]?.title ?? id}`;
  });

  return store.update(projectId, (p) => ({
    ...p,
    title: storyboard.title,
    versions: [
      ...p.versions,
      {
        version: p.versions.length + 1,
        storyboard,
        createdAt: now,
        note: message,
        touchedSceneIds,
      },
    ],
    messages: [
      ...p.messages,
      { id: newId("u-"), role: "utilisateur", content: message, createdAt: now },
      { id: newId("l-"), role: "lumio", content: patch.reply, createdAt: now, steps: labels },
    ],
    assets: buildAssets(storyboard, audio, durations),
    status: "pret",
    updatedAt: now,
  }));
}
