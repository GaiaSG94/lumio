import { NextResponse } from "next/server";
import { chatUpdate } from "@/lib/pipeline/chat";
import { store } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { message?: string };
  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "Message vide" }, { status: 400 });
  const project = await store.get(id);
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  if (project.job.active) return NextResponse.json({ error: "Génération en cours" }, { status: 409 });
  try {
    const updated = await chatUpdate(id, message);
    return NextResponse.json({ project: updated });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
