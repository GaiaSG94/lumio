import { NextResponse } from "next/server";
import { store } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await store.get(id);
  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  return NextResponse.json({ project });
}
