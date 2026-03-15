# PharmStable - Drug Stability Analysis System

Estimate whether an expired or aging drug is still biologically active using heuristic degradation modeling and AI-powered pharmacological insights via Anthropic's Claude.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- **AI**: Anthropic Claude API (user-provided key)
- **Backend**: Next.js API routes (future: Supabase for auth/persistence)
- **Deployment**: Vercel-ready

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the analysis form.

## Features

- **Drug Autocomplete**: Search ~170 WHO essential medicines with auto-fill of SMILES structures
- **Stability Estimation**: Heuristic algorithm considering time, temperature, humidity, light, container integrity, and formulation type
- **AI Discovery**: Claude-powered drug repurposing suggestions (analog compounds, structural modifications, related drugs, repurposing opportunities)
- **Results Dashboard**: Color-coded verdict, probability gauge, factor breakdown

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── analyze/page.tsx          # Main analysis form
│   ├── results/page.tsx          # Results display
│   └── api/
│       ├── analyze/route.ts      # Stability algorithm endpoint
│       └── discover/route.ts     # Claude API endpoint
├── components/
│   ├── analyze/                  # Form section components
│   └── results/                  # Result display components
├── lib/
│   ├── stability/                # Algorithm, types, constants
│   ├── claude/                   # Claude prompt builder
│   ├── drugs/                    # WHO drug dataset + search
│   └── supabase/                 # Placeholder for future auth
└── hooks/                        # useDebounce, useDrugSearch
```

## Stability Algorithm

The heuristic model starts at 100 (fully active) and applies weighted penalties:

| Factor | Weight | Details |
|---|---|---|
| Time since expiry | ~40% | Escalating penalties scaled by stability class |
| Temperature | ~20% | Optimal: 15-25°C, penalties for extremes |
| Humidity | ~15% | Optimal: <40% RH, formulation-dependent |
| Container integrity | ~15% | Sealed (0), opened (-15), damaged (-30) |
| Light exposure | ~10% | None (0), indirect (-10), direct (-25) |

**Verdicts**: ≥65 = Likely Active, 35-64 = Possibly Degraded, <35 = Likely Inactive

## Future Enhancements

- Landing page, login/signup with Supabase Auth
- Analysis history and saved drug profiles
- RDKit integration for molecular property calculations
- Arrhenius kinetics for temperature-dependent degradation
- ML-based stability prediction from historical pharmaceutical data
- Molecular structure visualization (2D/3D)

## Disclaimer

This tool provides heuristic estimates for research and educational purposes only. Results are not clinically validated. Always consult a qualified pharmacist or physician.
