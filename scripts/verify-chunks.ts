/**
 * Verify RAG chunk IDs per question (no Gemini). Run: npx tsx scripts/verify-chunks.ts
 */
import { RAG_MIN_SCORE, RAG_TOP_K } from "../lib/chat/constants";
import { loadAllKnowledgeChunks } from "../lib/chat/loadKnowledge";
import { bestMatchingGithubRepoSlug, pickChunksForQuery } from "../lib/chat/retrieve";

const questions = [
  "Who is Akash?",
  "What are Akash's skills?",
  "Tell me about his experience at Cisco",
  "What do people say about working with Akash?",
  "Does Akash have any certifications?",
  "What awards has Akash received?",
  "What projects has Akash built?",
  "How can I contact Akash?",
  "Tell me about his Traffic Signs Classifier project",
  "Can I hire him?",
];

async function main() {
  const chunks = await loadAllKnowledgeChunks();

  for (const q of questions) {
    const top = pickChunksForQuery(q, chunks, RAG_TOP_K, RAG_MIN_SCORE);
    const slug = bestMatchingGithubRepoSlug(q, chunks);
    console.log("\nQ:", q);
    console.log("  ids:", top.map((c) => c.id).join(", "));
    if (slug) console.log("  repo slug hint:", slug);
  }
}

void main();
