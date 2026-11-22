import { z } from "zod";

export const LEVELS = ["primary", "middle", "high", "adults"] as const;
export const SCENE_KINDS = [
  "hook",
  "explanation",
  "diagram",
  "animation",
  "summary",
  "quiz",
] as const;
export const MOTIONS = ["zoom", "draw", "appear", "pan"] as const;

export const sceneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  kind: z.enum(SCENE_KINDS),
  narration: z.string().min(1).max(2000),
  visual: z.string().min(1).max(300),
  keywords: z.array(z.string().min(1)).max(12),
  motion: z.enum(MOTIONS),
  seconds: z.number().int().min(2).max(180),
});

export const quizBaseSchema = z.object({
  question: z.string().min(1),
  choices: z.array(z.string().min(1)).min(2).max(4),
  answerIndex: z.number().int().min(0),
  explanation: z.string().min(1),
  sceneId: z.string().min(1),
});

export const quizQuestionSchema = quizBaseSchema
  .refine((q) => q.answerIndex < q.choices.length, {
    message: "answerIndex must point to an existing choice",
    path: ["answerIndex"],
  });

export const storyboardSchema = z
  .object({
    title: z.string().min(1).max(160),
    level: z.enum(LEVELS),
    targetSeconds: z.number().int().min(60).max(600),
    concepts: z.array(z.string().min(1)).min(1).max(20),
    scenes: z.array(sceneSchema).min(3).max(12),
    quiz: z.array(quizQuestionSchema).min(1).max(6),
  })
  .superRefine((sb, ctx) => {
    const ids = new Set(sb.scenes.map((s) => s.id));
    if (ids.size !== sb.scenes.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Duplicate scene IDs", path: ["scenes"] });
    }
    const total = sb.scenes.reduce((sum, s) => sum + s.seconds, 0);
    if (Math.abs(total - sb.targetSeconds) > Math.max(12, sb.targetSeconds * 0.12)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The sum of scene durations (${total}s) must be close to ${sb.targetSeconds}s`,
        path: ["scenes"],
      });
    }
    for (const q of sb.quiz) {
      if (!ids.has(q.sceneId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown sceneId: ${q.sceneId}`, path: ["quiz"] });
      }
    }
  });

export const scenePatchSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  kind: z.enum(SCENE_KINDS).optional(),
  narration: z.string().optional(),
  visual: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  motion: z.enum(MOTIONS).optional(),
  seconds: z.number().int().min(2).max(180).optional(),
});

export const storyboardPatchSchema = z.object({
  reply: z.string().min(1),
  scenePatches: z.array(scenePatchSchema).default([]),
  addedScenes: z.array(sceneSchema).default([]),
  removedSceneIds: z.array(z.string()).default([]),
  title: z.string().optional(),
  quizPatches: z.array(quizBaseSchema.partial().extend({ index: z.number().int().min(0) })).default([]),
});

export type Scene = z.infer<typeof sceneSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Storyboard = z.infer<typeof storyboardSchema>;
export type StoryboardPatch = z.infer<typeof storyboardPatchSchema>;
export type Level = z.infer<typeof levelSchema>;
export type SceneKind = (typeof SCENE_KINDS)[number];
export type Motion = (typeof MOTIONS)[number];

const levelSchema = z.enum(LEVELS);
