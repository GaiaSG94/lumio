"use client";

import { useState } from "react";
import { Check, Copy, Download, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";

const FORMATS = ["16:9", "9:16", "1:1"] as const;
const QUALITIES = ["720p", "1080p"] as const;

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("16:9");
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>("720p");
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [videoUrl, setVideoUrl] = useState(project.assets?.videoUrl ?? "");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const shareUrl = `${origin}/v/${project.slug}`;
  const iframe = `<iframe src="${shareUrl}" width="720" height="405" allowfullscreen title="Lumio video"></iframe>`;

  async function render() {
    setRendering(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${project.id}/render`, { method: "POST" });
      const data = (await response.json()) as { videoUrl?: string; error?: string };
      if (!response.ok || !data.videoUrl) throw new Error(data.error ?? "Could not render the video");
      setVideoUrl(data.videoUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Render error");
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-label="Export · Share">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-floating">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-title text-xl font-bold">Export · Share</h2>
            <p className="mt-1 text-sm text-ink-2">Version {project.versions.length} · {project.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-lavender-50 text-ink-2 hover:bg-violet-100"><X size={18} /></button>
        </div>

        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-semibold">Format</legend>
          <div className="flex gap-2">
            {FORMATS.map((item) => (
              <button key={item} type="button" onClick={() => setFormat(item)} aria-pressed={format === item} className={cn("min-h-11 flex-1 rounded-[10px] border px-3 text-sm font-medium", format === item ? "border-violet-600 bg-violet-100 text-violet-800" : "border-violet-100 hover:bg-lavender-50")}>{item}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-semibold">Quality</legend>
          <div className="flex gap-2">
            {QUALITIES.map((item) => (
              <button key={item} type="button" onClick={() => setQuality(item)} aria-pressed={quality === item} className={cn("min-h-11 flex-1 rounded-[10px] border px-3 text-sm font-medium", quality === item ? "border-violet-600 bg-violet-100 text-violet-800" : "border-violet-100 hover:bg-lavender-50")}>{item}</button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 space-y-2">
          {videoUrl ? (
            <a href={videoUrl} download={`lumio-${project.slug}.mp4`} className="btn-primary w-full"><Download size={16} /> Download MP4 video</a>
          ) : (
            <button type="button" onClick={() => void render()} disabled={rendering} className="btn-primary w-full">
              {rendering ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {rendering ? "Rendering…" : "Generate MP4 video"}
            </button>
          )}
          {error ? <p role="alert" className="rounded-lg bg-error-bg p-2 text-xs text-error">{error}</p> : null}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => download(`${project.slug}.srt`, project.assets?.srt ?? "", "application/x-subrip")} className="btn-secondary w-full"><Download size={15} /> Subtitles (.srt)</button>
            <button type="button" onClick={() => download(`${project.slug}.txt`, project.assets?.transcript ?? "", "text/plain")} className="btn-secondary w-full"><Download size={15} /> Transcript</button>
          </div>
          <p className="text-xs text-ink-2">Export {format} · {quality}. MP4 rendering uses Remotion (FFmpeg required).</p>
        </div>

        <div className="mt-6 rounded-card bg-lavender-50 p-4">
          <p className="text-sm font-semibold">Student link</p>
          <div className="mt-2 flex gap-2">
            <input readOnly value={shareUrl} aria-label="Share link" className="min-h-11 flex-1 rounded-[10px] border border-violet-100 bg-white px-3 text-sm" onFocus={(event) => event.target.select()} />
            <button type="button" onClick={() => { void navigator.clipboard?.writeText(shareUrl); setCopied(true); }} aria-label="Copy the share link" className="btn-secondary">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-violet-700">Embed code</summary>
            <code className="mt-2 block break-all rounded-lg bg-white p-2 text-xs">{iframe}</code>
          </details>
        </div>
      </div>
    </div>
  );
}
