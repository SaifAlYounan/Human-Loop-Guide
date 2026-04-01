import { openai } from "@workspace/integrations-openai-ai-server";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { ai as gemini } from "@workspace/integrations-gemini-ai";
import { documents } from "../data/documents.js";
import { checklist } from "../data/checklist.js";
import { models, SYSTEM_PROMPT, buildDocumentContext, buildUserPrompt } from "./promptTemplates.js";

export type Routing = "CLEAR" | "CHECK" | "REVIEW" | "ESCALATE";
export type ModelRating = "LOW RISK" | "MEDIUM RISK" | "HIGH RISK";

export interface ModelFinding {
  analyst: string;
  rating: ModelRating;
  summary: string;
  confidence: number;
}

export interface ReviewItem {
  checklistId: number;
  question: string;
  findings: ModelFinding[];
  routing: Routing;
  routingRationale: string;
  routeTo: string;
  focusOn: string;
  estimatedMinutes: number;
  relevantDocuments: string[];
  priority: number;
}

export interface InformationGap {
  description: string;
  impact: string;
}

export interface ExecutiveSummary {
  clearCount: number;
  checkCount: number;
  reviewCount: number;
  escalateCount: number;
  overallRisk: "LOW" | "MODERATE" | "ELEVATED";
}

export interface SteeringReport {
  generatedAt: string;
  executiveSummary: ExecutiveSummary;
  priorityItems: ReviewItem[];
  consensusItems: ReviewItem[];
  informationGaps: InformationGap[];
  allItems: ReviewItem[];
}

interface RawFinding {
  itemNumber: number;
  rating: string;
  confidence: number;
  rationale: string;
}

