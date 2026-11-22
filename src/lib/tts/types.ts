export type SpeakInput = {
  text: string;
  projectId: string;
  sceneId: string;
};

export type SpeakResult = {
  url: string | null;
  duration: number;
  provider: string;
};

export interface TtsProvider {
  readonly name: string;
  speak(input: SpeakInput): Promise<SpeakResult>;
}

export function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 2.4) + 1);
}
