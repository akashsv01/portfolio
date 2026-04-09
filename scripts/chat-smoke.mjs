/**
 * Smoke-test /api/chat locally. Run: node scripts/chat-smoke.mjs
 * Requires `npm run dev` and GROQ_API_KEY.
 */
const BASE = process.env.CHAT_SMOKE_URL ?? "http://localhost:3000";

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

for (const q of questions) {
  const r = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
  });
  const j = await r.json();
  console.log("\n=== Q:", q);
  console.log("status:", r.status, "source:", j.source, j.cached ? "(cached)" : "");
  if (j.error) console.log("ERROR:", j.error);
  else console.log("A:", j.reply);
}
