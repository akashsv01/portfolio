# Akash S Vora — Portfolio

Personal portfolio site: projects, skills network, experience timeline, interactive hero (Three.js), and a terminal-style section. Built with [Next.js](https://nextjs.org) (App Router), React, TypeScript, and Tailwind CSS.

## Run locally

**Requirements:** [Node.js](https://nodejs.org/) 20+ (LTS recommended) and npm.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

3. **Open the site** in your browser at [http://localhost:3000](http://localhost:3000) (Next.js uses port **3000** by default; if that port is busy, the terminal will print the URL it actually uses).

### Portfolio assistant (optional chat)

The floating chat calls **Gemini** on the server via the [Google AI Studio API](https://ai.google.dev/) (`@google/generative-ai`) with **retrieval from your own data** (`lib/data.ts`, optional `content/portfolio-knowledge.md`, and cached GitHub public-repo metadata). Lexical matching only — no separate vector DB or embedding API in this repo.

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Add to `.env.local` (never commit real keys):

   ```bash
   GEMINI_API_KEY=your_key_here
   ```

   Optional: `GEMINI_MODEL=gemini-2.5-flash` if you want the non-lite model instead of the default `gemini-2.5-flash-lite`.

3. Restart `npm run dev`. Without `GEMINI_API_KEY`, the chat UI still loads but the API returns a configuration message.

Rate limits are applied per IP in `lib/chat/rateLimit.ts`. To **reduce Gemini calls**, the route serves **static replies** for common greetings/thanks and uses an **in-memory response cache** (exact + semantic keys, 24h TTL, LRU cap) for repeat questions; README-backed answers are not cached. Retrieval uses **fewer lexical chunks** by default; identity/experience paths still pull enough context.

Google’s **free tier** also caps requests per day per model (often **tight**—see [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) and [usage](https://ai.dev/rate-limit)). If you see **429** / daily quota errors, wait until the next day, set **`GEMINI_MODEL`** to another model (e.g. `gemini-2.5-flash`), or enable billing in AI Studio.

The assistant also pulls **public repository metadata** from GitHub (name, description, topics, language) for the username in `lib/data.ts`, cached for several minutes. For “how it was implemented” or “main purpose” style questions, it may fetch the repo **README** (extra GitHub API call). Optional **`GITHUB_TOKEN`** in `.env.local` raises the [GitHub REST rate limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) for those calls.

### Other scripts

| Command        | Description                |
| -------------- | -------------------------- |
| `npm run build` | Production build           |
| `npm run start` | Run production server (after `build`) |
| `npm run lint`  | Run ESLint                 |

---

## Deploy

This app is a standard Next.js project and deploys cleanly on [Vercel](https://vercel.com) or any host that supports Node. Add **`GEMINI_API_KEY`** (and optional **`GEMINI_MODEL`**) in the host’s environment variables — **never** as `NEXT_PUBLIC_*`. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
