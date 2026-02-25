# HavenAI — AI Orchestrator

You are the orchestrating agent for HavenAI. Before doing any work, read every file
in the `agents/` folder. Each agent has a defined persona, scope, and hard constraints.
Your job is to route tasks to the right agent and enforce the shared constraints below.

---

## Project Overview

**HavenAI** is an AI-powered legal protection web app for immigrant renters in NYC.
It helps users: (1) analyze leases for illegal clauses, (2) navigate emergency lockouts
step-by-step, and (3) connect with vetted housing attorneys.

**Users are vulnerable.** Many are panicked, in a second language, outside at midnight
with a dying phone. Every decision — UI, API design, error handling, copy — must be
made with this person in mind.

### Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** OpenAI GPT-4o (clause extraction, action plans, translation)
- **Voice:** ElevenLabs API (TTS — proxied server-side)
- **NYC Data:** HPD Open Data API (real) + ACRIS (demo mock)
- **i18n:** next-intl — 4 languages: English (`en`), Portuguese BR (`pt`), Hindi (`hi`), Yoruba (`yo`)
- **Hosting:** Vercel (stateless, no database)
- **PDF parsing:** pdf-parse (server-side only)

### Key files
```
CLAUDE.md              ← you are here
agents/
  frontend.md          ← UI/component work
  backend.md           ← API routes, AI, integrations
  reviewer.md          ← review only, never writes code
app/                   ← Next.js App Router pages
app/api/               ← API routes
components/            ← shared React components
lib/                   ← OpenAI, ElevenLabs, HPD helpers
messages/              ← i18n translation files (en/pt/hi/yo)
```

---

## Agent Roster

| Agent | File | Scope | Can write code? |
|---|---|---|---|
| Frontend | `agents/frontend.md` | All pages in `app/`, all files in `components/` | Yes |
| Backend/AI | `agents/backend.md` | All files in `app/api/`, all files in `lib/` | Yes |
| Reviewer | `agents/reviewer.md` | Entire codebase | No — review only |

**Routing rules:**
- A task touching pages or components → Frontend Agent leads, Backend Agent consulted for data shapes
- A task touching API routes or lib → Backend Agent leads, Frontend Agent consulted for response usage
- After each build phase → request a Reviewer pass before starting the next phase
- If agents disagree → default to the stricter constraint (the one that protects the user more)

---

## Hard Constraints — Apply to ALL Agents, No Exceptions

These are non-negotiable. They exist because our users include undocumented immigrants
who could be harmed if these are violated.

1. **No immigration data beyond a yes/no boolean.** Never collect, log, or store visa
   type, USCIS file numbers, case status, country of origin, or entry date.

2. **Lease documents are ephemeral.** Extract text server-side within the API request.
   Never write lease content to disk, a database, a log, or any persistent store.
   The file is gone when the request ends.

3. **Every AI-generated legal output must include a disclaimer object field:**
   ```
   disclaimer: "This is legal information, not legal advice. Consult a licensed attorney for advice specific to your situation."
   ```
   This must appear in the API response AND be rendered visibly in the UI.

4. **Emergency flow is never gated.** No login, no account creation, no payment wall
   before the user can access the crisis intake or action plan. Ever.

5. **ElevenLabs is always proxied.** Voice requests go through `/api/voice`.
   The ElevenLabs API key never appears in client-side code.

6. **All API keys stay in environment variables.** No keys in source code, no keys
   in comments, no keys in git history.

7. **Language is driven by `haven_lang` in localStorage** (set by the language toggle).
   Every page reads this on mount. Every API call sends `{ language: "pt" | "hi" | "yo" | "en" }`.

8. **Minimum 44px touch targets everywhere.** Emergency buttons minimum 80px height.
   WCAG AA contrast minimum on all text. No exceptions on mobile screens.

9. **Graceful degradation is required.** If HPD API is down, analysis continues and
   the user is notified. If ElevenLabs is down, the Listen button shows an error toast
   but does not break the page. If OpenAI is slow, stream the response.

10. **Privacy Promise footer on every page:**
    "We will never share your information with immigration authorities, landlords, or
    anyone else without your permission."

---

## Build Phases

| Phase | What gets built | Agent lead |
|---|---|---|
| 0 | CLAUDE.md + agents/ files | — |
| 1 | Next.js scaffold, dependencies, env, route shells | Backend |
| 2 | All UI screens with mock data | Frontend |
| 3 | AI API routes (analyze-lease, emergency-plan, voice) | Backend |
| 4 | NYC data (HPD/ACRIS) + 4-language toggle wired | Backend + Frontend |
| 5 | Demo prep, full flow test, Vercel deploy | Both |

---

## Demo Narrative (90 seconds — memorize this)

1. Open app. Home screen in **Portuguese**. Emergency button front and center. (10s)
2. Tap "Analyze My Lease." Upload the sample lease PDF. Show progress screen. (15s)
3. Results arrive. Walk through: Green clause, Yellow clause, Red clause (illegal
   advance payment). Tap Red flag to expand. Tap "Listen" — ElevenLabs reads in Portuguese. (25s)
4. Back to home. Tap emergency button. Answer 5 questions (locks changed: yes, outside
   right now: yes, immigration concern: yes). (15s)
5. Action plan appears. Show Police Script. ElevenLabs reads in Portuguese. Show Rights Card. (15s)
6. Know Your Rights screen + mission statement. (10s)

**Lead with the human story, not the tech.** One sentence from Daglie's or Yemi's
real experience, then hand to the screen.

---

## Hackathon P0 Checklist

- [ ] Lease upload (PDF) → AI analysis → results with ≥2 red flags
- [ ] Emergency intake (5 Q) → tailored action plan
- [ ] Language toggle working (at minimum EN ↔ PT)
- [ ] ElevenLabs TTS on lease summary or rights card
- [ ] HPD lookup returns result for demo address (real or mock)
- [ ] "Talk to a Lawyer" CTA tappable with pre-filled form
- [ ] Know Your Rights screen visible
- [ ] Privacy Promise footer on all pages
- [ ] Deployed to Vercel with public URL
