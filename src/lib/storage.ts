import fs from "node:fs/promises";
import path from "node:path";
import type { Project } from "./types";

type Database = Record<string, Project>;

const dataDir = path.resolve(process.cwd(), process.env.DATA_DIR || ".data");
const projectsFile = path.join(dataDir, "projects.json");

let cache: Database | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function ensureDir(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readAll(): Promise<Database> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(projectsFile, "utf8");
    cache = JSON.parse(raw) as Database;
  } catch {
    cache = {};
  }
  return cache;
}

async function persist(data: Database): Promise<void> {
  await ensureDir();
  await fs.writeFile(projectsFile, JSON.stringify(data, null, 2), "utf8");
}

async function mutate<T>(fn: (data: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const data = await readAll();
    const result = await fn(data);
    await persist(data);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const store = {
  async get(id: string): Promise<Project | null> {
    return (await readAll())[id] ?? null;
  },
  async getBySlug(slug: string): Promise<Project | null> {
    const all = Object.values(await readAll());
    return all.find((p) => p.slug === slug) ?? null;
  },
  async list(): Promise<Project[]> {
    return Object.values(await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async create(project: Project): Promise<Project> {
    return mutate((data) => {
      data[project.id] = project;
      return project;
    });
  },
  async update(id: string, updater: (project: Project) => Project): Promise<Project | null> {
    return mutate((data) => {
      const current = data[id];
      if (!current) return null;
      const next = updater(current);
      data[id] = next;
      return next;
    });
  },
  async saveQuizResult(id: string, result: Project["quizResults"][number]): Promise<Project | null> {
    return this.update(id, (project) => ({
      ...project,
      quizResults: [...project.quizResults, result],
      updatedAt: new Date().toISOString(),
    }));
  },
};

export function assetPath(...segments: string[]): string {
  return path.join(dataDir, "assets", ...segments);
}

export async function writeAsset(segments: string[], content: Buffer): Promise<string> {
  const target = assetPath(...segments);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  return `/api/assets/${segments.join("/")}`;
}
