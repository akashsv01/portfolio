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

The floating chat calls **Groq** on the server using the [OpenAI-compatible API](https://console.groq.com/) (`openai` SDK, `baseURL` `https://api.groq.com/openai/v1`) with **retrieval from your own data** (`lib/data.ts`, optional `content/portfolio-knowledge.md`, and cached GitHub public-repo metadata). Lexical matching only — no separate vector DB or embedding API in this repo.

1. Create an API key in the [Groq console](https://console.groq.com/keys).
2. Add to `.env.local` (never commit real keys):

   ```bash
   GROQ_API_KEY=your_key_here
   ```

   Optional: `GROQ_MODEL=llama-3.1-8b-instant` to override the default in `lib/chat/constants.ts`.

3. Restart `npm run dev`. Without `GROQ_API_KEY`, the chat UI still loads but the API returns a configuration message.

Rate limits are applied per IP in `lib/chat/rateLimit.ts`. To **reduce LLM calls**, the route serves **static replies** for common greetings/thanks and uses an **in-memory response cache** (exact + semantic keys, 24h TTL, LRU cap) for repeat questions; README-backed answers are not cached. Retrieval uses **fewer lexical chunks** by default; identity/experience paths still pull enough context.

Groq applies its own **rate and usage limits**; see the [Groq docs](https://console.groq.com/docs/rate-limits) and your dashboard if you see **429** errors.

The assistant also pulls **public repository metadata** from GitHub (name, description, topics, language) for the username in `lib/data.ts`, cached for several minutes. For “how it was implemented” or “main purpose” style questions, it may fetch the repo **README** (extra GitHub API call). Optional **`GITHUB_TOKEN`** in `.env.local` raises the [GitHub REST rate limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) for those calls.

### Other scripts

| Command        | Description                |
| -------------- | -------------------------- |
| `npm run build` | Production build           |
| `npm run start` | Run production server (after `build`) |
| `npm run lint`  | Run ESLint                 |

---

## Deploy

This app is a standard Next.js project and deploys cleanly on [Vercel](https://vercel.com) or any host that supports Node. Add **`GROQ_API_KEY`** (and optional **`GROQ_MODEL`**) in the host’s environment variables — **never** as `NEXT_PUBLIC_*`. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
