export function newId(prefix = ""): string {
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`;
  return prefix + uuid.replace(/-/g, "").slice(0, 12);
}

export function slugify(input: string): string {
  const normalized = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.slice(0, 48) || "lesson";
}
