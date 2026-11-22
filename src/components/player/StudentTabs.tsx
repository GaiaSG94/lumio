"use client";

import { useState } from "react";
import { buildCues } from "@/lib/srt";
import type { Storyboard } from "@/lib/schema";
import { formatClock, withTiming } from "@/lib/time";

export type Note = { id: string; time: number; text: string };

export function ChaptersPanel({ storyboard, time, onSeek }: { storyboard: Storyboard; time: number; onSeek: (time: number) => void }) {
  const timed = withTiming(storyboard.scenes);
  return (
    <ul className="space-y-2" data-testid="chapters">
      {timed.map((scene, index) => {
        const state = time >= scene.end ? "Watched" : time >= scene.start ? "In progress" : "Up next";
        return (
          <li key={scene.id}>
            <button type="button" onClick={() => onSeek(scene.start)} className="flex w-full items-center gap-3 rounded-xl border border-violet-100 bg-white p-3 text-left hover:bg-violet-100/50">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{scene.title}</span>
                <span className="block text-xs text-ink-2">{formatClock(scene.start)} · {state}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function TranscriptPanel({ storyboard, time, onSeek }: { storyboard: Storyboard; time: number; onSeek: (time: number) => void }) {
  const cues = buildCues(storyboard.scenes);
  return (
    <div className="space-y-1" data-testid="transcript">
      {cues.map((cue) => {
        const active = time >= cue.start && time < cue.end;
        return (
          <button key={cue.index} type="button" onClick={() => onSeek(cue.start)} className={`flex w-full gap-3 rounded-lg p-2 text-left text-sm leading-relaxed ${active ? "bg-violet-100 font-semibold text-violet-800" : "text-ink-2 hover:bg-white"}`}>
            <span className="shrink-0 tabular-nums text-violet-700">{formatClock(cue.start)}</span>
            <span>{cue.text}</span>
          </button>
        );
      })}
    </div>
  );
}

export function NotesPanel({
  notes,
  time,
  onAdd,
  onRemove,
  onSeek,
}: {
  notes: Note[];
  time: number;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onSeek: (time: number) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div data-testid="notes">
      <form
        onSubmit={(event) => { event.preventDefault(); if (value.trim()) { onAdd(value.trim()); setValue(""); } }}
        className="flex gap-2"
      >
        <label htmlFor="note" className="sr-only">New note</label>
        <input id="note" value={value} onChange={(event) => setValue(event.target.value)} placeholder={`Note at ${formatClock(time)}…`} className="min-h-11 flex-1 rounded-[10px] border border-violet-100 bg-white px-3 text-sm outline-none" />
        <button type="submit" disabled={!value.trim()} className="btn-primary px-4">Add</button>
      </form>
      <ul className="mt-3 space-y-2">
        {notes.length === 0 ? <li className="text-sm text-ink-2">No notes yet.</li> : null}
        {notes.map((note) => (
          <li key={note.id} className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white p-3 text-sm">
            <button type="button" onClick={() => onSeek(note.time)} className="shrink-0 rounded-full bg-violet-100 px-2 py-1 text-xs font-bold text-violet-700">{formatClock(note.time)}</button>
            <span className="flex-1">{note.text}</span>
            <button type="button" onClick={() => onRemove(note.id)} aria-label="Delete note" className="text-ink-2 hover:text-error">×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
