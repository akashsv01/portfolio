import { isCasualFeedbackOrThanks } from "./retrieve";
import { normalizeQuery } from "./queryNormalize";

const BOT = "ASV.ai";

/** Exact normalized query → canned reply (no Gemini). */
const EXACT: Record<string, string> = {
  hi: `Hey! I'm ${BOT}, Akash's AI assistant. Ask me anything about his work, skills, or experience.`,
  hello: `Hey! I'm ${BOT}, Akash's AI assistant. Ask me anything about his work, skills, or experience.`,
  hey: `Hey! I'm ${BOT}, Akash's AI assistant. Ask me anything about his work, skills, or experience.`,
  thanks: "I appreciate that — happy to help. Ask me anything else about Akash's portfolio.",
  "thank you": "I appreciate that — happy to help. Ask me anything else about Akash's portfolio.",
  thx: "I appreciate that — happy to help. Ask me anything else about Akash's portfolio.",
  ty: "I appreciate that — happy to help. Ask me anything else about Akash's portfolio.",
  bye: "Thanks for stopping by — good luck out there!",
  goodbye: "Thanks for stopping by — good luck out there!",
  "see you": "Thanks for stopping by — good luck out there!",
  "see ya": "Thanks for stopping by — good luck out there!",
};

const GREETING_FALLBACK = `Hey! I'm ${BOT}, Akash's AI assistant. Ask me anything about his work, skills, or experience.`;
const THANKS_FALLBACK = "I appreciate your kind words — glad I could help.";

/** Short standalone greetings (no portfolio question). */
const SHORT_GREETING = /^(hi|hello|hey|howdy|greetings)(\s|!|\?|$)/i;

export function getStaticReply(raw: string): string | null {
  const n = normalizeQuery(raw);
  if (n.length === 0) return null;

  const direct = EXACT[n];
  if (direct) return direct;

  if (n === "hi there" || n === "hey there" || n === "hello there") return GREETING_FALLBACK;
  if (n === "thank you so much" || n === "thanks so much" || n === "tysm") return THANKS_FALLBACK;

  if (n.length <= 24 && SHORT_GREETING.test(raw.trim())) return GREETING_FALLBACK;

  if (isCasualFeedbackOrThanks(raw)) return THANKS_FALLBACK;

  return null;
}
