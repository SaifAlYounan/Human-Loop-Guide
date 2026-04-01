import { openai } from "@workspace/integrations-openai-ai-server";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { ai as gemini } from "@workspace/integrations-gemini-ai";
import { documents } from "../data/documents.js";
import { checklist } from "../data/checklist.js";
import { models, SYSTEM_PROMPT, buildDocumentContext, buildUserPrompt } from "./promptTemplates.js";

export interface ModelFinding {
  analyst: string;
  rating: "GREEN" | "AMBER" | "RED";
  summary: string;
  confidence: number;
}

export interface ReviewItem {
  checklistId: number;
  question: string;
  findings: ModelFinding[];
  consensusRating: "GREEN" | "AMBER" | "RED" | "DISAGREE";
  disagreementInsight?: string;
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
  greenCount: number;
  amberCount: number;
  redCount: number;
  disagreeCount: number;
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
  1: { routeTo: "Financial Analyst", focusOn: "Revenue trend analysis across 3 fiscal years (B-10 through B-12, B-25, B-26)", estimatedMinutes: 45 },
  2: { routeTo: "Financial Analyst", focusOn: "COGS % stability and food cost breakdown by category (E-45)", estimatedMinutes: 30 },
  3: { routeTo: "Financial Analyst", focusOn: "EBITDA calculation and delivery commission reclassification impact (B-10 to B-12)", estimatedMinutes: 30 },
  4: { routeTo: "Financial Analyst", focusOn: "Working capital ratio, cash position, and LOC history (B-16, B-17, B-23)", estimatedMinutes: 25 },
  5: { routeTo: "Financial Analyst", focusOn: "Channel mix trends, delivery dependency, commission margin drag (B-25, E-48)", estimatedMinutes: 30 },
  6: { routeTo: "Financial Analyst", focusOn: "Bank statement reconciliation to P&L; Q3 2024 cash trough (B-16)", estimatedMinutes: 40 },
  7: { routeTo: "Financial Analyst", focusOn: "Debt-to-equity ratio and UCC-1 lien release mechanics (B-23)", estimatedMinutes: 20 },
  8: { routeTo: "Tax Advisor / CPA", focusOn: "Franchise tax, federal returns, sales tax filings (B-14, B-15, A-07)", estimatedMinutes: 30 },
  9: { routeTo: "Senior Deal Partner + Legal Counsel", focusOn: "Catering arrangement discrepancy between B-27 and A-09 — potential misappropriation (B-27, A-09, B-11, B-12)", estimatedMinutes: 60 },
  10: { routeTo: "Financial Analyst + Senior Deal Partner", focusOn: "Delivery commissions misclassified as operating expense, not COGS; seller projections (B-24, B-25, E-48)", estimatedMinutes: 45 },
  11: { routeTo: "Real Estate Attorney", focusOn: "Assignment consent requirements, $5K fee, net worth threshold for buyer (C-28 §14, C-34)", estimatedMinutes: 45 },
  12: { routeTo: "Real Estate Attorney + Senior Deal Partner", focusOn: "NO RENEWAL OPTION clause (C-28), 6 years remaining lease, valuation impact (C-28, C-34)", estimatedMinutes: 60 },
  13: { routeTo: "Operations Specialist", focusOn: "November 2024 critical violation — cold holding at 44°F, corrective action adequacy (F-54)", estimatedMinutes: 30 },
  14: { routeTo: "Licensing Attorney", focusOn: "TABC transfer process, 60-90 day timeline, no prior violations (A-06)", estimatedMinutes: 25 },
  15: { routeTo: "Litigation Counsel", focusOn: "Doe v. Olive & Thyme — settlement terms and corrective action; any undisclosed claims (G-59)", estimatedMinutes: 30 },
  16: { routeTo: "Operations Specialist", focusOn: "Overall regulatory compliance record across all agencies (G-60)", estimatedMinutes: 20 },
  17: { routeTo: "IP / Trademark Attorney", focusOn: "No federal trademark, California 'Olive & Thyme' conflict, domain in owner's name (G-61, E-51)", estimatedMinutes: 45 },
  18: { routeTo: "Risk Manager", focusOn: "Coverage limits vs. replacement cost, EMR, transfer requirements (F-56)", estimatedMinutes: 25 },
  19: { routeTo: "Senior Deal Partner + HR Advisor", focusOn: "Dimitri Alexandros — at-will, no non-compete, no IP assignment; Maria's role post-closing (D-36, D-39)", estimatedMinutes: 60 },
  20: { routeTo: "Operations Specialist", focusOn: "Hill Country Provisions 45% concentration, exclusive Fredericksburg lamb, no backup supplier (E-46, E-45)", estimatedMinutes: 45 },
  21: { routeTo: "Operations Specialist", focusOn: "Walk-in compressor and dishwasher near end-of-life, HVAC ownership ambiguity (E-49, C-31)", estimatedMinutes: 30 },
  22: { routeTo: "Operations Specialist", focusOn: "Toast POS transferability, domain name ownership issue (E-51)", estimatedMinutes: 20 },
  23: { routeTo: "Financial Analyst + Senior Deal Partner", focusOn: "Delivery growing to 23% at 25-30% commission — margin compression analysis (E-48, B-25)", estimatedMinutes: 40 },
  24: { routeTo: "Commercial Analyst", focusOn: "Pricing 10-15% below comparable Austin restaurants — pricing power opportunity (E-44, H-62)", estimatedMinutes: 20 },
  25: { routeTo: "Operations Specialist", focusOn: "Food safety systems, CFM certification, critical violation resolution (F-54, A-05)", estimatedMinutes: 25 },
  26: { routeTo: "Operations Specialist", focusOn: "CAPEX deferred items — $19-26K near term, HVAC responsibility ambiguity (C-31, E-49)", estimatedMinutes: 30 },
  27: { routeTo: "HR Advisor", focusOn: "Front-of-house turnover rate vs. kitchen stability; 4 departures in 2025 (D-35, D-40)", estimatedMinutes: 20 },
  28: { routeTo: "Senior Deal Partner + HR Advisor", focusOn: "Chef Dimitri's offer letter — at-will, non-binding commitment through Dec 2026 (D-36, D-37)", estimatedMinutes: 45 },
  29: { routeTo: "Employment Attorney", focusOn: "Only Sarah Chen has a non-compete; Dimitri has none — key man without restriction (D-39)", estimatedMinutes: 30 },
  30: { routeTo: "Employment Attorney", focusOn: "Tipped employees, H-2B prevailing wage compliance, no DOL issues (D-35, D-40)", estimatedMinutes: 25 },
  31: { routeTo: "HR Advisor", focusOn: "Accrued PTO, no retirement plan, informal benefits communication (D-41)", estimatedMinutes: 20 },
  32: { routeTo: "Immigration Attorney", focusOn: "Two H-2B visas expiring September 30, 2026 — amended petitions required post-acquisition (D-43)", estimatedMinutes: 35 },
  33: { routeTo: "Commercial Analyst", focusOn: "Google trajectory: 4.6 → 4.3 → 4.5 — construction dip explained, 2025 recovery (E-52)", estimatedMinutes: 20 },
  34: { routeTo: "Commercial Analyst", focusOn: "No direct upscale Mediterranean competitor within 1 mile (H-62, E-44)", estimatedMinutes: 20 },
  35: { routeTo: "Commercial Analyst", focusOn: "3.2% population growth, $95K median income, high foot traffic on SoCo (H-62)", estimatedMinutes: 15 },
  36: { routeTo: "IP / Trademark Attorney + Commercial Analyst", focusOn: "Common-law only brand, California conflict, domain not in LLC name (G-61, E-51)", estimatedMinutes: 30 },
  37: { routeTo: "Commercial Analyst", focusOn: "Catering, events, brunch expansion, pricing uplift — feasibility analysis (H-62, B-24)", estimatedMinutes: 25 },
  38: { routeTo: "Senior Deal Partner", focusOn: "James Park liquidity motivation; Maria's post-sale intentions; non-compete negotiation (A-09, A-03)", estimatedMinutes: 30 },
  39: { routeTo: "Senior Deal Partner + Financial Analyst", focusOn: "$850K at 6.4x EBITDA vs. lease risk, key person dependency, no trademark (B-12, C-28, D-36)", estimatedMinutes: 60 },
  40: { routeTo: "Senior Deal Partner", focusOn: "Transition plan — seller commitment, chef retention, GM continuity (D-36, D-37, A-09)", estimatedMinutes: 45 },
  41: { routeTo: "Legal Counsel", focusOn: "Lease (landlord consent), TABC (60-90 days), H-2B amendments, supplier consent (C-28, A-06, D-43, E-46)", estimatedMinutes: 45 },
  42: { routeTo: "Financial Analyst + Operations Specialist", focusOn: "Total CAPEX: $19-26K near-term + $28-42K medium-term = up to $68K (E-49, C-31, B-22)", estimatedMinutes: 30 }
};

