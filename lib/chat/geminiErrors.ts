/** Map Gemini SDK / API errors to short, user-facing text (no raw stack traces). */
export function friendlyGeminiError(error: unknown): {
  message: string;
  retryAfterSec: number | null;
  status: 429 | 502;
} {
  const raw = error instanceof Error ? error.message : String(error);

  if (/429|Too Many Requests|quota|Quota exceeded/i.test(raw)) {
    if (/PerDay|daily|free_tier_requests/i.test(raw)) {
      return {
        message:
          "Gemini free-tier daily limit for this model was reached (limits vary by model). Options: try again tomorrow, set GEMINI_MODEL to another model (e.g. gemini-2.5-flash) in .env.local, or enable billing in Google AI Studio. See https://ai.google.dev/gemini-api/docs/rate-limits",
        retryAfterSec: null,
        status: 429,
      };
    }
    const retryMatch = raw.match(/retry in ([\d.]+)\s*s/i) ?? raw.match(/Retry-After[:\s]+(\d+)/i);
    const sec = retryMatch ? Math.ceil(parseFloat(retryMatch[1]!)) : null;
    return {
      message:
        "Too many requests to Gemini right now. Wait a bit and try again, or check usage at https://ai.dev/rate-limit",
      retryAfterSec: sec && sec > 0 && sec < 3600 ? sec : 60,
      status: 429,
    };
  }

  if (/401|403|API key|API_KEY|permission/i.test(raw)) {
    return {
      message: "Gemini API key is missing or invalid. Check GEMINI_API_KEY in .env.local.",
      retryAfterSec: null,
      status: 502,
    };
  }

  return { message: raw.slice(0, 500), retryAfterSec: null, status: 502 };
}
