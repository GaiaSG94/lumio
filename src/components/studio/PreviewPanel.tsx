"use client";

import { Loader2 } from "lucide-react";
import { PlayerControls } from "@/components/player/PlayerControls";
import { SceneStage } from "@/components/player/SceneStage";
import type { Storyboard } from "@/lib/schema";
import { formatClock, withTiming } from "@/lib/time";
import type { GenerationJob } from "@/lib/types";
import { STEP_LABELS, STEP_ORDER } from "@/lib/types";

export function PreviewPanel({
  storyboard,
  version,
  time,
  playing,
  onToggle,
  onSeek,
  job,
}: {
  storyboard: Storyboard | null;
  version: number;
  time: number;
  playing: boolean;
  onToggle: () => void;
  onSeek: (time: number) => void;
  job: GenerationJob;
}) {
  if (!storyboard) {
    return (
      <section className="rounded-card border border-violet-100 bg-white p-8 text-center shadow-soft" data-testid="preview-waiting">
        <Loader2 size={28} className="mx-auto animate-spin text-violet-600" />
        <h2 className="mt-4 font-title text-xl font-bold">Lumio is preparing your video</h2>
        <p className="mt-1 text-sm text-ink-2">Step {job.progress}%</p>
        <ul className="mx-auto mt-5 flex max-w-sm flex-wrap justify-center gap-2">
          {STEP_ORDER.map((step) => (
            <li key={step} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">{STEP_LABELS[step]}</li>
          ))}
        </ul>
      </section>
    );
  }

  const timed = withTiming(storyboard.scenes);
  const total = timed[timed.length - 1].end;

  return (
    <section aria-label="Video preview">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-title text-lg font-bold">Preview</h2>
        <span className="pastille" data-testid="version">Version {version} · {formatClock(total)}</span>
      </div>
      <SceneStage storyboard={storyboard} time={time} />
      <PlayerControls storyboard={storyboard} time={time} playing={playing} onToggle={onToggle} onSeek={onSeek} />

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-ink-2">Scenes</h3>
        <div className="flex gap-2 overflow-x-auto pb-2" data-testid="scene-strip">
          {timed.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSeek(scene.start)}
              className="w-36 shrink-0 rounded-xl border border-violet-100 bg-white p-2 text-left transition-colors hover:border-violet-300 hover:bg-violet-100/40"
              aria-label={`Go to scene ${index + 1}: ${scene.title}`}
            >
              <span className="block h-1.5 w-full rounded-full bg-violet-100">
                <span className="block h-1.5 rounded-full bg-violet-600" style={{ width: `${(scene.seconds / total) * 100}%` }} />
              </span>
              <span className="mt-1.5 block text-[11px] font-semibold tabular-nums text-violet-700">{formatClock(scene.start)}</span>
              <span className="mt-0.5 block truncate text-xs font-medium text-ink">{scene.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
