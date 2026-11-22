"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";
import { formatClock, withTiming } from "@/lib/time";

export function QuizRunner({ slug }: { slug: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [firstName, setFirstName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/v/${slug}`, { cache: "no-store" });
        const data = (await response.json()) as { project?: Project; error?: string };
        if (data.project) setProject(data.project);
        else setError(data.error ?? "Quiz not found");
      } catch {
        setError("Could not load the quiz");
      }
    })();
  }, [slug]);

  const storyboard = project?.versions.at(-1)?.storyboard;
  const questions = storyboard?.quiz ?? [];
  const timed = storyboard ? withTiming(storyboard.scenes) : [];
  const finished = index >= questions.length;
  const question = questions[index];
  const correct = question ? selected === question.answerIndex : false;
  const score = answers.filter((answer, i) => answer === questions[i]?.answerIndex).length;

  function validate() {
    if (selected === null || validated) return;
    setValidated(true);
    setAnswers((current) => [...current, selected]);
  }

  function next() {
    setIndex((current) => current + 1);
    setSelected(null);
    setValidated(false);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setValidated(false);
    setAnswers([]);
    setSaved(false);
  }

  async function save() {
    if (!project || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/quiz`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, score, total: questions.length, answers }),
      });
      if (response.ok) setSaved(true);
      else setError("Could not save the result");
    } catch {
      setError("Could not save the result");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <main className="grid min-h-screen place-items-center p-6 text-center"><h1 className="font-title text-2xl font-bold">{error}</h1></main>;
  if (!project || !storyboard) return <main className="grid min-h-screen place-items-center"><p className="animate-pulse text-ink-2">Loading…</p></main>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[520px] px-4 pb-12">
      <header className="flex items-center justify-between py-4">
        <Logo />
        <Link href={`/v/${slug}`} className="flex min-h-11 items-center gap-1 text-sm font-medium text-violet-700"><ArrowLeft size={16} /> Video</Link>
      </header>

      {!finished && question ? (
        <section data-testid="question">
          <div className="mt-4 flex items-center justify-between text-sm text-ink-2">
            <span className="font-semibold text-violet-700">Question {index + 1} / {questions.length}</span>
            <span>{Math.round(((index + (validated ? 1 : 0)) / questions.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-violet-100"><div className="h-2 rounded-full bg-violet-600 transition-all" style={{ width: `${((index + (validated ? 1 : 0)) / questions.length) * 100}%` }} /></div>

          <h1 className="mt-6 font-title text-2xl font-bold leading-snug">{question.question}</h1>

          <div className="mt-5 grid gap-3" role="group" aria-label="Answer choices">
            {question.choices.map((choice, option) => {
              const isAnswer = option === question.answerIndex;
              const isPicked = option === selected;
              const style = validated
                ? isAnswer
                  ? "border-success bg-success-bg text-success"
                  : isPicked
                    ? "border-error bg-error-bg text-error"
                    : "border-violet-100 bg-white opacity-60"
                : isPicked
                  ? "border-violet-600 bg-violet-100 text-violet-800"
                  : "border-violet-100 bg-white hover:border-violet-300";
              return (
                <button
                  key={`${option}-${choice}`}
                  type="button"
                  disabled={validated}
                  onClick={() => setSelected(option)}
                  aria-pressed={isPicked}
                  className={cn("flex min-h-16 items-center gap-3 rounded-card border-2 px-4 py-3 text-left text-sm font-semibold transition-colors", style)}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80 text-violet-700">{String.fromCharCode(65 + option)}</span>
                  <span className="flex-1">{choice}</span>
                  {validated && isAnswer ? <Check size={18} aria-label="Correct answer" /> : null}
                  {validated && isPicked && !isAnswer ? <X size={18} aria-label="Incorrect answer" /> : null}
                </button>
              );
            })}
          </div>

          {validated ? (
            <div className={cn("mt-5 animate-appear rounded-card p-4", correct ? "bg-success-bg text-success" : "bg-error-bg text-error")} role="status" data-testid="feedback">
              <p className="font-bold">{correct ? "Correct!" : "Not quite…"}</p>
              <p className="mt-1 text-sm">{question.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/v/${slug}?t=${Math.floor(timed.find((s) => s.id === question.sceneId)?.start ?? 0)}`} className="btn-secondary">Rewatch {formatClock(timed.find((s) => s.id === question.sceneId)?.start ?? 0)}</Link>
                <button type="button" onClick={next} className="btn-primary">Next question</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={validate} disabled={selected === null} className="btn-primary mt-6 w-full">Validate</button>
          )}
        </section>
      ) : (
        <section className="mt-8 text-center" data-testid="result">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-violet-100 font-title text-2xl font-bold text-violet-700">{score}/{questions.length}</span>
          <h1 className="mt-5 font-title text-3xl font-bold">Quiz complete!</h1>
          <p className="mt-2 text-ink-2">You got {score} correct {score === 1 ? "answer" : "answers"} out of {questions.length}.</p>

          <div className="mt-6 rounded-card border border-violet-100 bg-white p-4 text-left">
            <label htmlFor="firstName" className="text-sm font-semibold">Your first name (optional)</label>
            <input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Anonymous" className="mt-2 min-h-11 w-full rounded-[10px] border border-violet-100 px-3 text-sm outline-none" />
            <button type="button" onClick={() => void save()} disabled={saving || saved} className="btn-primary mt-3 w-full">
              {saved ? "Result saved" : saving ? "Saving…" : "Save my result"}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Link href={`/v/${slug}`} className="btn-secondary w-full"><ArrowLeft size={16} /> Watch the video again</Link>
            <button type="button" onClick={restart} className="btn-secondary w-full"><RotateCcw size={16} /> Start over</button>
          </div>
        </section>
      )}
      {error ? <p role="alert" className="mt-4 text-sm text-error">{error}</p> : null}
    </main>
  );
}
