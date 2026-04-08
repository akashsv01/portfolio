import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "./constants";

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

export function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || now > cur.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (cur.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((cur.resetAt - now) / 1000);
    return { ok: false, retryAfterSec };
  }
  cur.count += 1;
  return { ok: true };
}
