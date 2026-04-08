import type { KnowledgeChunk } from "./buildKnowledge";

function tokenize(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9+#.]+/g) ?? []).filter((w) => w.length > 1);
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Extra tokens merged into lexical scoring so paraphrases (e.g. "reviews" → testimonials)
 * still surface the right chunks. Does not replace the original query string for slug heuristics.
 */
const RETRIEVAL_SYNONYM_RULES: { test: (q: string) => boolean; inject: string[] }[] = [
  {
    test: (q) =>
      /\b(recommendations?|reviews?|feedback|references?|testimonials?)\b/.test(q) ||
      /what\s+people\s+say/.test(q),
    inject: ["testimonial", "recommendation", "linkedin"],
  },
  {
    test: (q) =>
      /\b(certifications?|certificates?|certs?|credentials?|badges?|credly|licen[sc]es?)\b/.test(q),
    inject: ["certification", "credential", "cisco", "ccna", "devnet"],
  },
  {
    test: (q) =>
      /\b(awards?|honou?rs?|achievements?|recognition|medals?)\b/.test(q),
    inject: ["honor", "award", "gold", "medal", "vasavi", "volunteer"],
  },
  {
    test: (q) =>
      /\b(work\s+history|employment|jobs?|career|internships?|companies|where\s+(did|has)\s+he\s+work|professional\s+background|resume|cv)\b/.test(
        q
      ),
    inject: ["experience", "cisco", "intern", "engineer", "company"],
  },
  {
    test: (q) =>
      /\b(tech\s*stack|technologies|tools|languages?|programming|what\s+does\s+he\s+know|what\s+can\s+he\s+do|frameworks?)\b/.test(
        q
      ),
    inject: ["skills", "python", "django", "angular", "typescript"],
  },
  {
    test: (q) =>
      /\b(education|degree|university|college|masters?|bachelors?|school|graduated|student)\b/.test(q),
    inject: ["timeline", "masters", "bachelors", "maryland", "vasavi", "education"],
  },
  {
    test: (q) =>
      /\b(contact|email|reach|hire|connect|phone|message|get\s+in\s+touch|linkedin)\b/.test(q),
    inject: ["email", "profile", "phone", "location", "akashvora"],
  },
];

function expandRetrievalTokens(query: string): string[] {
  const q = query.toLowerCase();
  const base = unique(tokenize(query));
  const extra: string[] = [];
  for (const rule of RETRIEVAL_SYNONYM_RULES) {
    if (rule.test(q)) extra.push(...rule.inject);
  }
  return unique([...base, ...extra]);
}

/** Extra weight when the query mentions multiple tokens from a repo slug (e.g. grade + calculator). */
function slugMatchBoost(query: string, chunk: KnowledgeChunk): number {
  if (!chunk.id.startsWith("github-repo-")) return 0;
  const slug = chunk.id.slice("github-repo-".length).toLowerCase();
  const parts = slug.split(/[-_]+/).filter((p) => p.length > 1);
  const q = query.toLowerCase();
  let hits = 0;
  for (const p of parts) {
    if (q.includes(p)) hits += 1;
  }
  if (hits >= 2) return 4;
  if (hits === 1) return 1.5;
  return 0;
}

/** Lexical retrieval (no embedding API calls) — free and fast for portfolio Q&A. */
export function retrieveTopChunks(
  query: string,
  chunks: KnowledgeChunk[],
  topK: number,
  minScore: number
): { chunks: KnowledgeChunk[]; scores: number[]; maxScore: number } {
  const qTokens = expandRetrievalTokens(query);
  if (qTokens.length === 0) {
    const profile = chunks.find((c) => c.id === "profile");
    return {
      chunks: profile ? [profile] : chunks.slice(0, 1),
      scores: [1],
      maxScore: 1,
    };
  }

  const qSet = new Set(qTokens);
  const scored = chunks.map((chunk) => {
    const hay = `${chunk.label}\n${chunk.text}`.toLowerCase();
    const ct = tokenize(hay);
    let hits = 0;
    for (const w of ct) {
      if (qSet.has(w)) hits += 1;
    }
    // Boost label / project name matches
    const labelLower = chunk.label.toLowerCase();
    for (const t of qTokens) {
      if (labelLower.includes(t)) hits += 3;
    }
    const norm = Math.sqrt(ct.length + 12);
    let score = hits / norm;
    score += slugMatchBoost(query, chunk);
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const maxScore = scored[0]?.score ?? 0;
  const picked = scored
    .filter((s) => s.score >= minScore)
    .slice(0, topK)
    .map((s) => s.chunk);

  const fallback =
    picked.length > 0
      ? picked
      : scored.slice(0, Math.min(3, scored.length)).map((s) => s.chunk);

  return {
    chunks: fallback,
    scores: scored.slice(0, topK).map((s) => s.score),
    maxScore,
  };
}

/** Labels each block for the model only — avoid "Source 1" style markers so replies stay human-readable. */
export function formatContextForPrompt(chunks: KnowledgeChunk[]): string {
  return chunks
    .map((c) => `---\nSection: ${c.label}\n${c.text}\n`)
    .join("\n");
}

/**
 * Thanks, praise, or brief chitchat — not a request for portfolio facts.
 * Without this, the model may still answer from retrieved chunks and sound like a random bio.
 */
export function isCasualFeedbackOrThanks(query: string): boolean {
  const s = query.toLowerCase().trim();
  if (s.length > 220) return false;
  if (/\b(akash|portfolio|project|repo|github|experience|intern|resume|skill|work|education|degree|umd|build|built|code)\b/.test(s)) {
    return false;
  }
  if (
    /\b(what|who|where|how)\b/.test(s) &&
    /\b(akash|his|portfolio|project|experience|github|repo|resume|umd)\b/.test(s)
  ) {
    return false;
  }
  if (/\b(tell|describe|explain|list|show)\b/.test(s)) return false;
  if (/\?/.test(s) && s.length > 28) return false;
  if (/\b(thanks?|thank you|thx|ty|appreciate|grateful)\b/.test(s)) return true;
  if (/\b(you'?re|you are)\s+(awesome|great|amazing|the best|helpful|cool|nice)\b/.test(s)) return true;
  if (/^(super|nice|cool|great|awesome|love it|love this|perfect)\b/i.test(s)) return true;
  if (/\b(great job|well done|good job)\b/.test(s)) return true;
  return false;
}

/** Broad "who is Akash" / bio style questions — need profile + about + UMD, not random repos. */
export function isIdentityQuery(query: string): boolean {
  const s = query.toLowerCase().trim();
  if (/\bwho\s+is\s+akash\b/.test(s)) return true;
  if (/\bwhat\s+is\s+akash\b/.test(s)) return true;
  if (/^about\s+akash\b/.test(s)) return true;
  if (/\btell\s+me\s+about\s+akash\b/.test(s)) return true;
  if (/\bakash\s+bio\b/.test(s)) return true;
  if (/\bintroduce\s+akash\b/.test(s)) return true;
  if (/\bwhat\s+do\s+you\s+know\s+about\s+akash\b/.test(s)) return true;
  return false;
}

/** User asks how something was built / implemented — README helps when available. */
export function wantsImplementationDetail(query: string): boolean {
  const s = query.toLowerCase();
  if (/\bhow\b.*\b(did|does|was|is)\b.*\b(implement|built|made|code|write|design)\b/.test(s)) {
    return true;
  }
  if (/\bhow\b.*\b(it|this|the)\b.*\b(work|works|built|implemented)\b/.test(s)) return true;
  if (/\bimplementation\b/.test(s)) return true;
  if (/\barchitecture\b/.test(s)) return true;
  if (/\btech stack\b/.test(s)) return true;
  if (/\bdescribe\s+how\b/.test(s)) return true;
  return false;
}

/**
 * Fetch README when the user asks for purpose, "what did X do", explain, etc.
 * (Previously only "implementation" triggered README — so "main purpose" missed it.)
 */
export function wantsGithubReadmeContext(query: string): boolean {
  if (wantsImplementationDetail(query)) return true;
  const s = query.toLowerCase();
  if (/\bpurpose\b/.test(s)) return true;
  if (/\bwhat\s+(was|is|were)\s+the\s+(main\s+)?/.test(s)) return true;
  if (/\bwhat\s+did\b/.test(s)) return true;
  if (/\bwhat\s+does\b/.test(s)) return true;
  if (/\bexplain\b/.test(s)) return true;
  if (/\bdescribe\b/.test(s)) return true;
  if (/\bgoals?\b/.test(s)) return true;
  return false;
}

/** Work history — must include every exp-* chunk, not one role that lexical search favors. */
export function isExperienceCareerQuery(query: string): boolean {
  const s = query.toLowerCase();
  if (/\bexperience\b/.test(s)) return true;
  if (/\bwork\s+history\b/.test(s)) return true;
  if (/\bemployment\b/.test(s)) return true;
  if (/\b(jobs?|career|internship|internships)\b/.test(s)) return true;
  if (/\bprofessional\s+(background|experience)\b/.test(s)) return true;
  if (/\bwhere\s+(did|has)\s+he\s+work/.test(s)) return true;
  if (/\bcompanies\b/.test(s)) return true;
  if (/\bresume\b/.test(s)) return true;
  return false;
}

/** Testimonials, honors, licenses — force matching chunks so small topK still covers them. */
export function isTestimonialsHonorsCertsQuery(query: string): boolean {
  const s = query.toLowerCase();
  if (
    /\btestimonial|recommendations?|reviews?|feedback|references?|who (wrote|said|recommended)\b/.test(s)
  ) {
    return true;
  }
  if (/\b(jagadeesan|ankit kapoor|naresh tikader)\b/.test(s)) return true;
  if (/\b(honou?rs?|awards?|gold medal|young leader|volunteer|csi\b|academic excellence)\b/.test(s)) {
    return true;
  }
  if (
    /\b(certificat|licen[sc]es?|credly|ccna|devnet|blue belt|generative ai belt|cisco cred)\b/.test(s)
  ) {
    return true;
  }
  return false;
}

/** "How many repos" — must see github-summary, not only 8 random repo chunks. */
export function isGithubRepoInventoryQuery(query: string): boolean {
  const s = query.toLowerCase();
  if (/\bhow\s+many\b.*\b(repo|repos|repository|repositories|github|project|projects)\b/.test(s)) {
    return true;
  }
  if (/\bnumber\s+of\b.*\b(repo|repos|repository|repositories)\b/.test(s)) return true;
  if (/\blist\s+(all\s+)?(your\s+|akash\s+|his\s+)?(public\s+)?(repo|repos)\b/.test(s)) return true;
  if (/\bcount\b.*\b(repo|repos|repository|repositories)\b/.test(s)) return true;
  if (/\ball\s+(your\s+|akash\s+|his\s+)?(public\s+)?(repo|repos)\b/.test(s)) return true;
  return false;
}

/** Query tokens that should not drive GitHub repo description matching (too generic). */
const GITHUB_REPO_QUERY_STOPWORDS = new Set([
  "akash", "does", "have", "what", "when", "where", "those", "give", "that", "this", "with", "from", "your", "vora",
  "portfolio", "project", "projects", "repo", "repos", "link", "links", "http", "https", "github", "com", "browse",
  "please", "could", "can", "you", "tell", "about", "any", "some", "there", "them", "they", "also", "and", "the",
  "public", "his", "him", "she", "her", "who", "how", "are", "was", "were", "for", "not",
]);

function userAskedForConcreteRepoLinks(query: string): boolean {
  const q = query.toLowerCase();
  if (/\b(those|the)\s+(repo|repos|links?|urls?)\b/.test(q)) return true;
  if (/\b(give|send|show|share)\s+(me\s+)?(the\s+)?(repo|repos|links?|urls?)\b/.test(q)) return true;
  if (/\b(repo|github)\s+(links?|urls?)\b/.test(q)) return true;
  if (/\bcan\s+i\s+(see|get|have)\b.*\b(repo|link)/.test(q)) return true;
  return false;
}

/**
 * Drop per-repo GitHub API chunks unless the question clearly needs them. Lexical search
 * otherwise buries portfolio chunks (skills, featured projects) behind dozens of repo lines.
 * Inventory questions, link requests, slug matches, and description keyword matches still see repos.
 */
export function filterGithubRepoNoise(query: string, chunks: KnowledgeChunk[]): KnowledgeChunk[] {
  if (isGithubRepoInventoryQuery(query)) return chunks;

  const q = query.toLowerCase();
  if (/\bgithub\b/.test(q) && /\b(repo|repos|repositories)\b/.test(q)) return chunks;
  if (userAskedForConcreteRepoLinks(query)) return chunks;

  const keepIds = new Set<string>();
  for (const c of chunks) {
    if (!c.id.startsWith("github-repo-")) continue;
    const slug = c.id.slice("github-repo-".length);
    const parts = slug.toLowerCase().split(/[-_]+/).filter((p) => p.length > 1);
    let score = 0;
    for (const p of parts) {
      if (q.includes(p)) score += 2;
    }
    if (score >= 2) keepIds.add(c.id);
  }

  const hayTokens = unique(
    tokenize(query).filter((t) => t.length >= 3 && !GITHUB_REPO_QUERY_STOPWORDS.has(t))
  );
  for (const c of chunks) {
    if (!c.id.startsWith("github-repo-")) continue;
    const hay = `${c.label}\n${c.text}`.toLowerCase();
    for (const t of hayTokens) {
      if (hay.includes(t)) {
        keepIds.add(c.id);
        break;
      }
    }
  }

  return chunks.filter((c) => !c.id.startsWith("github-repo-") || keepIds.has(c.id));
}

/** Best public repo slug when the question names a project (e.g. grade + calculator → grade-calculator). */
export function bestMatchingGithubRepoSlug(query: string, chunks: KnowledgeChunk[]): string | null {
  const q = query.toLowerCase();
  let best: { slug: string; score: number } | null = null;
  for (const c of chunks) {
    if (!c.id.startsWith("github-repo-")) continue;
    const slug = c.id.slice("github-repo-".length);
    const parts = slug.toLowerCase().split(/[-_]+/).filter((p) => p.length > 1);
    let score = 0;
    for (const p of parts) {
      if (q.includes(p)) score += 2;
    }
    if (score > (best?.score ?? 0)) best = { slug, score };
  }
  return best && best.score >= 2 ? best.slug : null;
}

/**
 * Identity questions always include profile, about, and masters timeline so answers
 * lead with UMD student status; remaining slots fill from lexical retrieval.
 */
export function pickChunksForQuery(
  query: string,
  chunks: KnowledgeChunk[],
  topK: number,
  minScore: number
): KnowledgeChunk[] {
  const pool = filterGithubRepoNoise(query, chunks);
  const summary = pool.find((c) => c.id === "github-summary");

  if (isTestimonialsHonorsCertsQuery(query)) {
    const testimonialChunks = pool.filter((c) => c.id.startsWith("testimonial-"));
    const certChunk = pool.find((c) => c.id === "certifications-licenses");
    const honorsChunk = pool.find((c) => c.id === "honors-awards");
    const forced = [certChunk, honorsChunk, ...testimonialChunks].filter(Boolean) as KnowledgeChunk[];
    const forcedIds = new Set(forced.map((c) => c.id));
    const rest = retrieveTopChunks(query, pool, topK, minScore).chunks.filter(
      (c) => !forcedIds.has(c.id)
    );
    const cap = Math.max(topK, forced.length + 2);
    return [...forced, ...rest].slice(0, cap);
  }

  if (isGithubRepoInventoryQuery(query) && summary) {
    const rest = retrieveTopChunks(query, pool, topK, minScore).chunks.filter(
      (c) => c.id !== "github-summary" && !c.id.startsWith("github-repo-")
    );
    return [summary, ...rest].slice(0, topK);
  }

  if (isExperienceCareerQuery(query)) {
    const expChunks = pool
      .filter((c) => /^exp-\d+$/.test(c.id))
      .sort((a, b) => {
        const na = parseInt(a.id.replace("exp-", ""), 10);
        const nb = parseInt(b.id.replace("exp-", ""), 10);
        return na - nb;
      });
    const rest = retrieveTopChunks(query, pool, topK, minScore).chunks.filter(
      (c) => !/^exp-\d+$/.test(c.id)
    );
    const cap = Math.min(24, Math.max(topK, expChunks.length + 4));
    return [...expChunks, ...rest].slice(0, cap);
  }

  if (!isIdentityQuery(query)) {
    return retrieveTopChunks(query, pool, topK, minScore).chunks;
  }

  const profile = pool.find((c) => c.id === "profile");
  const about = pool.find((c) => c.id === "about");
  const mastersTimeline = pool.find((c) => c.id === "timeline-masters");
  const fixed = [profile, about, mastersTimeline].filter(Boolean) as KnowledgeChunk[];
  const fixedIds = new Set(fixed.map((c) => c.id));
  const { chunks: top } = retrieveTopChunks(query, pool, topK, minScore);
  const extra = top.filter((c) => !fixedIds.has(c.id));
  const cap = Math.max(topK, fixed.length + 4);
  return [...fixed, ...extra].slice(0, cap);
}
