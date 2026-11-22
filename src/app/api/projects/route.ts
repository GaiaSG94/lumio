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
    return NextResponse.json({ error: "Paste at least a few words of lesson content." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const project: Project = {
    id: newId("p-"),
    slug: `${slugify(sourceText)}-${newId().slice(0, 4)}`,
    sourceText,
    level: body.level ?? "middle",
    targetSeconds: Math.min(600, Math.max(60, body.targetSeconds ?? 180)),
    title: "New lesson",
    status: "generating",
    createdAt: now,
    updatedAt: now,
    versions: [],
    messages: [
      {
        id: newId("m-"),
        role: "lumio",
        content: "I'm reading your lesson and preparing the storyboard. Let's go!",
        createdAt: now,
        steps: ["Reading the text", "Script", "Voiceover", "Visuals", "Rendering", "Subtitles"],
      },
    ],
    assets: null,
    job: {
      active: false,
      step: "script",
      steps: { script: "pending", voice: "pending", visuals: "pending", rendering: "pending", subtitles: "pending" },
      progress: 0,
    },
    quizResults: [],
  };
  await store.create(project);
  void runGeneration(project.id);
  return NextResponse.json({ project }, { status: 201 });
}