const REVIEWER_ROUTING: Record<number, { routeTo: string; focusOn: string; estimatedMinutes: number }> = {
  1: { routeTo: "Financial Analyst", focusOn: "Revenue trend analysis across 3 fiscal years (B-10 through B-12, B-25, B-26)", estimatedMinutes: 20 },
  2: { routeTo: "Financial Analyst", focusOn: "COGS % stability and food cost breakdown by category (E-45)", estimatedMinutes: 15 },
  3: { routeTo: "Financial Analyst", focusOn: "EBITDA calculation and delivery commission reclassification impact (B-10 to B-12)", estimatedMinutes: 15 },
  4: { routeTo: "Financial Analyst", focusOn: "Working capital ratio, cash position, and LOC history (B-16, B-17, B-23)", estimatedMinutes: 15 },
  5: { routeTo: "Financial Analyst", focusOn: "Channel mix trends, delivery dependency, commission margin drag (B-25, E-48)", estimatedMinutes: 15 },
  6: { routeTo: "Financial Analyst", focusOn: "Bank statement reconciliation to P&L; Q3 2024 cash trough (B-16)", estimatedMinutes: 20 },
  7: { routeTo: "Financial Analyst", focusOn: "Debt-to-equity ratio and UCC-1 lien release mechanics (B-23)", estimatedMinutes: 10 },
  8: { routeTo: "Tax Advisor / CPA", focusOn: "Franchise tax, federal returns, sales tax filings (B-14, B-15, A-07)", estimatedMinutes: 15 },
  9: { routeTo: "Senior Deal Partner + Legal Counsel", focusOn: "Catering arrangement discrepancy between B-27 and A-09 — potential misappropriation (B-27, A-09, B-11, B-12)", estimatedMinutes: 30 },
  10: { routeTo: "Financial Analyst + Senior Deal Partner", focusOn: "Delivery commissions misclassified as operating expense, not COGS; seller projections (B-24, B-25, E-48)", estimatedMinutes: 20 },
  11: { routeTo: "Real Estate Attorney", focusOn: "Assignment consent requirements, $5K fee, net worth threshold for buyer (C-28 §14, C-34)", estimatedMinutes: 20 },
  12: { routeTo: "Real Estate Attorney + Senior Deal Partner", focusOn: "NO RENEWAL OPTION clause (C-28), 6 years remaining lease, valuation impact (C-28, C-34)", estimatedMinutes: 30 },
  13: { routeTo: "Operations Specialist", focusOn: "November 2024 critical violation — cold holding at 44°F, corrective action adequacy (F-54)", estimatedMinutes: 15 },
  14: { routeTo: "Licensing Attorney", focusOn: "TABC transfer process, 60-90 day timeline, no prior violations (A-06)", estimatedMinutes: 15 },
  15: { routeTo: "Litigation Counsel", focusOn: "Doe v. Olive & Thyme — settlement terms and corrective action; any undisclosed claims (G-59)", estimatedMinutes: 15 },
  16: { routeTo: "Operations Specialist", focusOn: "Overall regulatory compliance record across all agencies (G-60)", estimatedMinutes: 10 },
  17: { routeTo: "IP / Trademark Attorney", focusOn: "No federal trademark, California 'Olive & Thyme' conflict, domain in owner's name (G-61, E-51)", estimatedMinutes: 20 },
  18: { routeTo: "Risk Manager", focusOn: "Coverage limits vs. replacement cost, EMR, transfer requirements (F-56)", estimatedMinutes: 15 },
  19: { routeTo: "Senior Deal Partner + HR Advisor", focusOn: "Dimitri Alexandros — at-will, no non-compete, no IP assignment; Maria's role post-closing (D-36, D-39)", estimatedMinutes: 30 },
  20: { routeTo: "Operations Specialist", focusOn: "Hill Country Provisions 45% concentration, exclusive Fredericksburg lamb, no backup supplier (E-46, E-45)", estimatedMinutes: 20 },
  21: { routeTo: "Operations Specialist", focusOn: "Walk-in compressor and dishwasher near end-of-life, HVAC ownership ambiguity (E-49, C-31)", estimatedMinutes: 15 },
  22: { routeTo: "Operations Specialist", focusOn: "Toast POS transferability, domain name ownership issue (E-51)", estimatedMinutes: 10 },
  23: { routeTo: "Financial Analyst + Senior Deal Partner", focusOn: "Delivery growing to 23% at 25-30% commission — margin compression analysis (E-48, B-25)", estimatedMinutes: 20 },
  24: { routeTo: "Commercial Analyst", focusOn: "Pricing 10-15% below comparable Austin restaurants — pricing power opportunity (E-44, H-62)", estimatedMinutes: 10 },
  25: { routeTo: "Operations Specialist", focusOn: "Food safety systems, CFM certification, critical violation resolution (F-54, A-05)", estimatedMinutes: 15 },
  26: { routeTo: "Operations Specialist", focusOn: "CAPEX deferred items — $19-26K near term, HVAC responsibility ambiguity (C-31, E-49)", estimatedMinutes: 15 },
  27: { routeTo: "HR Advisor", focusOn: "Front-of-house turnover rate vs. kitchen stability; 4 departures in 2025 (D-35, D-40)", estimatedMinutes: 10 },
  28: { routeTo: "Senior Deal Partner + HR Advisor", focusOn: "Chef Dimitri's offer letter — at-will, non-binding commitment through Dec 2026 (D-36, D-37)", estimatedMinutes: 20 },
  29: { routeTo: "Employment Attorney", focusOn: "Only Sarah Chen has a non-compete; Dimitri has none — key man without restriction (D-39)", estimatedMinutes: 15 },
  30: { routeTo: "Employment Attorney", focusOn: "Tipped employees, H-2B prevailing wage compliance, no DOL issues (D-35, D-40)", estimatedMinutes: 15 },
  31: { routeTo: "HR Advisor", focusOn: "Accrued PTO, no retirement plan, informal benefits communication (D-41)", estimatedMinutes: 10 },
  32: { routeTo: "Immigration Attorney", focusOn: "Two H-2B visas expiring September 30, 2026 — amended petitions required post-acquisition (D-43)", estimatedMinutes: 20 },
  33: { routeTo: "Commercial Analyst", focusOn: "Google trajectory: 4.6 → 4.3 → 4.5 — construction dip explained, 2025 recovery (E-52)", estimatedMinutes: 10 },
  34: { routeTo: "Commercial Analyst", focusOn: "No direct upscale Mediterranean competitor within 1 mile (H-62, E-44)", estimatedMinutes: 10 },
  35: { routeTo: "Commercial Analyst", focusOn: "3.2% population growth, $95K median income, high foot traffic on SoCo (H-62)", estimatedMinutes: 10 },
  36: { routeTo: "IP / Trademark Attorney + Commercial Analyst", focusOn: "Common-law only brand, California conflict, domain not in LLC name (G-61, E-51)", estimatedMinutes: 15 },
  37: { routeTo: "Commercial Analyst", focusOn: "Catering, events, brunch expansion, pricing uplift — feasibility analysis (H-62, B-24)", estimatedMinutes: 15 },
  38: { routeTo: "Senior Deal Partner", focusOn: "James Park liquidity motivation; Maria's post-sale intentions; non-compete negotiation (A-09, A-03)", estimatedMinutes: 15 },
  39: { routeTo: "Senior Deal Partner + Financial Analyst", focusOn: "$850K at 6.4x EBITDA vs. lease risk, key person dependency, no trademark (B-12, C-28, D-36)", estimatedMinutes: 30 },
  40: { routeTo: "Senior Deal Partner", focusOn: "Transition plan — seller commitment, chef retention, GM continuity (D-36, D-37, A-09)", estimatedMinutes: 20 },
  41: { routeTo: "Legal Counsel", focusOn: "Lease (landlord consent), TABC (60-90 days), H-2B amendments, supplier consent (C-28, A-06, D-43, E-46)", estimatedMinutes: 20 },
  42: { routeTo: "Financial Analyst + Operations Specialist", focusOn: "Total CAPEX: $19-26K near-term + $28-42K medium-term = up to $68K (E-49, C-31, B-22)", estimatedMinutes: 15 }
};

