import { NextResponse } from "next/server";
import { store } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await store.getBySlug(slug);
  if (!project) return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });
  return NextResponse.json({ project });
}
