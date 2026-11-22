"use client";

import { Pause, Play } from "lucide-react";
import { formatClock, withTiming } from "@/lib/time";
import type { Storyboard } from "@/lib/schema";

export function PlayerControls({
  storyboard,
  time,
  playing,
  onToggle,
  onSeek,
}: {
  storyboard: Storyboard;
  time: number;
  playing: boolean;
  onToggle: () => void;
  onSeek: (time: number) => void;
}) {
  const total = storyboard.scenes.reduce((sum, scene) => sum + scene.seconds, 0);
  const timed = withTiming(storyboard.scenes);

  return (
    <div className="mt-3">
      <div className="relative h-6" role="group" aria-label="Barre de progression">
        <div className="absolute inset-x-0 top-2.5 h-1 rounded-full bg-violet-100" />
        <div className="absolute left-0 top-2.5 h-1 rounded-full bg-violet-600" style={{ width: `${Math.min(100, (time / total) * 100)}%` }} />
        {timed.slice(1).map((scene) => (
          <span key={scene.id} className="absolute top-1.5 h-2 w-0.5 rounded bg-violet-300" style={{ left: `${(scene.start / total) * 100}%` }} aria-hidden="true" />
        ))}
        <input
          type="range"
          min={0}
          max={total}
          step={0.5}
          value={Math.min(time, total)}
          onChange={(event) => onSeek(Number(event.target.value))}
          aria-label="Position dans la vidéo"
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
      </div>
      <div className="mt-1 flex items-center gap-3">
        <button type="button" onClick={onToggle} aria-label={playing ? "Mettre en pause" : "Lire la vidéo"} className="grid size-11 place-items-center rounded-full bg-violet-600 text-white hover:bg-violet-700">
          {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
        <span className="text-sm font-medium tabular-nums text-encre-2" data-testid="horodatage">
          {formatClock(time)} / {formatClock(total)}
        </span>
      </div>
    </div>
  );
}
