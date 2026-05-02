# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Install & Run**
```bash
npm install
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

**Environment Setup**
- Copy `.env.example` to `.env.local`
- Set `ANTHROPIC_API_KEY=your-api-key-here` (server-side only, not in frontend code)

## Project Architecture

**PharmStable** is a drug stability analysis system that estimates whether expired/aging drugs remain biologically active using heuristic degradation modeling and AI-powered drug discovery suggestions via Claude.

### High-Level Flow

1. **User Input** (`/analyze` page)
   - Select drug from autocomplete (~170 WHO essential medicines)
   - Input storage conditions (temperature, humidity, light, container integrity)
   - Select stability class and expiry date

2. **Stability Analysis** (`/api/analyze` endpoint)
   - Heuristic algorithm calculates a 0-100 stability score
   - Returns probability of retained activity, verdict, and factor breakdown
   - No external API calls—purely algorithmic

3. **AI Discovery** (`/api/discover` endpoint, optional)
   - Server-side Claude API call with stability analysis context
   - Claude suggests: analog compounds, structural modifications, related drugs, repurposing opportunities
   - Structured JSON response parsed and displayed

4. **Results Display** (`/results` page)
   - Verdict badge, probability gauge, factor breakdown chart
   - Optional discovery suggestions from Claude

### Directory Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── analyze/page.tsx          # Form input page
│   ├── results/page.tsx          # Results display page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Redirects to /analyze
│   └── api/
│       ├── analyze/route.ts      # Stability calculation endpoint
│       └── discover/route.ts     # Claude discovery endpoint
├── components/
│   ├── analyze/
│   │   ├── AnalysisForm.tsx      # Main form orchestrator
│   │   ├── DrugAutocomplete.tsx  # Drug search component
│   │   ├── DrugIdentification.tsx
│   │   ├── ExpiryAgeSection.tsx
│   │   ├── StabilityClassSelector.tsx
│   │   └── StorageConditions.tsx
│   ├── results/
│   │   ├── StabilityResult.tsx   # Main results component
│   │   ├── ProbabilityGauge.tsx  # Visual gauge
│   │   ├── FactorBreakdown.tsx   # Penalty breakdown
│   │   └── DiscoverySuggestions.tsx
│   └── layout/
│       └── Header.tsx
├── lib/
│   ├── stability/
│   │   ├── algorithm.ts          # Core scoring logic
│   │   ├── constants.ts          # Penalty tables, multipliers
│   │   └── types.ts              # Type definitions
│   ├── claude/
│   │   └── discovery.ts          # Prompt building, response parsing
│   ├── drugs/
│   │   ├── dataset.ts            # WHO drugs list
│   │   └── search.ts             # Search utilities
│   └── supabase/
│       └── client.ts             # Placeholder for future auth
└── hooks/
    ├── useDebounce.ts
    └── useDrugSearch.ts
```

## Core Algorithm: Stability Scoring

**Location:** `src/lib/stability/algorithm.ts`

The heuristic model starts at base score 100 and applies weighted penalties:

| Factor | Weight | Calculation | Location |
|---|---|---|---|
| Time since expiry | ~40% | Escalating penalties (early/mid/late phases) | `calculateTimePenalty()` |
| Temperature | ~20% | Optimal 15-25°C, penalties for extremes | `getTemperaturePenalty()` |
| Humidity | ~15% | Optimal <40% RH, formulation-dependent | `getHumidityPenalty()` |
| Container integrity | ~15% | Sealed (0), opened (-15), damaged (-30) | `CONTAINER_INTEGRITY_PENALTIES` |
| Light exposure | ~10% | None (0), indirect (-10), direct (-25) | `LIGHT_EXPOSURE_PENALTIES` |
| Formulation modifier | ~5% | Tablets, capsules, liquids | `FORMULATION_MODIFIERS` |

**Verdicts:**
- `≥65` → Likely Active (low risk)
- `35-64` → Possibly Degraded (medium risk)
- `<35` → Likely Inactive (high risk)

**Key Concepts:**
- Penalties are scaled by `StabilityClass` multiplier (Class A/B/C = 0.8/1.0/1.2x)
- Time penalties use multi-phase degradation (0-6mo, 6-24mo, 24+mo past expiry)
- Drugs not yet expired get a small stability bonus

## Claude Integration: Drug Discovery

**Location:** `src/api/discover/route.ts` & `src/lib/claude/discovery.ts`

