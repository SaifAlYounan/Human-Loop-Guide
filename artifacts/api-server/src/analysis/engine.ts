import { openai } from "@workspace/integrations-openai-ai-server";
import { batchProcess } from "@workspace/integrations-openai-ai-server/batch";
import { documents } from "../data/documents.js";
import { checklist } from "../data/checklist.js";
import { analysts, buildDocumentContext, buildChecklistPrompt } from "./promptTemplates.js";

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
  id: number;
  rating: string;
  confidence: number;
  summary: string;
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
  const upper = raw?.toUpperCase()?.trim();
  if (upper === "GREEN") return "GREEN";
  if (upper === "RED") return "RED";
  return "AMBER";
}

function determineConsensus(findings: ModelFinding[]): { consensusRating: "GREEN" | "AMBER" | "RED" | "DISAGREE"; disagreementInsight?: string } {
  const ratings = findings.map(f => f.rating);
  const hasRed = ratings.includes("RED");
  const hasGreen = ratings.includes("GREEN");

  if (ratings.every(r => r === "GREEN")) return { consensusRating: "GREEN" };
  if (ratings.every(r => r === "RED")) return { consensusRating: "RED" };
  if (ratings.every(r => r === "AMBER")) return { consensusRating: "AMBER" };

  if (hasRed && hasGreen) {
    const redAnalysts = findings.filter(f => f.rating === "RED").map(f => f.analyst).join(", ");
    const greenAnalysts = findings.filter(f => f.rating === "GREEN").map(f => f.analyst).join(", ");
    return {
      consensusRating: "DISAGREE",
      disagreementInsight: `${redAnalysts} flagged this as RED while ${greenAnalysts} rated it GREEN. Human review required to resolve opposing assessments.`
    };
  }

  if (hasRed) {
    return {
      consensusRating: "DISAGREE",
      disagreementInsight: `Analysts disagree: some rate RED, others AMBER. Elevate to senior review.`
    };
  }

  return {
    consensusRating: "DISAGREE",
    disagreementInsight: `Analysts split between AMBER and GREEN. May require additional clarification before closing.`
  };
}

function computePriority(item: ReviewItem): number {
  const ratingScore: Record<string, number> = { RED: 3, DISAGREE: 2.5, AMBER: 1, GREEN: 0 };
  const base = ratingScore[item.consensusRating] ?? 0;
  const avgConfidence = item.findings.reduce((a, b) => a + b.confidence, 0) / item.findings.length;
  return Math.round(base * 10 + (10 - avgConfidence));
}

async function runAnalystQuery(analystConfig: typeof analysts[0], documentContext: string, allChecklistItems: Array<{id: number; question: string}>): Promise<RawFinding[]> {
  const userPrompt = buildChecklistPrompt(allChecklistItems, documentContext);

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 8192,
    messages: [
      { role: "system", content: analystConfig.systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  const content = response.choices[0]?.message?.content ?? "[]";

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RawFinding[];
    }
  } catch (e) {
    console.error(`Failed to parse response from ${analystConfig.name}:`, e);
  }
  return [];
}

