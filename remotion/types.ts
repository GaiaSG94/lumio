export type LumioScene = {
  id: string;
  title: string;
  kind: "hook" | "explanation" | "diagram" | "animation" | "summary" | "quiz";
  narration: string;
  visual: string;
  keywords: string[];
  motion: "zoom" | "draw" | "appear" | "pan";
  seconds: number;
};

export type LumioStoryboard = {
  title: string;
  level: string;
  targetSeconds: number;
  concepts: string[];
  scenes: LumioScene[];
  quiz: { question: string; choices: string[]; answerIndex: number; explanation: string; sceneId: string }[];
};

export const FPS = 30;
