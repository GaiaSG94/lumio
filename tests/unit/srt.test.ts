import { describe, expect, it } from "vitest";
import { DEMO_STORYBOARD } from "@/lib/demo-storyboard";
import { buildCues, buildSrt, buildVtt, splitNarration } from "@/lib/srt";
import { formatClock, formatSrtTime, withTiming } from "@/lib/time";

describe("subtitle generation", () => {
  const srt = buildSrt(DEMO_STORYBOARD.scenes);

  it("produces numbered, chronological cues", () => {
    const cues = buildCues(DEMO_STORYBOARD.scenes);
    expect(cues.length).toBeGreaterThan(DEMO_STORYBOARD.scenes.length);
    expect(cues[0].index).toBe(1);
    for (let i = 1; i < cues.length; i++) expect(cues[i].start).toBeGreaterThanOrEqual(cues[i - 1].end);
    expect(cues.at(-1)!.end).toBe(180);
  });

  it("respects the SRT format", () => {
    expect(srt).toContain("1\n00:00:00,000 --> ");
    expect(srt).toMatch(/\d\d:\d\d:\d\d,\d{3}/);
  });

  it("produces a VTT with its header", () => {
    expect(buildVtt(DEMO_STORYBOARD.scenes).startsWith("WEBVTT\n\n")).toBe(true);
  });

  it("splits narration into readable chunks", () => {
    expect(splitNarration("First sentence. Second sentence that is a bit longer.", 4).length).toBeGreaterThan(1);
  });

  it("formats timestamps", () => {
    expect(formatSrtTime(75.25)).toBe("00:01:15,250");
    expect(formatClock(125)).toBe("2:05");
    const timed = withTiming(DEMO_STORYBOARD.scenes);
    expect(timed[1].start).toBe(24);
  });
});