function normalizeRating(raw: string): "GREEN" | "AMBER" | "RED" {
  const upper = (raw ?? "").toUpperCase().trim();
  if (upper === "GREEN") return "GREEN";
  if (upper === "RED") return "RED";
  return "AMBER";
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

// Majority-vote consensus: 3 identical → consensus; 2 same + 1 different → majority wins (RED elevated)
function determineConsensus(findings: ModelFinding[]): {
  consensusRating: "GREEN" | "AMBER" | "RED" | "DISAGREE";
  disagreementInsight?: string;
} {
  const ratings = findings.map(f => f.rating);
  const counts: Record<string, number> = {};
  for (const r of ratings) counts[r] = (counts[r] ?? 0) + 1;

  // All three agree
  if (counts["GREEN"] === 3) return { consensusRating: "GREEN" };
  if (counts["AMBER"] === 3) return { consensusRating: "AMBER" };
  if (counts["RED"] === 3)   return { consensusRating: "RED" };

  // Two agree (majority) — RED is elevated: if any 2 say RED → RED even if one says AMBER
  if ((counts["RED"] ?? 0) >= 2)   return { consensusRating: "RED" };
  if ((counts["GREEN"] ?? 0) >= 2) return { consensusRating: "GREEN" };
  if ((counts["AMBER"] ?? 0) >= 2) return { consensusRating: "AMBER" };

  // Three-way split or RED vs GREEN (no clear majority)
  const hasRed   = (counts["RED"] ?? 0) > 0;
  const hasGreen = (counts["GREEN"] ?? 0) > 0;
  const redModels   = findings.filter(f => f.rating === "RED").map(f => f.analyst).join(", ");
  const greenModels = findings.filter(f => f.rating === "GREEN").map(f => f.analyst).join(", ");
  const amberModels = findings.filter(f => f.rating === "AMBER").map(f => f.analyst).join(", ");

  let insight = "Models disagree: ";
  if (hasRed && hasGreen) {
    insight += `${redModels} rated RED; ${greenModels} rated GREEN. Human adjudication required.`;
  } else if (hasRed) {
    insight += `${redModels} rated RED; ${amberModels} rated AMBER. Elevate to senior review.`;
  } else {
    insight += `${greenModels} rated GREEN; ${amberModels} rated AMBER. May need additional clarification.`;
  }

  return { consensusRating: "DISAGREE", disagreementInsight: insight };
}

function computePriority(item: ReviewItem): number {
  const ratingScore: Record<string, number> = { RED: 3, DISAGREE: 2.5, AMBER: 1, GREEN: 0 };
  const base = ratingScore[item.consensusRating] ?? 0;
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
        rating: normalizeRating(aRaw?.rating ?? "AMBER"),
        confidence: aRaw?.confidence ?? 5,
        summary: aRaw?.rationale ?? "Response not available.",
      },
      {
        analyst: models[1].label,
        rating: normalizeRating(bRaw?.rating ?? "AMBER"),
        confidence: bRaw?.confidence ?? 5,
        summary: bRaw?.rationale ?? "Response not available.",
      },
      {
        analyst: models[2].label,
        rating: normalizeRating(cRaw?.rating ?? "AMBER"),
        confidence: cRaw?.confidence ?? 5,
        summary: cRaw?.rationale ?? "Response not available.",
      },
    ];

    const { consensusRating, disagreementInsight } = determineConsensus(findings);
    const routing = REVIEWER_ROUTING[id] ?? {
      routeTo: "Senior Deal Partner",
      focusOn: "Review relevant documents",
      estimatedMinutes: 30,
    };
    const itemMeta = checklistMap.get(id)!;

    const item: ReviewItem = {
      checklistId: id,
      question: checklistItem.question,
      findings,
      consensusRating,
      disagreementInsight,
      routeTo: routing.routeTo,
      focusOn: routing.focusOn,
      estimatedMinutes: routing.estimatedMinutes,
      relevantDocuments: itemMeta.relevantDocuments,
      priority: 0,
    };
    item.priority = computePriority(item);
    return item;
  });

  reviewItems.sort((a, b) => b.priority - a.priority);

  const priorityItems  = reviewItems.filter(i => i.consensusRating === "RED" || i.consensusRating === "DISAGREE");
  const consensusItems = reviewItems.filter(i => i.consensusRating === "GREEN" || i.consensusRating === "AMBER");

  const greenCount    = reviewItems.filter(i => i.consensusRating === "GREEN").length;
  const amberCount    = reviewItems.filter(i => i.consensusRating === "AMBER").length;
  const redCount      = reviewItems.filter(i => i.consensusRating === "RED").length;
  const disagreeCount = reviewItems.filter(i => i.consensusRating === "DISAGREE").length;

  let overallRisk: "LOW" | "MODERATE" | "ELEVATED" = "LOW";
  if (redCount + disagreeCount >= 5 || redCount >= 3) overallRisk = "ELEVATED";
  else if (redCount + disagreeCount >= 2 || amberCount >= 8) overallRisk = "MODERATE";

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
    executiveSummary: { greenCount, amberCount, redCount, disagreeCount, overallRisk },
    priorityItems,
    consensusItems,
    informationGaps,
    allItems: reviewItems,
  };
}
