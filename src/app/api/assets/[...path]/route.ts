import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { assetPath } from "@/lib/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".srt": "application/x-subrip",
  ".vtt": "text/vtt",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const safe = parts.filter((p) => p !== ".." && p !== ".");
  if (safe.length !== parts.length) return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  const target = path.resolve(assetPath(...safe));
  if (!target.startsWith(path.resolve(assetPath()))) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }
  try {
    const content = await fs.readFile(target);
    const ext = path.extname(target).toLowerCase();
    return new NextResponse(new Uint8Array(content), {
      headers: {
        "content-type": TYPES[ext] ?? "application/octet-stream",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
