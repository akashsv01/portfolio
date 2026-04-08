import type { KnowledgeChunk } from "./buildKnowledge";

type GhRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics: string[] | null;
  fork: boolean;
  archived: boolean;
};

const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { username: string; chunks: KnowledgeChunk[]; expires: number } | null = null;

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "akash-portfolio-chat/1.0",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

/** Fetches all public repos for a user (paginated). Free: 60 req/hr without token; higher with GITHUB_TOKEN. */
async function fetchAllRepos(username: string): Promise<GhRepo[]> {
  const out: GhRepo[] = [];
  let page = 1;
  const perPage = 100;

  for (;;) {
    // `type=all` matches the broad public-repo listing (owner + collaborator visibility the API exposes).
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated&type=all`;
    const res = await fetch(url, { headers: headers(), cache: "no-store" });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`GitHub API ${res.status}: ${err.slice(0, 200)}`);
    }

    const batch = (await res.json()) as GhRepo[];
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
    if (page > 50) break;
  }

  return out;
}

let publicCountCache: { username: string; count: number; expires: number } | null = null;

/** Official `public_repos` from GET /users/{username} — matches the number on the GitHub profile. */
export async function getGithubPublicRepoCount(username: string): Promise<number | null> {
  const u = username.trim();
  if (!u) return null;

  if (publicCountCache && publicCountCache.username === u && Date.now() < publicCountCache.expires) {
    return publicCountCache.count;
  }

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(u)}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { public_repos?: number };
    const n = typeof data.public_repos === "number" ? data.public_repos : null;
    if (n != null) {
      publicCountCache = { username: u, count: n, expires: Date.now() + CACHE_TTL_MS };
    }
    return n;
  } catch {
    return null;
  }
}

function reposToChunks(username: string, repos: GhRepo[]): KnowledgeChunk[] {
  return repos.map((r) => {
    const topics = (r.topics ?? []).filter(Boolean).join(", ");
    const bits = [
      `Repository: ${r.name}`,
      r.full_name !== `${username}/${r.name}` ? `Full name: ${r.full_name}` : "",
      r.description ? `Description: ${r.description}` : "Description: (none)",
      r.language ? `Primary language: ${r.language}` : "",
      topics ? `Topics: ${topics}` : "",
      `URL: ${r.html_url}`,
      r.fork ? "Note: fork" : "",
      r.archived ? "Note: archived" : "",
    ].filter(Boolean);

    return {
      id: `github-repo-${r.name}`,
      label: `GitHub repo: ${r.name}`,
      text: bits.join("\n"),
    };
  });
}

/**
 * Cached chunks from GitHub public API (all public repos for the profile).
 * Fail-soft: returns [] or stale cache on error so chat still works from site data only.
 */
export async function getGithubRepoChunks(username: string): Promise<KnowledgeChunk[]> {
  const u = username.trim();
  if (!u) return [];

  if (cache && cache.username === u && Date.now() < cache.expires) {
    return cache.chunks;
  }

  try {
    const repos = await fetchAllRepos(u);
    const chunks = reposToChunks(u, repos);
    cache = { username: u, chunks, expires: Date.now() + CACHE_TTL_MS };
    return chunks;
  } catch {
    if (cache?.username === u) {
      return cache.chunks;
    }
    return [];
  }
}

const readmeCache = new Map<string, { text: string; expires: number }>();
const README_TTL_MS = 60 * 60 * 1000;

/** Raw README.md from a public repo (for "how was it implemented" questions). Cached per repo. */
export async function getGithubReadmeCached(owner: string, repo: string): Promise<string | null> {
  const o = owner.trim();
  const r = repo.trim();
  if (!o || !r) return null;

  const key = `${o}/${r}`;
  const hit = readmeCache.get(key);
  if (hit && Date.now() < hit.expires) return hit.text;

  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(o)}/${encodeURIComponent(r)}/readme`;
    const res = await fetch(url, {
      headers: {
        ...headers(),
        Accept: "application/vnd.github.raw",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = await res.text();
    const trimmed = text.length > 16000 ? `${text.slice(0, 16000)}\n…(truncated)` : text;
    readmeCache.set(key, { text: trimmed, expires: Date.now() + README_TTL_MS });
    return trimmed;
  } catch {
    return null;
  }
}
