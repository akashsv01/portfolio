import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { personal } from "@/lib/data";
import {
  buildKnowledgeChunksFromSite,
  chunksFromExtendedMarkdown,
  type KnowledgeChunk,
} from "./buildKnowledge";
import { getGithubPublicRepoCount, getGithubRepoChunks } from "./fetchGithubRepos";

const EXTENDED_PATH = join(process.cwd(), "content", "portfolio-knowledge.md");

/** GitHub login from `personal.github` (e.g. akashsv01) — used by chat + README fetch. */
export function githubUsernameFromProfile(): string {
  try {
    const path = new URL(personal.github).pathname.replace(/\/$/, "");
    return path.split("/").filter(Boolean).pop() ?? "";
  } catch {
    return "";
  }
}

const MAX_GITHUB_NAMES_CHARS = 22_000;

function createGithubSummaryChunk(
  repoChunks: KnowledgeChunk[],
  officialPublicCount: number | null,
  profileUrl: string
): KnowledgeChunk | null {
  const names = repoChunks
    .filter((c) => c.id.startsWith("github-repo-"))
    .map((c) => c.id.slice("github-repo-".length));
  if (names.length === 0 && officialPublicCount == null) return null;

  let nameList = names.join(", ");
  if (nameList.length > MAX_GITHUB_NAMES_CHARS) {
    nameList = `${nameList.slice(0, MAX_GITHUB_NAMES_CHARS)}…(truncated)`;
  }

  const lines: string[] = [];
  if (officialPublicCount != null) {
    lines.push(
      `Official public repository count from GitHub (GET /users — field public_repos): ${officialPublicCount}`
    );
  }
  lines.push(
    `Repositories loaded into this assistant from GET /users/{username}/repos (paginated): ${names.length}`
  );
  if (officialPublicCount != null && names.length !== officialPublicCount) {
    lines.push(
      `If the two numbers differ, the listing may still be paginating, rate-limited, or filtered; cite the official count (${officialPublicCount}) and profile URL.`
    );
  }
  lines.push(`Profile URL: ${profileUrl}`);
  if (names.length > 0) {
    lines.push(`All repository names in this index: ${nameList}`);
  }

  return {
    id: "github-summary",
    label: "GitHub public repositories — official count & indexed names",
    text: lines.join("\n\n"),
  };
}

/** Site data + live GitHub public repos (cached) + optional `content/portfolio-knowledge.md`. */
export async function loadAllKnowledgeChunks(): Promise<KnowledgeChunk[]> {
  const base = buildKnowledgeChunksFromSite();
  const ghUser = githubUsernameFromProfile();
  const githubChunks = ghUser ? await getGithubRepoChunks(ghUser) : [];
  const officialCount = ghUser ? await getGithubPublicRepoCount(ghUser) : null;
  const summaryChunk = ghUser ? createGithubSummaryChunk(githubChunks, officialCount, personal.github) : null;

  let extra = "";
  try {
    extra = await readFile(EXTENDED_PATH, "utf8");
  } catch {
    // optional file
  }
  return [
    ...base,
    ...(summaryChunk ? [summaryChunk] : []),
    ...githubChunks,
    ...chunksFromExtendedMarkdown(extra),
  ];
}
