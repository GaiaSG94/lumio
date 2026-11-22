"use client";

import { withTiming, formatClock } from "@/lib/time";
import type { Storyboard } from "@/lib/schema";

export function ScriptPanel({ storyboard }: { storyboard: Storyboard | null }) {
  if (!storyboard) return <p className="p-4 text-sm text-ink-2">The script is coming…</p>;

  return (
    <section className="space-y-3" data-testid="script-panel">
      <div className="mb-4">
        <h2 className="font-title text-xl font-bold">{storyboard.title}</h2>
        <p className="mt-1 text-sm text-ink-2">
          {storyboard.scenes.length} scenes · {storyboard.concepts.join(" · ")}
        </p>
      </div>
      {withTiming(storyboard.scenes).map((scene, index) => (
        <article key={scene.id} className="rounded-card border border-violet-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-600 px-2.5 py-1 text-xs font-bold text-white">{formatClock(scene.start)}</span>
            <h3 className="font-title text-base font-bold">{index + 1}. {scene.title}</h3>
            <span className="pastille ml-auto text-xs">{scene.kind}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{scene.narration}</p>
          <p className="mt-2 text-xs italic text-violet-700">{scene.visual}</p>
        </article>
      ))}
      <h3 className="pt-4 font-title text-lg font-bold">Quiz · {storyboard.quiz.length} questions</h3>
      {storyboard.quiz.map((question, index) => (
        <article key={`${question.sceneId}-${index}`} className="rounded-card border border-violet-100 bg-white p-4 text-sm">
          <p className="font-semibold">{index + 1}. {question.question}</p>
          <p className="mt-1 text-ink-2">Answer: {question.choices[question.answerIndex]}</p>
        </article>
      ))}
    </section>
  );
}
