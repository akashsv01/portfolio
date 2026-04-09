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

/**
 * Must align with `isIdentityQuery` in retrieve.ts — do NOT match generic "tell me about …"
 * or unrelated questions share `sem:identity` cache with wrong answers.
 */
const IDENTITY_CACHE_RE =
  /\bwho\s+is\s+akash\b|\bwhat\s+is\s+akash\b|\btell\s+me\s+about\s+akash\b|\bakash\s+bio\b|\bintroduce\s+akash\b|\bwhat\s+do\s+you\s+know\s+about\s+akash\b|\babout\s+akash\b/i;

/**
 * Do NOT bucket career/work questions under one `sem:experience` key — a single cached reply
 * was served for every phrasing ("tell me about his experience", Cisco drill-downs, etc.).
 * Those queries use per-normalized-text `ex:…` keys instead.
 */
const SEMANTIC_BUCKETS: { re: RegExp; key: string }[] = [
  { re: /\bhow\s+many\b.*\b(repo|repos|repository|repositories|github)\b/i, key: "repo-count" },
  { re: /\b(skill|skills|tech\s+stack|technologies|programming\s+languages)\b/i, key: "skills" },
  { re: /\b(best|favorite|favourite)\s+project/i, key: "best-project" },
  { re: IDENTITY_CACHE_RE, key: "identity" },
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
