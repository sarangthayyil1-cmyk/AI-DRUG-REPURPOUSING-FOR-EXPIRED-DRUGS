# PharmStable – AI Drug Stability & Repurposing Companion

An AI-powered web application that estimates whether expired or aging
pharmaceuticals remain biologically active and surfaces drug-repurposing
opportunities using a heuristic degradation model and Claude-driven
pharmaceutical reasoning.

🌐 Live site: https://ai-drug-discovery.netlify.app/
🤖 Powered by Anthropic's Claude API
🎯 Built as a research-grade interactive AI product

## Features

- 🧪 **Stability Engine** — Heuristic 0–100 score that weighs time past expiry,
  temperature, humidity, light exposure, container integrity, formulation
  type, and per-drug stability class
- 🔬 **AI Discovery** — Claude generates analog compounds, structural
  modifications, related drugs, and repurposing opportunities, grounded in
  the stability context
- 💊 **Drug Autocomplete** — Searchable database of WHO essential medicines
  and EMA-aligned brand names, with auto-fill for SMILES structures and
  default stability classes
- 📊 **Verdict at a Glance** — Color-coded "Likely Active / Possibly
  Degraded / Likely Inactive" verdicts with a per-factor breakdown and
  probability gauge
- 🔐 **Authenticated History** — Every analysis is saved to the user's
  account and can be revisited or deleted from the History page
- 🎨 **Branded UI** — Custom design tokens, animated gauges, and a
  brand-green molecular logo
- 📱 **Responsive Design** — Optimised for desktop and mobile
- 🧩 **Modular Architecture** — Clear separation between algorithm, UI,
  AI client, and data layers

## Tech Stack

- Next.js 16 (App Router) with Turbopack
- TypeScript
- Tailwind CSS 4 (PostCSS-based, custom design tokens)
- Lucide React (icons)
- Anthropic Claude API (`@anthropic-ai/sdk`, model: `claude-sonnet-4-20250514`)
- Supabase (Auth, Postgres, Row-Level Security)
- Vercel (Deployment)
- Git & GitHub

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/sarangthayyil1-cmyk/AI-DRUG-REPURPOUSING-FOR-EXPIRED-DRUGS.git
cd AI-DRUG-REPURPOUSING-FOR-EXPIRED-DRUGS
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Server-side Claude API key (never exposed to the browser)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Supabase project (Auth + analysis history)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

The `NEXT_PUBLIC_*` keys are safe to expose to the browser — Supabase
authorisation is enforced via Row-Level Security on the database side, not
the anon key.

### Database Setup

In your Supabase project's SQL Editor, run [`supabase_setup.sql`](./supabase_setup.sql)
once to create the `profiles` and `analyses` tables, RLS policies, and the
`handle_new_user` trigger that creates a profile row when a user signs up.

If you ever see the error
`insert or update on table "analyses" violates foreign key constraint`,
run [`supabase_fix_history.sql`](./supabase_fix_history.sql) — it backfills
any missing `profiles` rows and repoints the foreign key to `auth.users`
so the constraint can never fail again.

### Run the development server

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

You'll land on the introduction page. Sign up, then jump into `/analyze`
to run your first stability report.

### Build

Create a production build:

```bash
npm run build
```

Start the production server locally:

```bash
npm start
```

Lint:

```bash
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/         # Stability algorithm endpoint (no external calls)
│   │   └── discover/        # Claude-powered repurposing endpoint
│   ├── auth/                # Supabase auth callback + error page
│   ├── analyze/             # Main analysis form
│   ├── history/             # Saved analyses
│   ├── login/, signup/      # Auth pages
│   ├── results/             # Verdict, gauge, factor breakdown, AI discovery
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Design tokens, form & range-slider styles
│   └── page.tsx             # Landing / introduction page with CTA
├── components/
│   ├── analyze/             # Form sections (drug ID, stability, expiry, storage)
│   ├── layout/              # Header with sign-out confirmation modal
│   └── results/             # Stability card, gauge, factor breakdown, discovery
├── lib/
│   ├── stability/           # Heuristic algorithm, constants, types
│   ├── claude/              # Prompt builders + response parsing
│   ├── drugs/               # WHO/EMA drug dataset + fuzzy search
│   └── supabase/            # Browser Supabase client
├── hooks/                   # useDebounce, useDrugSearch
└── middleware.ts            # Route protection (analyze/results/history)
```

## Stability Algorithm

The heuristic model starts at 100 (fully active) and applies weighted penalties:

| Factor              | Weight | Calculation                                              |
| ------------------- | ------ | -------------------------------------------------------- |
| Time since expiry   | ~40%   | Multi-phase penalties (0–6mo, 6–24mo, 24+mo past expiry) |
| Temperature         | ~20%   | Optimal 15–25°C, escalating penalties at extremes        |
| Humidity            | ~15%   | Optimal <40% RH, scaled by formulation type              |
| Container integrity | ~15%   | Sealed (0), opened (−15), damaged (−30)                  |
| Light exposure      | ~10%   | None (0), indirect (−10), direct (−25)                   |
| Formulation         | ~5%    | Tablet / capsule / liquid / injectable modifiers         |

All penalties are scaled by the drug's `StabilityClass` (1–5, Very Stable
to Highly Unstable). Drugs that aren't yet expired receive a small
stability bonus.

**Verdicts**

- `≥ 65` → Likely Active (low risk)
- `35–64` → Possibly Degraded (medium risk)
- `< 35` → Likely Inactive (high risk)

## Architecture Notes

- **Server-side Claude calls** so the API key is never exposed to the
  browser — the frontend POSTs to `/api/discover`, which calls Anthropic
  with `process.env.ANTHROPIC_API_KEY`
- **Structured JSON output** from Claude, parsed defensively so a malformed
  response degrades to an empty discovery payload rather than a crash
- **Heuristic stability calculation** is fully algorithmic with zero
  external calls — runs server-side at `/api/analyze` for consistency
- **Supabase RLS** ensures every user can only read, write, and delete
  their own analysis history — enforced at the database, not the app
- **Middleware-based route protection** for `/analyze`, `/results`, and
  `/history`, with logged-in users redirected away from `/login` and
  `/signup`
- **Stateless results pipeline** — analysis results are passed to the
  results page via `sessionStorage`, so URLs stay clean and shareable
  results are an explicit follow-up rather than an accidental leak
- **Defensive history save** — on a foreign-key violation the app
  auto-creates the missing profile row and retries, surfacing the exact
  Postgres error code if anything still fails

## Deployment

Deployed on Vercel. Production builds deploy automatically on every push
to `main`. Set the same environment variables (`ANTHROPIC_API_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the
Vercel project settings.

A GitHub Actions keepalive workflow pings the Supabase project on a
schedule to prevent the free-tier instance from being paused for inactivity.

## 🚀 Roadmap

PharmStable is actively evolving. Upcoming improvements include:

- RDKit integration for molecular property calculations
- Arrhenius kinetics for temperature-dependent degradation modelling
- ML-based stability prediction trained on historical pharmaceutical data
- 2D / 3D molecular structure visualisation
- Shareable, signed result links
- Bulk CSV import for stockpile audits (NGOs, pharmacies, hospitals)
- Expanded EMA / FDA brand-name coverage

Feedback and iteration are ongoing.

## Disclaimer

This tool provides heuristic estimates for research and educational
purposes only. Results are **not clinically validated** and must not be
used as the basis for medical decisions. Always consult a qualified
pharmacist or physician before using any medication past its labelled
expiry date.

## License

MIT License
