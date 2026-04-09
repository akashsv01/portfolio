import OpenAI from "openai";

/** Map OpenAI-compatible (Groq) API errors to short, user-facing text. */
export function friendlyLlmError(error: unknown): {
  message: string;
  retryAfterSec: number | null;
  status: 429 | 502;
} {
  if (error instanceof OpenAI.APIError) {
    const status = error.status;

    if (status === 429) {
      const retry = error.headers?.get("retry-after");
      const sec = retry ? Math.ceil(parseFloat(retry)) : null;
      return {
        message:
          "ASV.ai is getting a lot of questions right now! Please try again in a few seconds. In the meantime, feel free to explore the portfolio sections above.",
        retryAfterSec: sec && sec > 0 && sec < 3600 ? sec : 60,
        status: 429,
      };
    }

    if (status === 401 || status === 403) {
      return {
        message:
          "Chat API key is missing or invalid. Check GROQ_API_KEY in .env.local (https://console.groq.com/keys).",
        retryAfterSec: null,
        status: 502,
      };
    }

    if (status != null && status >= 500) {
      return {
        message: "The chat service had a temporary error. Please try again in a moment.",
        retryAfterSec: null,
        status: 502,
      };
    }

    const msg = error.message?.slice(0, 500) ?? "Chat request failed.";
    return { message: msg, retryAfterSec: null, status: 502 };
  }

  const raw = error instanceof Error ? error.message : String(error);

  if (/429|Too Many Requests|rate limit/i.test(raw)) {
    return {
      message:
        "ASV.ai is getting a lot of questions right now! Please try again in a few seconds. In the meantime, feel free to explore the portfolio sections above.",
      retryAfterSec: 60,
      status: 429,
    };
  }

  if (/401|403|API key|invalid.*key|authentication/i.test(raw)) {
    return {
      message:
        "Chat API key is missing or invalid. Check GROQ_API_KEY in .env.local (https://console.groq.com/keys).",
      retryAfterSec: null,
      status: 502,
    };
  }

  return { message: raw.slice(0, 500), retryAfterSec: null, status: 502 };
}