function normalizeRating(raw: string): ModelRating {
  const upper = (raw ?? "").toUpperCase().trim();
  if (upper === "LOW RISK")  return "LOW RISK";
  if (upper === "HIGH RISK") return "HIGH RISK";
  return "MEDIUM RISK";
}

function parseFindings(rawContent: string, modelLabel: string): RawFinding[] {
  // Log first 500 chars of raw response for debugging
  console.log(`[${modelLabel}] Raw response (first 500 chars):`, rawContent.slice(0, 500));

  // Strip markdown code fences if present
  let content = rawContent.trim();
  content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  // Try to extract a JSON array
  const arrayMatch = content.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    console.error(`[${modelLabel}] No JSON array found in response. Full response length: ${rawContent.length}`);
    return [];
  }

  try {
    const parsed = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(parsed)) {
      console.error(`[${modelLabel}] Parsed JSON is not an array`);
      return [];
    }
    console.log(`[${modelLabel}] Successfully parsed ${parsed.length} items`);

    // Normalise field names — support both itemNumber and id
    return parsed.map((item: any) => ({
      itemNumber: item.itemNumber ?? item.id ?? 0,
      rating: item.rating ?? "AMBER",
      confidence: item.confidence ?? 5,
      rationale: item.rationale ?? item.summary ?? "No rationale provided.",
    }));
  } catch (err) {
    console.error(`[${modelLabel}] JSON.parse failed:`, err);
    // Attempt partial recovery: find as many complete objects as possible
    const objects: RawFinding[] = [];
    const objRegex = /\{[^{}]*"itemNumber"\s*:\s*(\d+)[^{}]*"rating"\s*:\s*"(GREEN|AMBER|RED)"[^{}]*\}/g;
    let match;
    while ((match = objRegex.exec(arrayMatch[0])) !== null) {
      try {
        objects.push(JSON.parse(match[0]));
      } catch {}
    }
    console.log(`[${modelLabel}] Partial recovery: found ${objects.length} objects`);
    return objects;
  }
}

