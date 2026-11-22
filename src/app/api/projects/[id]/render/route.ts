import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextResponse } from "next/server";
import { assetPath, store } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await store.get(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (!project.versions.length || !project.assets) {
    return NextResponse.json({ error: "The project is not ready yet" }, { status: 409 });
  }

  const directory = assetPath(id);
  await fs.mkdir(directory, { recursive: true });
  const storyboardFile = path.join(directory, "storyboard.json");
  const outputFile = path.join(directory, "video.mp4");
  await fs.writeFile(storyboardFile, JSON.stringify(project.versions.at(-1)!.storyboard), "utf8");

  const script = path.resolve(process.cwd(), "remotion", "render.mjs");
  const child = spawn(process.execPath, [script, storyboardFile, outputFile], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  child.stdout.on("data", (chunk: Buffer) => { log += chunk.toString(); });
  child.stderr.on("data", (chunk: Buffer) => { log += chunk.toString(); });

  try {
    await new Promise<void>((resolve, reject) => {
      child.on("error", reject);
      child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(log.slice(-1200) || `Render exited with code ${code}`))));
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Render error";
    return NextResponse.json({ error: detail }, { status: 500 });
  }

  const videoUrl = `/api/assets/${id}/video.mp4`;
  await store.update(id, (p) => ({
    ...p,
    assets: p.assets ? { ...p.assets, videoUrl } : p.assets,
    updatedAt: new Date().toISOString(),
  }));
  return NextResponse.json({ videoUrl });
}