export async function runFullAnalysis(): Promise<SteeringReport> {
  const allDocs = documents;
  const documentContext = buildDocumentContext(allDocs.map(d => ({ id: d.id, title: d.title, content: d.content })));

  const allChecklistItems = checklist.flatMap(dim => dim.items.map(item => ({ id: item.id, question: item.question })));
  const checklistMap = new Map<number, { question: string; relevantDocuments: string[] }>();
  checklist.forEach(dim => {
    dim.items.forEach(item => {
      checklistMap.set(item.id, { question: item.question, relevantDocuments: item.relevantDocuments });
    });
  });

  const [alphaFindings, betaFindings, gammaFindings] = await batchProcess(
    analysts,
    async (analyst) => {
      console.log(`Running analysis for ${analyst.name}...`);
      return runAnalystQuery(analyst, documentContext, allChecklistItems);
    },
    { concurrency: 3, retries: 3 }
  );

  const reviewItems: ReviewItem[] = allChecklistItems.map(checklistItem => {
    const id = checklistItem.id;
    const alphaRaw = alphaFindings.find((f: RawFinding) => f.id === id);
    const betaRaw = betaFindings.find((f: RawFinding) => f.id === id);
    const gammaRaw = gammaFindings.find((f: RawFinding) => f.id === id);

    const findings: ModelFinding[] = [
      {
        analyst: "Analyst Alpha (Conservative)",
        rating: normalizeRating(alphaRaw?.rating ?? "AMBER"),
        confidence: alphaRaw?.confidence ?? 5,
        summary: alphaRaw?.summary ?? "Analysis not available."
      },
      {
        analyst: "Analyst Beta (Balanced)",
        rating: normalizeRating(betaRaw?.rating ?? "AMBER"),
        confidence: betaRaw?.confidence ?? 5,
        summary: betaRaw?.summary ?? "Analysis not available."
      },
      {
        analyst: "Analyst Gamma (Growth-Focused)",
        rating: normalizeRating(gammaRaw?.rating ?? "GREEN"),
        confidence: gammaRaw?.confidence ?? 5,
        summary: gammaRaw?.summary ?? "Analysis not available."
      }
    ];

    const { consensusRating, disagreementInsight } = determineConsensus(findings);
    const routing = REVIEWER_ROUTING[id] ?? {
      routeTo: "Senior Deal Partner",
      focusOn: "Review relevant documents",
      estimatedMinutes: 30
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
      priority: 0
    };
    item.priority = computePriority(item);
    return item;
  });

  reviewItems.sort((a, b) => b.priority - a.priority);

  const priorityItems = reviewItems.filter(i => i.consensusRating === "RED" || i.consensusRating === "DISAGREE");
  const consensusItems = reviewItems.filter(i => i.consensusRating === "GREEN" || i.consensusRating === "AMBER");

  const greenCount = reviewItems.filter(i => i.consensusRating === "GREEN").length;
  const amberCount = reviewItems.filter(i => i.consensusRating === "AMBER").length;
  const redCount = reviewItems.filter(i => i.consensusRating === "RED").length;
  const disagreeCount = reviewItems.filter(i => i.consensusRating === "DISAGREE").length;

  let overallRisk: "LOW" | "MODERATE" | "ELEVATED" = "LOW";
  if (redCount + disagreeCount >= 5 || redCount >= 3) overallRisk = "ELEVATED";
  else if (redCount + disagreeCount >= 2 || amberCount >= 8) overallRisk = "MODERATE";

  const informationGaps: InformationGap[] = [
    {
      description: "Maria K Catering arrangement: The financial impact of kitchen/equipment use has not been quantified or independently verified.",
      impact: "Potential misallocation of company resources; possible understated expenses in FY2024 and FY2025 financials."
    },
    {
      description: "Head chef (Dimitri Alexandros) post-acquisition intentions are undocumented. No retention agreement exists.",
      impact: "Significant risk to restaurant operations and reputation if chef departs post-closing."
    },
    {
      description: "No formal lease renewal option exists. Landlord's renewal intentions have not been solicited or confirmed.",
      impact: "Entire business valuation assumes continued occupation. Non-renewal would require relocation or closure."
    },
    {
      description: "HVAC replacement responsibility is unclear under the lease — maintenance vs. replacement not defined.",
      impact: "Potential $15,000-$22,000 unbudgeted CAPEX exposure within 1-3 years."
    },
    {
      description: "No trademark attorney opinion has been rendered on the 'Olive & Thyme' brand. California conflict unresolved.",
      impact: "Brand unprotected at federal level; expansion restrictions possible if California entity has superior rights."
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    executiveSummary: {
      greenCount,
      amberCount,
      redCount,
      disagreeCount,
      overallRisk
    },
    priorityItems,
    consensusItems,
    informationGaps,
    allItems: reviewItems
  };
}
