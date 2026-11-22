"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListChecks, NotebookPen, ScrollText } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PlayerControls } from "@/components/player/PlayerControls";
import { SceneStage } from "@/components/player/SceneStage";
import { ChaptersPanel, NotesPanel, TranscriptPanel, type Note } from "@/components/player/StudentTabs";
import { usePlayback } from "@/components/player/usePlayback";
import { cn } from "@/lib/cn";
import { newId } from "@/lib/ids";
import type { Project } from "@/lib/types";

type Tab = "chapters" | "transcript" | "notes";

const TABS: { id: Tab; label: string; icon: typeof ListChecks }[] = [
  { id: "chapters", label: "Chapters", icon: ListChecks },
  { id: "transcript", label: "Transcript", icon: ScrollText },
  { id: "notes", label: "My notes", icon: NotebookPen },
];

export function StudentPlayer({ slug, initialTime = 0 }: { slug: string; initialTime?: number }) {
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<Tab>("chapters");
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const storyboard = project?.versions.at(-1)?.storyboard ?? null;
  const total = storyboard?.scenes.reduce((sum, scene) => sum + scene.seconds, 0) ?? 180;
  const playback = usePlayback(total, initialTime);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/v/${slug}`, { cache: "no-store" });
        const data = (await response.json()) as { project?: Project; error?: string };
        if (data.project) setProject(data.project);
        else setError(data.error ?? "Video not found");
      } catch {
        setError("Could not load the video");
      }
    })();
  }, [slug]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`lumio-notes-${slug}`);
      if (raw) setNotes(JSON.parse(raw) as Note[]);
    } catch {}
  }, [slug]);

  function saveNotes(next: Note[]) {
    setNotes(next);
    try { window.localStorage.setItem(`lumio-notes-${slug}`, JSON.stringify(next)); } catch {}
  }

  if (error) return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="font-title text-2xl font-bold">Video not found</h1><p className="mt-2 text-ink-2">{error}</p></div></main>;
  if (!project || !storyboard) return <main className="grid min-h-screen place-items-center"><p className="animate-pulse text-ink-2">Loading…</p></main>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[520px] px-4 pb-10">
      <header className="flex items-center justify-between py-4">
        <Logo />
        <span className="pastille text-xs">Lesson</span>
      </header>

      <h1 className="font-title text-2xl font-bold leading-tight">{storyboard.title}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="pastille text-xs">{Math.round(total / 60)} min</span>
        <span className="pastille text-xs">{storyboard.scenes.length} chapters</span>
        <span className="pastille border-success bg-success-bg text-xs text-success">Quiz to do</span>
      </div>

      <div className="mt-4">
        <SceneStage storyboard={storyboard} time={playback.time} />
        <PlayerControls storyboard={storyboard} time={playback.time} playing={playback.playing} onToggle={playback.toggle} onSeek={playback.seek} />
      </div>

      <nav className="mt-6 flex gap-1 border-b border-violet-100" aria-label="Lesson tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={cn("flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-2 px-1 text-xs font-semibold sm:text-sm", tab === id ? "border-violet-600 text-violet-700" : "border-transparent text-ink-2")}>
            <Icon size={15} aria-hidden="true" /> {label}
          </button>
        ))}
      </nav>

      <div className="mt-4">
        {tab === "chapters" ? <ChaptersPanel storyboard={storyboard} time={playback.time} onSeek={playback.seek} /> : null}
        {tab === "transcript" ? <TranscriptPanel storyboard={storyboard} time={playback.time} onSeek={playback.seek} /> : null}
        {tab === "notes" ? (
          <NotesPanel
            notes={notes}
            time={playback.time}
            onAdd={(text) => saveNotes([...notes, { id: newId("n-"), time: playback.time, text }])}
            onRemove={(id) => saveNotes(notes.filter((note) => note.id !== id))}
            onSeek={playback.seek}
          />
        ) : null}
      </div>

      <Link href={`/v/${slug}/quiz?t=${Math.floor(playback.time)}`} className="btn-primary sticky bottom-4 mt-8 w-full shadow-floating" data-testid="quiz-link">
        Take the quiz · {storyboard.quiz.length} questions
      </Link>
    </main>
  );
}
