# HavenAI

**Know your rights. Protect your home.**

AI-powered legal protection for immigrant renters in New York City. Free, instant, multilingual — no login required.

[**Watch the Demo**](https://vimeo.com/1168347799?fl=ip&fe=ec)

---

## What It Does

HavenAI helps renters — regardless of immigration status, language, or income — understand their leases, assert their rights, and access legal help.

| Feature | Description |
|---|---|
| **Lease Analysis** | Upload a PDF, DOCX, or photo. AI flags illegal clauses with legal citations and plain-language explanations. |
| **Landlord & Property Report** | Automatic ACRIS ownership verification and HPD violation history lookup. |
| **Emergency Lockout Guide** | 24/7 crisis guidance with a step-by-step action plan, shareable rights card, and police script. |
| **Know Your Rights** | 9 key NYC tenant protections explained in plain language. |
| **Lawyer Matching** | Connect with vetted, multilingual housing attorneys — free initial consultation. |

All features work in **5 languages**: English, Spanish, Portuguese, Hindi, and Yorùbá — with full voice support (text-to-speech and speech-to-text).

## Tech Stack

- **Framework** — Next.js 16 (App Router), React 19, TypeScript
- **Styling** — Tailwind CSS 4, Framer Motion, shadcn/ui (Radix)
- **AI** — OpenAI GPT-4o-mini (structured JSON schema outputs)
- **Voice** — ElevenLabs TTS + Scribe STT
- **Document Parsing** — `pdf-parse`, `mammoth`, OCR for images
- **Data** — NYC HPD Open Data API, ACRIS property records
- **Validation** — Zod

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- An [ElevenLabs API key](https://elevenlabs.io/) (for voice features)

### Setup

```bash
git clone https://github.com/your-org/havenai.git
cd havenai
npm install
```

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── page.tsx                 # Landing page
├── onboarding/page.tsx      # Language + profile selection
├── dashboard/page.tsx       # Main hub
├── lease/
│   ├── page.tsx             # Lease upload
│   └── results/page.tsx     # Flagged clauses + landlord report
├── emergency/
│   ├── page.tsx             # Crisis intake (questions or voice)
│   └── plan/page.tsx        # Action plan + rights card + hotlines
├── rights/page.tsx          # Know Your Rights
├── lawyer/page.tsx          # Attorney directory + consultation form
└── api/
    ├── analyze-lease/       # Lease document analysis
    ├── emergency-plan/      # Emergency action plan generation
    ├── stt/                 # Speech-to-text proxy
    └── voice/               # Text-to-speech proxy
components/
├── PrivacyFooter.tsx
└── ui/                      # shadcn/ui components
```

## Privacy

- **No accounts.** No login, no signup, no PII collection.
- **No persistence.** Documents are processed in memory and never saved. Session data is cleared when the tab closes.
- **No tracking.** No analytics, no cookies, no third-party data sharing.
- **Server-side keys only.** API credentials never reach the client.

> *"We will never share your information with immigration authorities, landlords, or anyone else without your permission."*

## Legal Disclaimer

HavenAI provides legal **information**, not legal advice. It does not create an attorney-client relationship. Consult a licensed attorney for advice specific to your situation.

## License

[MIT](LICENSE)
