"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Share2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ChatPanel } from "@/components/studio/ChatPanel";
import { ExportPanel } from "@/components/studio/ExportPanel";
import { PreviewPanel } from "@/components/studio/PreviewPanel";
import { ScriptPanel } from "@/components/studio/ScriptPanel";
import { usePlayback } from "@/components/player/usePlayback";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";

export function StudioShell({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [tab, setTab] = useState<"apercu" | "script">("apercu");
  const [exportOpen, setExportOpen] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [error, setError] = useState("");
  const total = project?.versions.at(-1)?.storyboard.scenes.reduce((sum, s) => sum + s.seconds, 0) ?? 180;
  const playback = usePlayback(total);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${id}`, { cache: "no-store" });
      const data = (await response.json()) as { project?: Project; error?: string };
      if (data.project) setProject(data.project);
      else setError(data.error ?? "Projet introuvable");
    } catch {
      setError("Impossible de charger le projet");
    }
  }, [id]);

  useEffect(() => {
    void load();
    if (project && !project.job.active && project.versions.length > 0) return;
    const timer = window.setInterval(() => void load(), 600);
    return () => window.clearInterval(timer);
  }, [load, project, project?.job.active]);

  async function send(message: string) {
    setChatBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${id}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json()) as { project?: Project; error?: string };
      if (!data.project) throw new Error(data.error ?? "Modification impossible");
      setProject(data.project);
      playback.seek(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur inconnue");
    } finally {
      setChatBusy(false);
    }
  }

  if (error && !project) {
    return <main className="grid min-h-screen place-items-center p-6 text-center"><div><h1 className="font-titre text-2xl font-bold">Projet introuvable</h1><p className="mt-2 text-encre-2">{error}</p><Link href="/" className="btn-primaire mt-5">Retour à l&apos;accueil</Link></div></main>;
  }
  if (!project) {
    return <main className="grid min-h-screen place-items-center"><p className="animate-pulse text-encre-2">Chargement du studio…</p></main>;
  }

  const storyboard = project.versions.at(-1)?.storyboard ?? null;
  const version = project.versions.length;

  return (
    <main className="flex min-h-screen flex-col bg-lavande-50">
      <header className="flex flex-wrap items-center gap-3 bg-violet-600 px-4 py-3 text-white sm:px-6">
        <Logo inverse />
        <span className="hidden text-white/50 sm:inline">/</span>
        <span className="max-w-[22vw] truncate text-sm font-semibold sm:max-w-xs" title={project.title}>{project.title}</span>
        <nav className="ml-auto flex items-center gap-1" aria-label="Vues du projet">
          {(["apercu", "script"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} aria-current={tab === item ? "page" : undefined} className={cn("min-h-11 rounded-[10px] px-3 text-sm font-semibold capitalize transition-colors", tab === item ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10")}>
              {item === "apercu" ? "Aperçu" : "Script"}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setExportOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-white/15 px-3 text-sm font-semibold hover:bg-white/25"><Share2 size={15} /> <span className="hidden sm:inline">Partager</span></button>
          <button type="button" onClick={() => setExportOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-white px-3 text-sm font-semibold text-violet-700 hover:bg-violet-100"><Download size={15} /> <span className="hidden sm:inline">Télécharger</span></button>
        </div>
      </header>

      {error ? <p role="alert" className="bg-erreur-fond px-4 py-2 text-sm text-erreur">{error}</p> : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ChatPanel messages={project.messages} job={project.job} busy={chatBusy || project.job.active} onSend={(message) => void send(message)} />
        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {tab === "apercu" ? (
              <PreviewPanel storyboard={storyboard} version={version} time={playback.time} playing={playback.playing} onToggle={playback.toggle} onSeek={playback.seek} job={project.job} />
            ) : (
              <ScriptPanel storyboard={storyboard} />
            )}
          </div>
        </section>
      </div>

      {exportOpen ? <ExportPanel project={project} onClose={() => setExportOpen(false)} /> : null}
    </main>
  );
}