// Routing matrix: considers BOTH agreement level AND severity.
// See architecture spec for full decision table.
function determineRouting(findings: ModelFinding[]): { routing: Routing; routingRationale: string } {
  const lowCount  = findings.filter(f => f.rating === "LOW RISK").length;
  const medCount  = findings.filter(f => f.rating === "MEDIUM RISK").length;
  const highCount = findings.filter(f => f.rating === "HIGH RISK").length;

  const highModels  = findings.filter(f => f.rating === "HIGH RISK").map(f => f.analyst);
  const medModels   = findings.filter(f => f.rating === "MEDIUM RISK").map(f => f.analyst);
  const lowModels   = findings.filter(f => f.rating === "LOW RISK").map(f => f.analyst);

  // ── CLEAR ────────────────────────────────────────────────────────────────
  if (lowCount === 3) {
    return { routing: "CLEAR", routingRationale: "All 3 models rated LOW RISK — no concerns identified" };
  }
  if (lowCount === 2 && medCount === 1) {
    return { routing: "CLEAR", routingRationale: `2 models rated LOW RISK, ${medModels[0]} rated MEDIUM RISK — minor flag, cursory check only` };
  }

  // ── CHECK ────────────────────────────────────────────────────────────────
  if (medCount === 3) {
    return { routing: "CHECK", routingRationale: "All 3 models rated MEDIUM RISK — consistent moderate concern, targeted review needed" };
  }
  if (medCount === 2 && lowCount === 1) {
    return { routing: "CHECK", routingRationale: `2 models rated MEDIUM RISK, ${lowModels[0]} rated LOW RISK — moderate concern, senior associate review recommended` };
  }

  // ── REVIEW ───────────────────────────────────────────────────────────────
  if (medCount === 2 && highCount === 1) {
    return { routing: "REVIEW", routingRationale: `2 models rated MEDIUM RISK, ${highModels[0]} rated HIGH RISK — mixed signals, manager substantive review needed` };
  }
  if (lowCount === 2 && highCount === 1) {
    return { routing: "REVIEW", routingRationale: `2 models rated LOW RISK, ${highModels[0]} rated HIGH RISK — disagreement on materiality, review required` };
  }

  // ── ESCALATE ─────────────────────────────────────────────────────────────
  if (highCount === 3) {
    return { routing: "ESCALATE", routingRationale: "All 3 models rated HIGH RISK — consensus that this is material, partner review required" };
  }
  if (highCount === 2 && medCount === 1) {
    return { routing: "ESCALATE", routingRationale: `2 models rated HIGH RISK, ${medModels[0]} rated MEDIUM RISK — mostly high concern, partner review required` };
  }
  if (highCount === 2 && lowCount === 1) {
    return { routing: "ESCALATE", routingRationale: `2 models rated HIGH RISK, ${lowModels[0]} rated LOW RISK — significant conflict with high majority, escalate` };
  }
  if (lowCount === 1 && medCount === 1 && highCount === 1) {
    return { routing: "ESCALATE", routingRationale: `Full split — ${lowModels[0]} LOW RISK · ${medModels[0]} MEDIUM RISK · ${highModels[0]} HIGH RISK — human determination required` };
  }

  // Fallback (should not occur with 3 models)
  return { routing: "REVIEW", routingRationale: "Inconclusive model ratings — manual review required" };
}

function computePriority(item: ReviewItem): number {
  const routingScore: Record<Routing, number> = { ESCALATE: 4, REVIEW: 3, CHECK: 2, CLEAR: 1 };
  const base = routingScore[item.routing] ?? 0;
  const avgConfidence = item.findings.reduce((a, b) => a + b.confidence, 0) / item.findings.length;
  return Math.round(base * 10 + (10 - avgConfidence));
}

async function runOpenAI(userPrompt: string): Promise<RawFinding[]> {
  const cfg = models[0];
  console.log(`[${cfg.label}] Starting API call...`);
  const response = await openai.chat.completions.create({
    model: cfg.model,
    max_completion_tokens: 16000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: userPrompt },
    ],
  });
  const content = response.choices[0]?.message?.content ?? "";
  console.log(`[${cfg.label}] Response received, length: ${content.length}`);
  return parseFindings(content, cfg.label);
}

async function runAnthropic(userPrompt: string): Promise<RawFinding[]> {
  const cfg = models[1];
  console.log(`[${cfg.label}] Starting API call...`);
  const response = await anthropic.messages.create({
    model: cfg.model,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });
  const content = response.content[0]?.type === "text" ? response.content[0].text : "";
  console.log(`[${cfg.label}] Response received, length: ${content.length}`);
  return parseFindings(content, cfg.label);
}

async function runGemini(userPrompt: string): Promise<RawFinding[]> {
  const cfg = models[2];
  console.log(`[${cfg.label}] Starting API call...`);
  const response = await gemini.models.generateContent({
    model: cfg.model,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 16000,
    },
  });
  const content = response.text ?? "";
  console.log(`[${cfg.label}] Response received, length: ${content.length}`);
  return parseFindings(content, cfg.label);
}

