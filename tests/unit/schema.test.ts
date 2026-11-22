import { describe, expect, it } from "vitest";
import { DEMO_STORYBOARD } from "@/lib/demo-storyboard";
import { storyboardSchema } from "@/lib/schema";

describe("schéma du storyboard", () => {
  it("accepte le storyboard de démonstration", () => {
    expect(DEMO_STORYBOARD.scenes).toHaveLength(6);
    expect(storyboardSchema.safeParse(DEMO_STORYBOARD).success).toBe(true);
  });

  it("refuse une somme de durées incohérente", () => {
    const invalid = { ...DEMO_STORYBOARD, scenes: DEMO_STORYBOARD.scenes.map((s) => ({ ...s, seconds: 2 })) };
    const result = storyboardSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("refuse des identifiants de scènes dupliqués", () => {
    const scenes = DEMO_STORYBOARD.scenes.map((s, i) => (i === 1 ? { ...s, id: "s1" } : s));
    expect(storyboardSchema.safeParse({ ...DEMO_STORYBOARD, scenes }).success).toBe(false);
  });

  it("refuse une réponse de quiz hors du tableau de choix", () => {
    const quiz = DEMO_STORYBOARD.quiz.map((q, i) => (i === 0 ? { ...q, answerIndex: 9 } : q));
    expect(storyboardSchema.safeParse({ ...DEMO_STORYBOARD, quiz }).success).toBe(false);
  });
});
