import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const here = path.dirname(fileURLToPath(import.meta.url));

async function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      await fs.access(candidate);
      return candidate;
    } catch { /* candidat absent */ }
  }
  return undefined;
}

async function main() {
  const [storyboardFile, outputFile] = process.argv.slice(2);
  if (!storyboardFile || !outputFile) {
    throw new Error("Usage: node render.mjs <storyboard.json> <output.mp4>");
  }
  const storyboard = JSON.parse(await fs.readFile(storyboardFile, "utf8"));
  const entryPoint = path.join(here, "index.ts");
  console.log("[lumio] bundle Remotion…");
  const serveUrl = await bundle({ entryPoint });
  console.log("[lumio] sélection de la composition…");
  const inputProps = { storyboard };
  const browserExecutable = await findBrowser();
  const browser = browserExecutable ? { browserExecutable } : {};
  const composition = await selectComposition({ serveUrl, id: "Lumio", inputProps, ...browser });
  console.log(`[lumio] rendu de ${composition.durationInFrames} images…`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    ...browser,
    outputLocation: outputFile,
    inputProps,
    concurrency: 2,
    onProgress: ({ progress }) => {
      const percent = Math.round(progress * 100);
      if (percent % 20 === 0) console.log(`[lumio] ${percent} %`);
    },
  });
  console.log("[lumio] terminé:", outputFile);
}

main().catch((error) => {
  console.error("[lumio] échec du rendu:", error instanceof Error ? error.message : error);
  process.exit(1);
});
