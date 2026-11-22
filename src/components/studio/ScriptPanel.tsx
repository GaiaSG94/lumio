"use client";

import { withTiming, formatClock } from "@/lib/time";
import type { Storyboard } from "@/lib/schema";

export function ScriptPanel({ storyboard }: { storyboard: Storyboard | null }) {
  if (!storyboard) return <p className="p-4 text-sm text-encre-2">Le script arrive…</p>;

  return (
    <section className="space-y-3" data-testid="script-panel">
      <div className="mb-4">
        <h2 className="font-titre text-xl font-bold">{storyboard.title}</h2>
        <p className="mt-1 text-sm text-encre-2">
          {storyboard.scenes.length} scènes · {storyboard.concepts.join(" · ")}
        </p>
      </div>
      {withTiming(storyboard.scenes).map((scene, index) => (
        <article key={scene.id} className="rounded-carte border border-violet-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-600 px-2.5 py-1 text-xs font-bold text-white">{formatClock(scene.start)}</span>
            <h3 className="font-titre text-base font-bold">{index + 1}. {scene.title}</h3>
            <span className="pastille ml-auto text-xs">{scene.kind}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-encre-2">{scene.narration}</p>
          <p className="mt-2 text-xs italic text-violet-700">{scene.visual}</p>
        </article>
      ))}
      <h3 className="pt-4 font-titre text-lg font-bold">Quiz · {storyboard.quiz.length} questions</h3>
      {storyboard.quiz.map((question, index) => (
        <article key={`${question.sceneId}-${index}`} className="rounded-carte border border-violet-100 bg-white p-4 text-sm">
          <p className="font-semibold">{index + 1}. {question.question}</p>
          <p className="mt-1 text-encre-2">Réponse : {question.choices[question.answerIndex]}</p>
        </article>
      ))}
    </section>
  );
}
