"use client";

import { useMemo } from "react";
import { buildCues } from "@/lib/srt";
import type { Storyboard } from "@/lib/schema";
import { findSceneAt, formatClock, withTiming } from "@/lib/time";

export function SceneStage({ storyboard, time, subtitles = true }: { storyboard: Storyboard; time: number; subtitles?: boolean }) {
  const timed = useMemo(() => withTiming(storyboard.scenes), [storyboard]);
  const scene = findSceneAt(timed, time) ?? timed[timed.length - 1];
  const index = timed.findIndex((s) => s.id === scene.id);
  const cue = useMemo(() => buildCues(storyboard.scenes).find((c) => time >= c.start && time < c.end), [storyboard, time]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card bg-lavender-50 shadow-soft" data-testid="scene-stage">
      <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-violet-300/50 blur-3xl" />
      <div className="absolute -bottom-28 -right-10 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-lavender-50 to-violet-100/80" />

      <div key={scene.id} className="absolute inset-0 flex animate-appear flex-col justify-center gap-[1.2vh] px-[6%] py-[5%]">
        <span className="text-[clamp(9px,1.5vw,16px)] font-bold uppercase tracking-[.18em] text-violet-700">
          {storyboard.title} · {index + 1}/{timed.length}
        </span>
        <h3 className="max-w-[92%] font-title text-[clamp(18px,4.1vw,52px)] font-bold leading-tight tracking-tight text-ink">{scene.title}</h3>
        <p className="max-w-[90%] text-[clamp(11px,2vw,24px)] leading-relaxed text-ink-2">{scene.narration}</p>
        <div className="mt-[1vh] flex flex-wrap gap-[0.8vw]">
          {scene.keywords.slice(0, 4).map((word, i) => (
            <span key={`${word}-${i}`} className="rounded-full border border-violet-100 bg-white/80 px-[1.4vw] py-[0.5vh] text-[clamp(9px,1.4vw,17px)] font-semibold text-violet-800">
              {word}
            </span>
          ))}
        </div>
      </div>

      {subtitles && cue ? (
        <p className="absolute bottom-[7%] left-1/2 max-w-[86%] -translate-x-1/2 rounded-lg bg-ink/85 px-3 py-1.5 text-center text-[clamp(9px,1.6vw,18px)] text-white" data-testid="subtitle">
          {cue.text}
        </p>
      ) : null}

      <span className="absolute bottom-2 right-3 text-[10px] font-bold tracking-tight text-violet-700/70">Lumio</span>
      <span className="sr-only">Scene {index + 1} of {timed.length}, {formatClock(scene.start)} to {formatClock(scene.end)}</span>
    </div>
  );
}
