import { formatSrtTime, formatVttTime, withTiming } from "./time";
import type { Scene } from "./schema";

export type Cue = { index: number; start: number; end: number; text: string };

const SPLIT_RE = /(?<=[.!?;:])\s+/;

export function splitNarration(text: string, maxWords = 14): string[] {
  const chunks: string[] = [];
  for (const sentence of text.split(SPLIT_RE).map((s) => s.trim()).filter(Boolean)) {
    const words = sentence.split(/\s+/);
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(" "));
    }
  }
  return chunks.length ? chunks : [text];
}

export function buildCues(scenes: Scene[]): Cue[] {
  const cues: Cue[] = [];
  let index = 1;
  for (const scene of withTiming(scenes)) {
    const chunks = splitNarration(scene.narration);
    const slice = scene.seconds / chunks.length;
    chunks.forEach((text, i) => {
      const start = scene.start + i * slice;
      const end = i === chunks.length - 1 ? scene.end : start + slice;
      cues.push({ index: index++, start, end, text });
    });
  }
  return cues;
}

export function buildSrt(scenes: Scene[]): string {
  return buildCues(scenes)
    .map((cue) => `${cue.index}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}\n`)
    .join("\n");
}

export function buildVtt(scenes: Scene[]): string {
  const cues = buildCues(scenes)
    .map((cue) => `${formatVttTime(cue.start)} --> ${formatVttTime(cue.end)}\n${cue.text}\n`)
    .join("\n");
  return `WEBVTT\n\n${cues}`;
}
