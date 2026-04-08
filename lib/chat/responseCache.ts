import { normalizeQuery } from "./queryNormalize";

/** In-memory LRU + TTL — resets on cold start (fine for serverless). */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 160;

type Row = { text: string; expires: number };

const store = new Map<string, Row>();

function touch(key: string, row: Row): void {
  store.delete(key);
  store.set(key, row);
}

function evictIfNeeded(): void {
  while (store.size > CACHE_MAX_ENTRIES) {
    const first = store.keys().next().value as string | undefined;
    if (first === undefined) break;
    store.delete(first);
  }
}

/** Regex + stable key for semantic similarity cache (same answer bucket). */
const SEMANTIC_BUCKETS: { re: RegExp; key: string }[] = [
  { re: /\b(who\s+is|tell\s+me\s+about|introduce|about\s+akash|akash\s+bio)\b/i, key: "identity" },
  {
    re: /\b(work\s+history|employment|internship|internships|professional\s+background|resume|cv)\b/i,
    key: "experience",
  },
  {
    re: /\b(work|experience|career|jobs?)\b.*\b(akash|his|he)\b|\b(where|what)\s+(did|has|does)\s+(he|akash)\s+work/i,
    key: "experience",
  },
  { re: /\bhow\s+many\b.*\b(repo|repos|repository|repositories|github)\b/i, key: "repo-count" },
  { re: /\b(skill|skills|tech\s+stack|technologies|programming\s+languages)\b/i, key: "skills" },
  { re: /\b(best|favorite|favourite)\s+project/i, key: "best-project" },
];

/**
 * Returns a cache key, or null if we should not cache this message.
 * Skips very short/long inputs; README-heavy answers are skipped at route level.
 */
export function computeResponseCacheKey(raw: string): string | null {
  const n = normalizeQuery(raw);
  if (n.length < 3 || n.length > 240) return null;

  for (const { re, key } of SEMANTIC_BUCKETS) {
    if (re.test(raw)) return `sem:${key}`;
  }
  return `ex:${n}`;
}

export function getCachedResponse(key: string): string | null {
  const row = store.get(key);
  if (!row) return null;
  if (Date.now() > row.expires) {
    store.delete(key);
    return null;
  }
  touch(key, row);
  return row.text;
}

export function setCachedResponse(key: string, text: string): void {
  const expires = Date.now() + CACHE_TTL_MS;
  if (store.has(key)) store.delete(key);
  store.set(key, { text, expires });
  evictIfNeeded();
}
