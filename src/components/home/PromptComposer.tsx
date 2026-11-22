"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Check, ChevronDown, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Level } from "@/lib/schema";

export const SUGGESTIONS = [
  "Photosynthesis",
  "The water cycle",
  "Fractions for kids",
  "The Pythagorean theorem",
];

const LEVELS: { value: Level; label: string }[] = [
  { value: "primary", label: "Primary school" },
  { value: "middle", label: "Middle school" },
  { value: "high", label: "High school" },
  { value: "adults", label: "Adults" },
];

export function PromptComposer() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<Level>("middle");
  const [minutes, setMinutes] = useState(3);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.name.endsWith(".txt")) {
      setText(await file.text());
      setError("");
    } else {
      setError("Only .txt files are read automatically in the demo version.");
    }
  }

  async function submit() {
    if (text.trim().length < 10 || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceText: text, level, targetSeconds: minutes * 60 }),
      });
      const data = (await response.json()) as { project?: { id: string }; error?: string };
      if (!response.ok || !data.project) throw new Error(data.error ?? "Could not create the project");
      router.push(`/p/${data.project.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unknown error");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="surface-glass rounded-card p-2 shadow-soft">
        <label htmlFor="prompt" className="sr-only">
          Paste your text or describe your lesson
        </label>
        <textarea
          id="prompt"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          rows={2}
          placeholder="Paste your text or describe your lesson…"
          className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-2/70"
        />
        <div className="flex items-center gap-2 px-2 pb-1">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            aria-label="Attach a file"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Attach a PDF, Word or text file" className="grid size-10 place-items-center rounded-full border border-violet-100 bg-white text-violet-700 transition-colors hover:bg-violet-100">
            <Paperclip size={17} strokeWidth={1.8} />
          </button>

          <div className="relative">
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-h-10 items-center gap-1.5 rounded-full border border-violet-100 bg-white px-3 text-sm font-medium text-ink-2 hover:bg-violet-100" aria-label={`Level ${LEVELS.find((l) => l.value === level)?.label}, duration ${minutes} minutes. Change`}>
              {LEVELS.find((l) => l.value === level)?.label} · {minutes} min
              <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {open && (
              <div className="absolute bottom-12 left-0 z-20 w-64 rounded-card border border-violet-100 bg-white p-4 shadow-floating">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-2">Level</p>
                <div className="flex flex-wrap gap-1.5">
                  {LEVELS.map((item) => (
                    <button key={item.value} type="button" onClick={() => setLevel(item.value)} className={cn("rounded-full px-3 py-1.5 text-sm", level === item.value ? "bg-violet-600 text-white" : "bg-lavender-50 text-ink-2 hover:bg-violet-100")} aria-pressed={level === item.value}>
                      {item.label}
                    </button>
                  ))}
                </div>
                <label htmlFor="duration" className="mt-4 mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-ink-2">
                  Duration <span>{minutes} min</span>
                </label>
                <input id="duration" type="range" min={1} max={10} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} className="w-full accent-violet-600" />
                <button type="button" onClick={() => setOpen(false)} className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-semibold text-violet-700">
                  <Check size={15} /> Apply
                </button>
              </div>
            )}
          </div>

          <button type="button" onClick={() => void submit()} disabled={text.trim().length < 10 || busy} aria-label="Generate video" className="ml-auto grid size-11 place-items-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:bg-violet-100 disabled:text-violet-300">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={19} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-2 px-2 text-sm text-error">{error}</p>}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => { setText(suggestion); setOpen(false); }} className="pastille transition-colors hover:border-violet-300 hover:bg-violet-100/60">
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
