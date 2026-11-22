import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { newId } from "@/lib/ids";
import { assetPath, store } from "@/lib/storage";
import type { QuizResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { firstName?: string; score: number; total: number; answers: number[] };
  const project = await store.get(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const result: QuizResult = {
    id: newId("q-"),
    firstName: body.firstName?.trim().slice(0, 60) || undefined,
    score: Math.max(0, Math.min(body.total, body.score)),
    total: Math.max(1, body.total),
    answers: Array.isArray(body.answers) ? body.answers : [],
    createdAt: new Date().toISOString(),
  };
  const updated = await store.saveQuizResult(id, result);
  const target = path.join(assetPath(id), "results.jsonl");
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.appendFile(target, `${JSON.stringify(result)}\n`, "utf8");
  return NextResponse.json({ result, project: updated?.quizResults.length }, { status: 201 });
}
