import OpenAI, { APIError, RateLimitError } from "openai";

function logGroqRateLimits(response: Response) {
  console.log("[Groq Rate Limits]", {
    remainingRequests: response.headers.get("x-ratelimit-remaining-requests"),
    remainingTokens: response.headers.get("x-ratelimit-remaining-tokens"),
    resetRequestsIn: response.headers.get("x-ratelimit-reset-requests"),
    resetTokensIn: response.headers.get("x-ratelimit-reset-tokens"),
    limitRequests: response.headers.get("x-ratelimit-limit-requests"),
    limitTokens: response.headers.get("x-ratelimit-limit-tokens"),
  });
}

function logGroq429(headers: Headers) {
  console.log("[Groq 429 Rate Limited]", {
    retryAfterSeconds: headers.get("retry-after"),
    resetRequestsIn: headers.get("x-ratelimit-reset-requests"),
    resetTokensIn: headers.get("x-ratelimit-reset-tokens"),
  });
}

/** Groq via OpenAI-compatible API. Same signature as before so route.ts stays unchanged. */
export async function generateGeminiChatReply(params: {
  apiKey: string;
  systemInstruction: string;
  userText: string;
  maxOutputTokens: number;
  temperature: number;
  modelId: string;
}): Promise<string> {
  const client = new OpenAI({
    apiKey: params.apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  try {
    const { data, response } = await client.chat.completions
      .create({
        model: params.modelId,
        messages: [
          { role: "system", content: params.systemInstruction },
          { role: "user", content: params.userText },
        ],
        temperature: params.temperature,
        max_tokens: params.maxOutputTokens,
      })
      .withResponse();

    logGroqRateLimits(response);

    const text = data.choices[0]?.message?.content?.trim() ?? "";
    return text || "I couldn't generate a reply. Please try again in a moment.";
  } catch (err) {
    if (err instanceof RateLimitError && err.headers) {
      logGroq429(err.headers);
    } else if (err instanceof APIError && err.status === 429 && err.headers) {
      logGroq429(err.headers);
    }
    throw err;
  }
}
