# JSO Consultation Preparation Agent

> **Agentic JSO Phase 2 Prototype** — Powered by Groq AI (LLaMA 3)

An AI assistant that generates a personalized consultation prep pack for job seekers on the JSO platform. It asks for the user's career profile (current role, target role, goals, active applications) and returns structured, actionable guidance for HR consultations.

---

## What it does

- Collects a user's profile details via a simple form
- Calls **Groq AI** (LLaMA 3.3 via the Groq API) from a server-side Next.js API route
- Generates a structured prep pack with:
  - 6 tailored discussion topics
  - 8 career questions to ask the HR consultant
  - 5 interview preparation tips
- Displays results as an interactive, animated checklist UI

---

## Tech stack

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js 14 + React 18 + TypeScript |
| AI | Groq Llama 3.3 (via Groq API) |
| API | Next.js API Routes (serverless) |
| Styling | CSS Modules |
| Deployment | Vercel (recommended) |

---

## Local development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd jso-prep-agent
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Groq API key:

```
GROQ_API_KEY=sk-xxxxxxxxxxxxxxxx
```

Get your key at: https://console.groq.com

> **Note:** The app uses `GROQ_API_KEY` and **does not** require an Anthropic key.

### 3. Run locally

```bash
npm run dev
```

Open https://jso-agent-prototype-dvueogjna-avirups-projects-5359bcfb.vercel.app/

---

---

## Project structure

```
jso-prep-agent/
├── pages/
│   ├── _app.tsx          # App entry point
│   ├── index.tsx         # Main UI page
│   ├── index.module.css  # Page styles
│   └── api/
│       └── generate.ts   # Server-side AI call (Groq Llama 3)
├── components/
│   ├── PrepForm.tsx       # Profile input form
│   ├── PrepForm.module.css
│   ├── PrepSection.tsx    # Checklist UI section
│   └── PrepSection.module.css
├── styles/
│   └── globals.css        # Global CSS variables & resets
├── .env.example           # Template for env vars
├── .gitignore             # Keeps .env.local out of git
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## How it works (high level)

1. User fills out the form with their current role, target role, goals, and application context.
2. The frontend calls `/api/generate` with the form data.
3. The server handler builds a deterministic prompt and sends it to the Groq AI chat completion endpoint.
4. The response is parsed as JSON and returned to the client.
5. The UI renders the result as an interactive checklist.

---

## Security notes

- The Groq API key is stored only in **server-side environment variables**.
- The `/api/generate` route runs on the server — the key is **never exposed to the browser**.
- `.env.local` is included in `.gitignore` — it will **never be committed to git**.
- On Vercel, environment variables are encrypted at rest.

---

## Notes / Future improvements

- Add better validation / user feedback for required fields.
- Support history saving (localStorage or backend) so users can revisit past prep packs.
- Add a “copy to clipboard” or “download as PDF” feature for sharing.

---