1. **System Prompt** (`buildSystemPrompt()`)
   - Frames Claude as pharmaceutical chemistry expert
   - Instructs for evidence-based, scientifically rigorous suggestions

2. **User Prompt** (`buildUserPrompt()`)
   - Includes: drug name, SMILES, stability verdict, risk level, degradation factors
   - Requests 4 categories of suggestions: analogs, modifications, related drugs, repurposing
   - Enforces structured JSON output

3. **Response Parsing** (`parseDiscoveryResponse()`)
   - Extracts JSON from Claude's response (handles markdown code blocks)
   - Returns `DiscoveryResponse` type with 4 arrays (empty if parse fails)

**Model:** `claude-sonnet-4-20250514` (max_tokens: 2000)

## Type Definitions

**Location:** `src/lib/stability/types.ts`

Key types:
- `StabilityInput` — user-provided analysis parameters
- `StabilityResult` — calculated verdict, probability, factors, summary
- `StabilityFactor` — name, impact, description of each penalty
- `StabilityVerdict` — "likely_active" | "possibly_degraded" | "likely_inactive"
- `StabilityClass` — "A" | "B" | "C" (stability categories)
- `DiscoveryResponse` — analogs, modifications, relatedDrugs, repurposing (each with name, description, rationale, confidence)

## State Management & Data Flow

- **Form Data** → stored in component local state (`AnalysisForm.tsx`)
- **Search Results** → `useDrugSearch` hook debounces input and searches `dataset.ts`
- **Stability Calculation** → `/api/analyze` called via fetch, result stored in state
- **Discovery Suggestions** → `/api/discover` called conditionally, result stored in state
- **Navigation** → URLs are plain query params—no state persisted between page reloads

**Future Enhancement:** Supabase integration for user auth and analysis history (placeholders in `src/lib/supabase/`)

## Drug Dataset

**Location:** `src/lib/drugs/dataset.ts`

Contains ~170 WHO essential medicines with:
- `name` — canonical drug name
- `smiles` — SMILES structure string (if available, or "TBD")
- `category` — therapeutic class (e.g., "Cardiovascular", "Antibiotic")

**Search:** `fuzzy` search (case-insensitive prefix or substring match)

## Important Implementation Notes

1. **API Key Security**
   - Anthropic API key must be in `.env.local` (server-side only)
   - Frontend never sees the API key—discovery requests go through `/api/discover`
   - Validate API key presence and format in `discover/route.ts` before calling Claude

2. **Disclaimers**
   - Stability algorithm is heuristic, not clinically validated
   - Real implementations should use Arrhenius kinetics or ML models
   - All outputs must include legal disclaimers about research-only/educational purposes

3. **Error Handling**
   - Discovery requests gracefully handle Anthropic API errors
   - JSON parsing failures return empty discovery response (no crash)
   - Form validation is minimal—rely on defaults for missing inputs

4. **UI Framework**
   - Tailwind CSS 4 (PostCSS-based)
   - Lucide icons for UI elements
   - No component library dependencies (custom components)

## Future Planned Features

- Landing page with marketing content (currently `/` redirects to `/analyze`)
- Supabase Auth (login/signup)
- Analysis history and saved drug profiles
- RDKit integration for molecular property calculations
- Arrhenius kinetics for temperature-dependent degradation
- ML-based stability prediction from pharmaceutical historical data
- Molecular structure visualization (2D/3D)

## Common Development Tasks

**Add a new stability factor:**
1. Add constant to `src/lib/stability/constants.ts`
2. Add calculation logic to `calculateStability()` in `algorithm.ts`
3. Add penalty to factors array and return in `StabilityResult`

**Modify Claude prompts:**
- `buildSystemPrompt()` in `src/lib/claude/discovery.ts` — change Claude's role
- `buildUserPrompt()` — change context or request format
- `parseDiscoveryResponse()` — adjust JSON parsing logic if response format changes

**Add a new drug:**
- Add entry to the array in `src/lib/drugs/dataset.ts`
- Include name, SMILES (or "TBD"), and category

**Lint and format:**
```bash
npm run lint               # Check for linting errors
npm run lint --fix        # Auto-fix linting issues (if configured)
```

## Debugging & Logs

- Frontend console: browser DevTools (F12)
- Server logs: `npm run dev` output in terminal
- Discovery API response: check `/api/discover` response in Network tab or server logs
