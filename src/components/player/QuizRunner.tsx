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
  const [prenom, setPrenom] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(`/api/v/${slug}`, { cache: "no-store" });
        const data = (await response.json()) as { project?: Project; error?: string };
        if (data.project) setProject(data.project);
        else setError(data.error ?? "Quiz introuvable");
      } catch {
        setError("Impossible de charger le quiz");
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
        body: JSON.stringify({ prenom, score, total: questions.length, answers }),
      });
      if (response.ok) setSaved(true);
      else setError("Enregistrement impossible");
    } catch {
      setError("Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  if (error) return <main className="grid min-h-screen place-items-center p-6 text-center"><h1 className="font-titre text-2xl font-bold">{error}</h1></main>;
  if (!project || !storyboard) return <main className="grid min-h-screen place-items-center"><p className="animate-pulse text-encre-2">Chargement du quiz…</p></main>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[520px] px-4 pb-12">
      <header className="flex items-center justify-between py-4">
        <Logo />
        <Link href={`/v/${slug}`} className="flex min-h-11 items-center gap-1 text-sm font-medium text-violet-700"><ArrowLeft size={16} /> Vidéo</Link>
      </header>

      {!finished && question ? (
        <section data-testid="question">
          <div className="mt-4 flex items-center justify-between text-sm text-encre-2">
            <span className="font-semibold text-violet-700">Question {index + 1} / {questions.length}</span>
            <span>{Math.round(((index + (validated ? 1 : 0)) / questions.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-violet-100"><div className="h-2 rounded-full bg-violet-600 transition-all" style={{ width: `${((index + (validated ? 1 : 0)) / questions.length) * 100}%` }} /></div>

          <h1 className="mt-6 font-titre text-2xl font-bold leading-snug">{question.question}</h1>

          <div className="mt-5 grid gap-3" role="group" aria-label="Choix de réponse">
            {question.choices.map((choice, option) => {
              const isAnswer = option === question.answerIndex;
              const isPicked = option === selected;
              const style = validated
                ? isAnswer
                  ? "border-succes bg-succes-fond text-succes"
                  : isPicked
                    ? "border-erreur bg-erreur-fond text-erreur"
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
                  className={cn("flex min-h-16 items-center gap-3 rounded-carte border-2 px-4 py-3 text-left text-sm font-semibold transition-colors", style)}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80 text-violet-700">{String.fromCharCode(65 + option)}</span>
                  <span className="flex-1">{choice}</span>
                  {validated && isAnswer ? <Check size={18} aria-label="Bonne réponse" /> : null}
                  {validated && isPicked && !isAnswer ? <X size={18} aria-label="Mauvaise réponse" /> : null}
                </button>
              );
            })}
          </div>

          {validated ? (
            <div className={cn("mt-5 animate-apparition rounded-carte p-4", correct ? "bg-succes-fond text-succes" : "bg-erreur-fond text-erreur")} role="status" data-testid="retour">
              <p className="font-bold">{correct ? "Bonne réponse !" : "Pas tout à fait…"}</p>
              <p className="mt-1 text-sm">{question.explanation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/v/${slug}?t=${Math.floor(timed.find((s) => s.id === question.sceneId)?.start ?? 0)}`} className="btn-secondaire">Revoir {formatClock(timed.find((s) => s.id === question.sceneId)?.start ?? 0)}</Link>
                <button type="button" onClick={next} className="btn-primaire">Question suivante</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={validate} disabled={selected === null} className="btn-primaire mt-6 w-full">Valider</button>
          )}
        </section>
      ) : (
        <section className="mt-8 text-center" data-testid="resultat">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-violet-100 font-titre text-2xl font-bold text-violet-700">{score}/{questions.length}</span>
          <h1 className="mt-5 font-titre text-3xl font-bold">Quiz terminé !</h1>
          <p className="mt-2 text-encre-2">Tu as obtenu {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {questions.length}.</p>

          <div className="mt-6 rounded-carte border border-violet-100 bg-white p-4 text-left">
            <label htmlFor="prenom" className="text-sm font-semibold">Ton prénom (facultatif)</label>
            <input id="prenom" value={prenom} onChange={(event) => setPrenom(event.target.value)} placeholder="Anonyme" className="mt-2 min-h-11 w-full rounded-[10px] border border-violet-100 px-3 text-sm outline-none" />
            <button type="button" onClick={() => void save()} disabled={saving || saved} className="btn-primaire mt-3 w-full">
              {saved ? "Résultat enregistré" : saving ? "Enregistrement…" : "Enregistrer mon résultat"}
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Link href={`/v/${slug}`} className="btn-secondaire w-full"><ArrowLeft size={16} /> Revoir la vidéo</Link>
            <button type="button" onClick={restart} className="btn-secondaire w-full"><RotateCcw size={16} /> Recommencer</button>
          </div>
        </section>
      )}
      {error ? <p role="alert" className="mt-4 text-sm text-erreur">{error}</p> : null}
    </main>
  );
}
