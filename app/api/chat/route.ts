import { NextResponse } from "next/server";
import type { KnowledgeChunk } from "@/lib/chat/buildKnowledge";
import {
  CHAT_MAX_HISTORY_TURNS,
  CHAT_MAX_MESSAGE_CHARS,
  CHAT_MAX_OUT_DEFAULT,
  CHAT_MAX_OUT_EXPERIENCE,
  CHAT_MAX_OUT_IDENTITY,
  CHAT_MAX_OUT_README,
  DEFAULT_GEMINI_MODEL,
  RAG_MIN_SCORE,
  RAG_TOP_K,
  SYSTEM_INSTRUCTION,
} from "@/lib/chat/constants";
import { getGithubReadmeCached } from "@/lib/chat/fetchGithubRepos";
import { friendlyGeminiError } from "@/lib/chat/geminiErrors";
import { generateGeminiChatReply } from "@/lib/chat/geminiGenerate";
import { githubUsernameFromProfile, loadAllKnowledgeChunks } from "@/lib/chat/loadKnowledge";
import {
  computeResponseCacheKey,
  getCachedResponse,
  setCachedResponse,
} from "@/lib/chat/responseCache";
import { checkRateLimit } from "@/lib/chat/rateLimit";
import {
  bestMatchingGithubRepoSlug,
  formatContextForPrompt,
  isExperienceCareerQuery,
  isIdentityQuery,
  pickChunksForQuery,
  wantsGithubReadmeContext,
} from "@/lib/chat/retrieve";
import { getStaticReply } from "@/lib/chat/staticReplies";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function sanitizeMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: ChatMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: string }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    out.push({ role, content: content.slice(0, CHAT_MAX_MESSAGE_CHARS) });
  }
  if (out.length === 0) return null;
  return out;
}

function geminiModelId(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

function shouldUseResponseCache(lastUserText: string): boolean {
  return !wantsGithubReadmeContext(lastUserText);
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Chat is not configured. Set GEMINI_API_KEY in .env.local (Google AI Studio: https://aistudio.google.com/apikey). Server-only — never use NEXT_PUBLIC_*.",
      },
      { status: 503 }
    );
  }

  const ip = clientIp(request);
  const limited = checkRateLimit(`chat:${ip}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limited.retryAfterSec}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = sanitizeMessages((body as { messages?: unknown }).messages);
  if (!messages) {
    return NextResponse.json({ error: "Expected { messages: [{role, content}] }" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json({ error: "Missing user message" }, { status: 400 });
  }

  const staticReply = getStaticReply(lastUser.content);
  if (staticReply) {
    return NextResponse.json({ reply: staticReply, source: "static" });
  }

  let cacheKey: string | null = null;
  if (shouldUseResponseCache(lastUser.content)) {
    cacheKey = computeResponseCacheKey(lastUser.content);
    if (cacheKey) {
      const hit = getCachedResponse(cacheKey);
      if (hit) {
        return NextResponse.json({ reply: hit, source: "cache", cached: true });
      }
    }
  }

  const history = messages.slice(-CHAT_MAX_HISTORY_TURNS * 2);
  const historyText =
    history.length <= 1
      ? ""
      : history
          .slice(0, -1)
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n");

  const allChunks = await loadAllKnowledgeChunks();

  let top = pickChunksForQuery(lastUser.content, allChunks, RAG_TOP_K, RAG_MIN_SCORE);
  const matchedSlug = bestMatchingGithubRepoSlug(lastUser.content, allChunks);
  if (matchedSlug && !isExperienceCareerQuery(lastUser.content)) {
    const repoChunk = allChunks.find((c) => c.id === `github-repo-${matchedSlug}`);
    if (repoChunk) {
      const rest = top.filter((c) => c.id !== repoChunk.id);
      top = [repoChunk, ...rest].slice(0, RAG_TOP_K);
    }
  }

  const extraChunks: KnowledgeChunk[] = [];
  const owner = githubUsernameFromProfile();
  if (owner && matchedSlug && wantsGithubReadmeContext(lastUser.content)) {
    const readme = await getGithubReadmeCached(owner, matchedSlug);
    if (readme) {
      const maxReadme = 12_000;
      const text =
        readme.length > maxReadme ? `${readme.slice(0, maxReadme)}\n…` : readme;
      extraChunks.push({
        id: `github-readme-${matchedSlug}`,
        label: `Repository README: ${owner}/${matchedSlug}`,
        text,
      });
    }
  }

  const contextChunks = [...extraChunks, ...top];
  const contextBlock = formatContextForPrompt(contextChunks);

  const userPayload = [
    historyText && `Prior conversation:\n${historyText}\n`,
    isIdentityQuery(lastUser.content) &&
      "This question is about who Akash is. Answer as a short bio: lead with his M.S. at UMD and focus areas; mention prior work only briefly. Do not lead with Cisco or list unrelated school repos.",
    isExperienceCareerQuery(lastUser.content) &&
      "Several work-experience sources are below — mention every role (company, title, period) in crisp bullets, not only one internship.",
    extraChunks.length > 0 &&
      "A README excerpt is included below when available — use it for purpose, implementation, and stack details.",
    `Answer using ONLY the retrieved context below. If it is insufficient, use the exact fallback sentence from your instructions.\n\n--- RETRIEVED CONTEXT ---\n${contextBlock}\n--- END CONTEXT ---\n`,
    `Latest question:\n${lastUser.content}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const maxOutputTokens = extraChunks.length
    ? CHAT_MAX_OUT_README
    : isExperienceCareerQuery(lastUser.content)
      ? CHAT_MAX_OUT_EXPERIENCE
      : isIdentityQuery(lastUser.content)
        ? CHAT_MAX_OUT_IDENTITY
        : CHAT_MAX_OUT_DEFAULT;

  const modelId = geminiModelId();

  try {
    const text = await generateGeminiChatReply({
      apiKey,
      systemInstruction: SYSTEM_INSTRUCTION,
      userText: userPayload,
      maxOutputTokens,
      temperature: 0.25,
      modelId,
    });

    if (cacheKey && shouldUseResponseCache(lastUser.content)) {
      setCachedResponse(cacheKey, text);
    }

    return NextResponse.json({ reply: text, source: "gemini" });
  } catch (e) {
    const { message, retryAfterSec, status } = friendlyGeminiError(e);
    const headers: Record<string, string> = {};
    if (retryAfterSec != null) {
      headers["Retry-After"] = String(retryAfterSec);
    }
    return NextResponse.json({ error: message }, { status, headers });
  }
}
