import type { Level, Storyboard, StoryboardPatch } from "../schema";

export type GenerateInput = {
  sourceText: string;
  level: Level;
  targetSeconds: number;
};

export type PatchInput = {
  storyboard: Storyboard;
  message: string;
};

export interface LlmProvider {
  readonly name: string;
  generate(input: GenerateInput): Promise<Storyboard>;
  patch(input: PatchInput): Promise<StoryboardPatch>;
}
