import type { Storyboard } from "./schema";

export type ProjectStatus = "draft" | "generating" | "ready" | "error";
export type StepName = "script" | "voice" | "visuals" | "rendering" | "subtitles";
export type StepState = "pending" | "running" | "done" | "error";

export type GenerationJob = {
  active: boolean;
  step: StepName;
  steps: Record<StepName, StepState>;
  progress: number;
  error?: string;
};

export type StoryboardVersion = {
  version: number;
  storyboard: Storyboard;
  createdAt: string;
  note: string;
  touchedSceneIds: string[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "lumio";
  content: string;
  createdAt: string;
  steps?: string[];
};

export type Assets = {
  audio: Record<string, string>;
  durations: Record<string, number>;
  srt: string;
  vtt: string;
  transcript: string;
  totalDuration: number;
  videoUrl?: string;
};

export type QuizResult = {
  id: string;
  firstName?: string;
  score: number;
  total: number;
  createdAt: string;
  answers: number[];
};

export type Project = {
  id: string;
  slug: string;
  sourceText: string;
  level: string;
  targetSeconds: number;
  title: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  versions: StoryboardVersion[];
  messages: ChatMessage[];
  assets: Assets | null;
  job: GenerationJob;
  quizResults: QuizResult[];
};

export type CreateProjectInput = {
  sourceText: string;
  level: string;
  targetSeconds: number;
};

export const STEP_ORDER: StepName[] = ["script", "voice", "visuals", "rendering", "subtitles"];

export const STEP_LABELS: Record<StepName, string> = {
  script: "Script",
  voice: "Voiceover",
  visuals: "Visuals",
  rendering: "Rendering",
  subtitles: "Subtitles",
};
