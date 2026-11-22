import { NextResponse } from "next/server";
import { newId, slugify } from "@/lib/ids";
import { runGeneration } from "@/lib/pipeline/generate";
import { store } from "@/lib/storage";
import type { CreateProjectInput, Project } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ projects: await store.list() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateProjectInput>;
  const sourceText = (body.sourceText ?? "").trim();
  if (sourceText.length < 10) {
    return NextResponse.json({ error: "Colle au moins quelques mots de cours." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const project: Project = {
    id: newId("p-"),
    slug: `${slugify(sourceText)}-${newId().slice(0, 4)}`,
    sourceText,
    level: body.level ?? "college",
    targetSeconds: Math.min(600, Math.max(60, body.targetSeconds ?? 180)),
    title: "Nouvelle leçon",
    status: "generation",
    createdAt: now,
    updatedAt: now,
    versions: [],
    messages: [
      {
        id: newId("m-"),
        role: "lumio",
        content: "Je lis ton cours et je prépare le storyboard. C'est parti !",
        createdAt: now,
        steps: ["Lecture du texte", "Script", "Voix off", "Visuels", "Montage", "Sous-titres"],
      },
    ],
    assets: null,
    job: {
      active: false,
      step: "script",
      steps: { script: "attente", voix: "attente", visuels: "attente", montage: "attente", soustitres: "attente" },
      progress: 0,
    },
    quizResults: [],
  };
  await store.create(project);
  void runGeneration(project.id);
  return NextResponse.json({ project }, { status: 201 });
}
