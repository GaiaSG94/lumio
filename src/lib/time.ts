export type TimedScene<T> = T & { start: number; end: number };

export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function formatSrtTime(seconds: number): string {
  const ms = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1000);
  const millis = ms % 1000;
  const pad = (n: number, len: number) => n.toString().padStart(len, "0");
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(millis, 3)}`;
}

export function formatVttTime(seconds: number): string {
  return formatSrtTime(seconds).replace(",", ".");
}

export function withTiming<T extends { seconds: number }>(scenes: T[]): TimedScene<T>[] {
  let cursor = 0;
  return scenes.map((scene) => {
    const start = cursor;
    cursor += scene.seconds;
    return { ...scene, start, end: cursor };
  });
}

export function findSceneAt<T extends { start: number; end: number }>(scenes: T[], time: number): T | null {
  return scenes.find((scene) => time >= scene.start && time < scene.end) ?? null;
}
