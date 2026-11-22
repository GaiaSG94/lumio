"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ChatMessage, GenerationJob } from "@/lib/types";
import { STEP_LABELS, STEP_ORDER } from "@/lib/types";

const RACCOURCIS = ["Plus court", "Plus de schémas", "Voix plus lente"];

export function ChatPanel({
  messages,
  job,
  busy,
  onSend,
}: {
  messages: ChatMessage[];
  job: GenerationJob;
  busy: boolean;
  onSend: (message: string) => void;
}) {
  const [value, setValue] = useState("");

  function send(message: string) {
    const clean = message.trim();
    if (!clean || busy) return;
    onSend(clean);
    setValue("");
  }

  return (
    <aside className="flex min-h-0 w-full flex-col border-r border-violet-100 bg-white lg:w-[320px] lg:shrink-0" aria-label="Conversation avec Lumio">
      <div className="flex-1 space-y-4 overflow-y-auto p-4" data-testid="chat-thread">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex animate-apparition gap-2", message.role === "utilisateur" ? "justify-end" : "justify-start")}>
            {message.role === "lumio" ? (
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-violet-600 text-xs font-bold text-white" aria-hidden="true">L</span>
            ) : null}
            <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", message.role === "utilisateur" ? "rounded-br-sm bg-violet-600 text-white" : "rounded-bl-sm bg-lavande-50 text-encre")}>
              <p>{message.content}</p>
              {message.steps?.length ? (
                <ul className="mt-2 space-y-1 border-t border-violet-100 pt-2 text-xs text-violet-800">
                  {message.steps.map((step) => (
                    <li key={step} className="flex items-center gap-1.5"><Check size={13} aria-hidden="true" /> {step}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}

        {job.active ? (
          <div className="rounded-2xl rounded-bl-sm border border-violet-100 bg-white p-3 text-sm shadow-sm" data-testid="progression">
            <p className="mb-2 font-semibold text-violet-700">Génération en cours… {job.progress}%</p>
            <ul className="space-y-1.5">
              {STEP_ORDER.map((step) => {
                const state = job.steps[step];
                return (
                  <li key={step} className="flex items-center gap-2 text-encre-2">
                    {state === "fait" ? <Check size={14} className="text-succes" aria-hidden="true" /> : state === "encours" ? <Loader2 size={14} className="animate-spin text-violet-600" aria-hidden="true" /> : <span className="size-3.5 rounded-full border border-violet-200" aria-hidden="true" />}
                    {STEP_LABELS[step]}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {job.error ? <p role="alert" className="rounded-xl bg-erreur-fond p-3 text-sm text-erreur">{job.error}</p> : null}
      </div>

      <div className="border-t border-violet-100 p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {RACCOURCIS.map((shortcut) => (
            <button key={shortcut} type="button" onClick={() => send(shortcut)} disabled={busy} className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-800 hover:bg-violet-300 disabled:opacity-50">
              {shortcut}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => { event.preventDefault(); send(value); }}
          className="flex items-center gap-2 rounded-full border border-violet-100 bg-lavande-50 px-3 py-1"
        >
          <label htmlFor="chat-input" className="sr-only">Demande une modification</label>
          <input id="chat-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Demande une modification…" className="min-h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-encre-2/70" />
          <button type="submit" disabled={!value.trim() || busy} aria-label="Envoyer la modification" className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-600 text-white disabled:bg-violet-100 disabled:text-violet-300">
            <Send size={15} />
          </button>
        </form>
      </div>
    </aside>
  );
}
