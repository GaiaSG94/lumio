import { describe, expect, it } from "vitest";
import { DEMO_STORYBOARD } from "@/lib/demo-storyboard";
import { localGenerate, localPatch } from "@/lib/llm/demo";
import { applyPatch } from "@/lib/pipeline/patch";
import type { StoryboardPatch } from "@/lib/schema";

describe("patch par chat", () => {
  it("ne marque que la scène réellement modifiée", () => {
    const before = DEMO_STORYBOARD.scenes[2];
    const patch: StoryboardPatch = {
      reply: "J'ai modifié la scène 3.",
      scenePatches: [{ id: "s3", narration: "Nouvelle narration pour la scène trois." }],
      addedScenes: [],
      removedSceneIds: [],
      quizPatches: [],
    };
    const result = applyPatch(DEMO_STORYBOARD, patch);
    expect(result.touchedSceneIds).toEqual(["s3"]);
    expect(result.storyboard.scenes[2].narration).toBe("Nouvelle narration pour la scène trois.");
    expect(result.storyboard.scenes[0]).toEqual(DEMO_STORYBOARD.scenes[0]);
    expect(before.narration).not.toBe(result.storyboard.scenes[2].narration);
  });

  it("génère un patch « plus court » valide et appliquable", () => {
    const patch = localPatch({ storyboard: DEMO_STORYBOARD, message: "Plus court" });
    const result = applyPatch(DEMO_STORYBOARD, patch);
    expect(result.storyboard.scenes.length).toBe(DEMO_STORYBOARD.scenes.length);
    expect(result.storyboard.scenes[0].narration.length).toBeLessThan(DEMO_STORYBOARD.scenes[0].narration.length);
    expect(result.storyboard.scenes.reduce((sum, s) => sum + s.seconds, 0)).toBe(result.storyboard.targetSeconds);
  });

  it("transforme des scènes en schéma sans toucher à l'accroche", () => {
    const patch = localPatch({ storyboard: DEMO_STORYBOARD, message: "Plus de schémas" });
    const result = applyPatch(DEMO_STORYBOARD, patch);
    expect(result.storyboard.scenes[0].kind).toBe("accroche");
    expect(result.storyboard.scenes.filter((s) => s.kind === "schema").length).toBeGreaterThan(1);
  });
});

describe("génération locale sans clé", () => {
  it("produit un storyboard valide à partir d'un texte arbitraire", () => {
    const text =
      "Le volcan entre en éruption lorsque le magma remonte. Le magma est une roche fondue. Les gaz s'échappent et la lave coule sur les pentes. Cette éruption peut former un nouveau cratère.";
    const storyboard = localGenerate({ sourceText: text, level: "college", targetSeconds: 180 });
    expect(storyboard.scenes.length).toBeGreaterThanOrEqual(3);
    expect(storyboard.scenes.reduce((sum, s) => sum + s.seconds, 0)).toBe(180);
    expect(storyboard.quiz.length).toBe(3);
    for (const scene of storyboard.scenes) {
      expect(text).toContain(scene.narration.slice(0, 20));
    }
  });
});