export async function runFullAnalysis(): Promise<SteeringReport> {
  const documentContext = buildDocumentContext(
    documents.map(d => ({ id: d.id, title: d.title, content: d.content }))
  );
  const allChecklistItems = checklist.flatMap(dim =>
    dim.items.map(item => ({ id: item.id, question: item.question }))
  );
  const checklistMap = new Map<number, { question: string; relevantDocuments: string[] }>();
  checklist.forEach(dim => {
    dim.items.forEach(item => {
      checklistMap.set(item.id, { question: item.question, relevantDocuments: item.relevantDocuments });
    });
  });

  const userPrompt = buildUserPrompt(allChecklistItems, documentContext);
  console.log(`User prompt length: ${userPrompt.length} chars`);
  console.log(`Running ${models[0].label}, ${models[1].label}, ${models[2].label} in parallel...`);

  const [openaiFindings, anthropicFindings, geminiFindings] = await Promise.all([
    runOpenAI(userPrompt),
    runAnthropic(userPrompt),
    runGemini(userPrompt),
  ]);

  console.log(`Findings counts — OpenAI: ${openaiFindings.length}, Anthropic: ${anthropicFindings.length}, Gemini: ${geminiFindings.length}`);

  const reviewItems: ReviewItem[] = allChecklistItems.map(checklistItem => {
    const id = checklistItem.id;

    const aRaw = openaiFindings.find(f => f.itemNumber === id);
    const bRaw = anthropicFindings.find(f => f.itemNumber === id);
    const cRaw = geminiFindings.find(f => f.itemNumber === id);

    // Default all to AMBER so a single missing response doesn't manufacture a DISAGREE
    const findings: ModelFinding[] = [
      {
        analyst: models[0].label,
        rating: normalizeRating(aRaw?.rating ?? "MEDIUM RISK"),
        confidence: aRaw?.confidence ?? 5,
        summary: aRaw?.rationale ?? "Response not available.",
      },
      {
        analyst: models[1].label,
        rating: normalizeRating(bRaw?.rating ?? "MEDIUM RISK"),
        confidence: bRaw?.confidence ?? 5,
        summary: bRaw?.rationale ?? "Response not available.",
      },
      {
        analyst: models[2].label,
        rating: normalizeRating(cRaw?.rating ?? "MEDIUM RISK"),
        confidence: cRaw?.confidence ?? 5,
        summary: cRaw?.rationale ?? "Response not available.",
      },
    ];

    const { routing, routingRationale } = determineRouting(findings);
    const reviewerRouting = REVIEWER_ROUTING[id] ?? {
      routeTo: "Senior Deal Partner",
      focusOn: "Review relevant documents",
      estimatedMinutes: 30,
    };
    const itemMeta = checklistMap.get(id)!;

    const item: ReviewItem = {
      checklistId: id,
      question: checklistItem.question,
      findings,
      routing,
      routingRationale,
      routeTo: reviewerRouting.routeTo,
      focusOn: reviewerRouting.focusOn,
      estimatedMinutes: reviewerRouting.estimatedMinutes,
      relevantDocuments: itemMeta.relevantDocuments,
      priority: 0,
    };
    item.priority = computePriority(item);
    return item;
  });

  // Sort: ESCALATE → REVIEW → CHECK → CLEAR (highest urgency first)
  reviewItems.sort((a, b) => b.priority - a.priority);

  const priorityItems  = reviewItems.filter(i => i.routing === "ESCALATE" || i.routing === "REVIEW");
  const consensusItems = reviewItems.filter(i => i.routing === "CLEAR" || i.routing === "CHECK");

  const clearCount    = reviewItems.filter(i => i.routing === "CLEAR").length;
  const checkCount    = reviewItems.filter(i => i.routing === "CHECK").length;
  const reviewCount   = reviewItems.filter(i => i.routing === "REVIEW").length;
  const escalateCount = reviewItems.filter(i => i.routing === "ESCALATE").length;

  let overallRisk: "LOW" | "MODERATE" | "ELEVATED" = "LOW";
  if (escalateCount >= 5) overallRisk = "ELEVATED";
  else if (escalateCount >= 2 || reviewCount >= 5) overallRisk = "MODERATE";

  const informationGaps: InformationGap[] = [
    {
      description: "Maria K Catering arrangement: The financial impact of kitchen/equipment use has not been quantified or independently verified.",
      impact: "Potential misallocation of company resources; possible understated expenses in FY2024 and FY2025 financials.",
    },
    {
      description: "Head chef (Dimitri Alexandros) post-acquisition intentions are undocumented. No retention agreement exists.",
      impact: "Significant risk to restaurant operations and reputation if chef departs post-closing.",
    },
    {
      description: "No formal lease renewal option exists. Landlord's renewal intentions have not been solicited or confirmed.",
      impact: "Entire business valuation assumes continued occupation. Non-renewal would require relocation or closure.",
    },
    {
      description: "HVAC replacement responsibility is unclear under the lease — maintenance vs. replacement not defined.",
      impact: "Potential $15,000-$22,000 unbudgeted CAPEX exposure within 1-3 years.",
    },
    {
      description: "No trademark attorney opinion has been rendered on the 'Olive & Thyme' brand. California conflict unresolved.",
      impact: "Brand unprotected at federal level; expansion restrictions possible if California entity has superior rights.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    executiveSummary: { clearCount, checkCount, reviewCount, escalateCount, overallRisk },
    priorityItems,
    consensusItems,
    informationGaps,
    allItems: reviewItems,
  };
}
