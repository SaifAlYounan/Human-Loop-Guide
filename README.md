# Human-in-the-Loop Guidance System

**Three AI models. Same documents. Same checklist. Different opinions.**  
Where they agree, move fast. Where they disagree, that's exactly where your team should focus.

> **⚠️ Proof of concept.** This is an open-source demo showing how far multi-model adversarial review can take due diligence workflows. It uses fictional data and is not production software. The production version is whatever you make of it — fork it, swap in your own documents and risk framework, harden it, make it yours. This repo exists to show what's possible.

🔗 **[Live Demo](https://human-loop-guide.replit.app)** — uses fictional data, fully functional

---

## What It Does

This system runs three different AI models (GPT-5.2, Claude Sonnet 4.6, Gemini 2.5 Pro) against a data room of deal documents. Each model independently rates 42 due diligence checklist items as LOW / MEDIUM / HIGH risk. The system then compares their opinions and generates a **Steering Report** that tells human reviewers exactly where to spend their time.

The core insight: **model disagreement is signal, not noise.** When three models with different architectures and training data disagree about a risk, that's precisely where experienced human judgment is needed most.

### The Flow

```
Data Room (62 documents)
        ↓
3 Independent AI Reviews (same prompt, different models, no communication)
        ↓
Consensus Engine (compares all three opinions)
        ↓
Steering Report (prioritized action plan with routing)
```

---

## Pages

| Page | What It Shows |
|------|--------------|
| **Landing** | System overview — what it does and doesn't do |
| **Data Room** | All 62 source documents, browsable by category |
| **Checklists** | 42-item due diligence framework across 6 dimensions |
| **How It Works** | Risk rubric, routing matrix, methodology explanation |
| **Run Analysis** | Triggers the 3-model review (requires API keys) |
| **Steering Report** | The output — prioritized findings with routing recommendations |

---

## Risk Rating Rubric

Every model applies the same objective standard:

| Rating | Criteria |
|--------|----------|
| 🟦 **LOW RISK** | Fully documented · standard practice · no contradictions · <1% deal impact |
| 🟨 **MEDIUM RISK** | Partial documentation or minor gaps · non-standard but not unusual · 1–5% deal impact |
| 🟥 **HIGH RISK** | Missing or contradictory documentation · material deviation from market · >5% deal impact or deal-breaker |

If an item meets *any single criterion* of a higher tier, it gets rated at the higher tier. When in doubt, rate UP.

---

## Routing Matrix

Two dimensions drive every routing decision: **severity** (what the models found) × **consensus** (whether they agree).

|  | All 3 Agree | 2 of 3 Agree | All Disagree |
|---|---|---|---|
| **Low Risk** | CLEAR 🟦 | CHECK 🟨 | REVIEW 🟧 |
| **Medium Risk** | CHECK 🟨 | REVIEW 🟧 | ESCALATE 🟥 |
| **High Risk** | ESCALATE 🟥 | ESCALATE 🟥 | ESCALATE 🟥 |

- **CLEAR** — Paralegal can verify quickly
- **CHECK** — Associate reviews
- **REVIEW** — Senior associate examines
- **ESCALATE** — Partner attention required

> This matrix is fully customizable. Swap in your firm's own risk framework, adjust the thresholds per deal type, or add dimensions — the system adapts to however you classify risk, not the other way around.

---

## The Demo Scenario

The demo uses a simulated acquisition of **Olive & Thyme LLC**, a Mediterranean restaurant on South Congress Avenue in Austin, TX.

**Data Room:** 62 documents across 8 categories — corporate & foundational, financial, property & lease, employment, operational, regulatory & compliance, legal, and market analysis.

**Checklist:** 42 items across 6 risk dimensions — financial health, legal & structural, operational, human capital, market & commercial, and deal-specific.

**10 buried yellow flags** designed to create genuine model disagreement:

| Flag | Why It's Interesting |
|------|---------------------|
| Head chef has no non-compete | Key person risk — but is it standard for restaurants? |
| 45% supplier concentration | Single source for signature ingredient — risk or relationship? |
| Lease has no renewal option | 6 years remaining — enough runway or valuation killer? |
| Undisclosed related-party catering | Appears in one document, absent from another |
| Delivery growing to 23% of revenue | At 25–30% commission — margin compression or growth channel? |
| No trademark registration | Common-law rights only, plus a California name conflict |
| Passive co-owner (40%) wants liquidity | Motivated seller — advantage or red flag? |
| Q3 revenue dip | Construction on the block — temporary or pattern? |
| Slip-and-fall settlement | Resolved — but was the corrective action adequate? |
| Health inspection critical violation | Cold holding at 44°F — fixed, but recent |

Some of these are clear risks. Some are judgment calls. That's the point.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Express (Node.js / TypeScript)
- **AI Models:** OpenAI (GPT-5.2) + Anthropic (Claude Sonnet 4.6) + Google (Gemini 2.5 Pro)
- **Monorepo:** pnpm workspaces
- **API:** OpenAPI spec with generated Zod validators and React query hooks

---

## Project Structure

```
artifacts/
  api-server/          # Express backend — analysis engine, document/checklist APIs
    src/
      analysis/        # Model orchestration, prompt templates, consensus engine
      data/            # 62 documents + 42-item checklist (hardcoded for demo)
      routes/          # REST endpoints
  hitl-guidance/       # React frontend — all pages and components
    src/
      pages/           # Landing, Documents, Checklist, HowItWorks, Analysis, Report
      components/      # Layout + shadcn/ui component library
lib/
  api-spec/            # OpenAPI schema + Orval code generation config
  api-client-react/    # Generated React Query hooks
  api-zod/             # Generated Zod validation schemas
  db/                  # Drizzle ORM schema (conversations, messages)
  integrations-*/      # AI provider clients (OpenAI, Anthropic, Gemini)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- API keys for at least one provider (all three for full adversarial review):
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `GEMINI_API_KEY`

### Setup

```bash
git clone https://github.com/SaifAlYounan/Human-Loop-Guide.git
cd Human-Loop-Guide
pnpm install
```

### Environment Variables

Create a `.env` file or set these:

```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
```

### Run

```bash
pnpm dev
```

The app runs at `http://localhost:5000`.

---

## Customization

This system is designed to be adapted:

| What | How |
|------|-----|
| **Different industries** | Replace `documents.ts` and `checklist.ts` with your sector's data room and framework |
| **Different risk frameworks** | Edit the rubric in `promptTemplates.ts` and `HowItWorksPage.tsx` |
| **Different models** | Swap entries in the `models` array in `promptTemplates.ts` |
| **Different routing thresholds** | Modify the routing logic in `engine.ts` |
| **Real documents** | Replace demo content with actual deal materials (handle with appropriate security) |

---

## How the Consensus Engine Works

For each checklist item, after all three models return their ratings:

1. **Collect ratings** — normalize to LOW RISK / MEDIUM RISK / HIGH RISK
2. **Determine consensus** — unanimous, majority (2 of 3), or full split
3. **Apply routing matrix** — severity × consensus → CLEAR / CHECK / REVIEW / ESCALATE
4. **Assign reviewer** — each item maps to a specific reviewer type (Financial Analyst, Real Estate Attorney, Senior Deal Partner, etc.)
5. **Estimate time** — per-item time estimates for the assigned reviewer
6. **Prioritize** — ESCALATE items surface first, with estimated total review hours

The steering report groups items by routing level and provides:
- Executive summary (counts by routing level, overall risk assessment)
- Priority items (REVIEW + ESCALATE — where human expertise matters most)
- Consensus items (CLEAR + CHECK — low-attention items)
- Information gaps (documents or data the models expected but didn't find)

---

## Cost

Running the full 3-model review on 62 documents with a 42-item checklist costs approximately **$1.50–2.50 per run** using standard API pricing. The system makes exactly 3 API calls (one per model) per analysis.

---

## What This System Does NOT Do

- ❌ Replace a qualified M&A attorney or CPA
- ❌ Constitute legal, tax, or investment advice
- ❌ Verify documents for authenticity or fraud
- ❌ Make the investment decision for you

All target data in the demo is entirely fictional.

---

## License

MIT

---

## Authors

Built by **Alexios van der Slikke Kirillov** and **Ali Buhaji**.

This project is open source under the [MIT License](LICENSE).
