"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Check, ChevronDown, Loader2, Paperclip } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Level } from "@/lib/schema";

export const SUGGESTIONS = [
  "La photosynthèse",
  "La Révolution française en 2 min",
  "Les fractions au CM1",
  "Le théorème de Pythagore",
];

const LEVELS: { value: Level; label: string }[] = [
  { value: "primaire", label: "Primaire" },
  { value: "college", label: "Collège" },
  { value: "lycee", label: "Lycée" },
  { value: "adultes", label: "Adultes" },
];

export function PromptComposer() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<Level>("college");
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
      setError("Seuls les fichiers .txt sont lus automatiquement en version démo.");
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
      if (!response.ok || !data.project) throw new Error(data.error ?? "Impossible de créer le projet");
      router.push(`/p/${data.project.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur inconnue");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">
      <div className="surface-verre rounded-carte p-2 shadow-douce">
        <label htmlFor="prompt" className="sr-only">
          Colle ton texte ou décris ta leçon
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
          placeholder="Colle ton texte ou décris ta leçon…"
          className="w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed text-encre outline-none placeholder:text-encre-2/70"
        />
        <div className="flex items-center gap-2 px-2 pb-1">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            aria-label="Joindre un fichier"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Joindre un fichier PDF, Word ou texte" className="grid size-10 place-items-center rounded-full border border-violet-100 bg-white text-violet-700 transition-colors hover:bg-violet-100">
            <Paperclip size={17} strokeWidth={1.8} />
          </button>

          <div className="relative">
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-h-10 items-center gap-1.5 rounded-full border border-violet-100 bg-white px-3 text-sm font-medium text-encre-2 hover:bg-violet-100" aria-label={`Niveau ${LEVELS.find((l) => l.value === level)?.label}, durée ${minutes} minutes. Modifier`}>
              {LEVELS.find((l) => l.value === level)?.label} · {minutes} min
              <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {open && (
              <div className="absolute bottom-12 left-0 z-20 w-64 rounded-carte border border-violet-100 bg-white p-4 shadow-flottante">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-encre-2">Niveau</p>
                <div className="flex flex-wrap gap-1.5">
                  {LEVELS.map((item) => (
                    <button key={item.value} type="button" onClick={() => setLevel(item.value)} className={cn("rounded-full px-3 py-1.5 text-sm", level === item.value ? "bg-violet-600 text-white" : "bg-lavande-50 text-encre-2 hover:bg-violet-100")} aria-pressed={level === item.value}>
                      {item.label}
                    </button>
                  ))}
                </div>
                <label htmlFor="duree" className="mt-4 mb-1 flex justify-between text-xs font-semibold uppercase tracking-wide text-encre-2">
                  Durée <span>{minutes} min</span>
                </label>
                <input id="duree" type="range" min={1} max={10} value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} className="w-full accent-violet-600" />
                <button type="button" onClick={() => setOpen(false)} className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-semibold text-violet-700">
                  <Check size={15} /> Valider
                </button>
              </div>
            )}
          </div>

          <button type="button" onClick={() => void submit()} disabled={text.trim().length < 10 || busy} aria-label="Générer la vidéo" className="ml-auto grid size-11 place-items-center rounded-full bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:bg-violet-100 disabled:text-violet-300">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={19} strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-2 px-2 text-sm text-erreur">{error}</p>}

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
