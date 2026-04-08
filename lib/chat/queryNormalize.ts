/** Normalize for exact-match cache keys and static reply lookup. */
export function normalizeQuery(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?!.,;:]+$/g, "")
    .trim();
}
