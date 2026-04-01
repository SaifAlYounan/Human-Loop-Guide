import { useState } from "react";
import { useGetCachedReport } from "@workspace/api-client-react";
import {
  FileBarChart2,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  GitMerge,
  Brain,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type Routing = "CONSENSUS" | "MAJORITY" | "SPLIT";
type ModelRating = "GREEN" | "AMBER" | "RED";
type ActiveFilter = Routing | "ALL";

// ── Layer 1: Routing badges ─────────────────────────────────────────────────
// Based purely on model AGREEMENT, not on which rating was given.
const ROUTING_CONFIG: Record<Routing, {
  label: string;
  sublabel: string;
  icon: typeof CheckCircle2;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  ringColor: string;
}> = {
  CONSENSUS: {
    label: "Consensus",
    sublabel: "all 3 models agree",
    icon: CheckCircle2,
    badgeBg: "#1B2A4A",
    badgeText: "#ffffff",
    cardBg: "bg-slate-50",
    cardBorder: "border-slate-200",
    ringColor: "#1B2A4A",
  },
  MAJORITY: {
    label: "Majority",
    sublabel: "2 of 3 models agree",
    icon: GitMerge,
    badgeBg: "#FFC72C",
    badgeText: "#1B2A4A",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
    ringColor: "#FFC72C",
  },
  SPLIT: {
    label: "Split",
    sublabel: "no consensus — priority review",
    icon: AlertTriangle,
    badgeBg: "#E8614D",
    badgeText: "#ffffff",
    cardBg: "bg-red-50",
    cardBorder: "border-red-100",
    ringColor: "#E8614D",
  },
};

// ── Layer 2: Individual model risk badges ───────────────────────────────────
// Only appear in the expanded detail view. Green/Amber/Red = risk opinion.
const MODEL_RATING_CONFIG: Record<ModelRating, { label: string; badge: string }> = {
  GREEN: { label: "Green",  badge: "bg-green-100 text-green-800" },
  AMBER: { label: "Amber",  badge: "bg-amber-100 text-amber-800" },
  RED:   { label: "Red",    badge: "bg-red-100 text-red-800" },
};

const ANALYST_COLORS: Record<string, { dot: string }> = {
  "Model A: GPT-5.2":           { dot: "bg-blue-400"   },
  "Model B: claude-sonnet-4-6": { dot: "bg-orange-400" },
  "Model C: gemini-2.5-pro":    { dot: "bg-green-400"  },
};

function RoutingBadge({ routing }: { routing: Routing }) {
  const cfg = ROUTING_CONFIG[routing];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ModelRatingBadge({ rating }: { rating: string }) {
  const cfg = MODEL_RATING_CONFIG[rating as ModelRating] ?? { label: rating, badge: "bg-slate-100 text-slate-700" };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", cfg.badge)}>
      {cfg.label}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", {
            "bg-green-400": value >= 8,
            "bg-amber-400": value >= 5 && value < 8,
            "bg-red-400": value < 5,
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-5 text-right">{value}/10</span>
    </div>
  );
}

function ReviewItemCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);
  const routing = item.routing as Routing;
  const cfg = ROUTING_CONFIG[routing] ?? ROUTING_CONFIG.CONSENSUS;

  return (
    <div className={cn("rounded-xl border transition-all", cfg.cardBg, cfg.cardBorder)}>
      <div className="flex items-start gap-3 p-4">
        <span className="text-xs font-mono text-slate-400 pt-0.5 w-5 shrink-0 text-center">
          #{item.checklistId}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1.5">
            <RoutingBadge routing={routing} />
            <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">
              {item.question}
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-snug mb-2">
            {item.agreementSummary}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 shrink-0" />
              <span className="font-medium text-slate-600">{item.routeTo}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              {item.estimatedMinutes} min
            </span>
            <div className="flex gap-1 flex-wrap">
              {item.relevantDocuments.slice(0, 4).map((d: string) => (
                <span key={d} className="px-1.5 py-0.5 rounded font-mono bg-white border border-slate-200 text-slate-500">
                  {d}
                </span>
              ))}
              {item.relevantDocuments.length > 4 && (
                <span className="text-slate-400">+{item.relevantDocuments.length - 4}</span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 p-1 rounded hover:bg-white/60 transition-colors"
          aria-label={expanded ? "Collapse" : "Expand model assessments"}
        >
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Focus On</p>
          <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
            {item.focusOn}
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
            Individual Model Assessments — Risk Opinion
          </p>
          <div className="space-y-2">
            {item.findings.map((f: any) => {
              const analystCfg = ANALYST_COLORS[f.analyst] ?? { dot: "bg-slate-400" };
              return (
                <div key={f.analyst} className="rounded-lg bg-white border border-slate-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", analystCfg.dot)} />
                    <span className="text-xs font-semibold text-slate-700">{f.analyst}</span>
                    <ModelRatingBadge rating={f.rating} />
                    <div className="flex-1">
                      <ConfidenceBar value={f.confidence} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.summary}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const { data: cachedData, isLoading } = useGetCachedReport();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");
  const [activeTab, setActiveTab] = useState<"split" | "all" | "gaps">("split");

  const report = cachedData?.report;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-24">
          <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Report Yet</h2>
          <p className="text-slate-500 mb-6">
            Run the AI analysis first to generate the Steering Report.
          </p>
          <Link href="/analysis" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Go to Analysis
          </Link>
        </div>
      </div>
    );
  }

  const summary    = report.executiveSummary;
  const allItems   = report.allItems ?? [];
  const splitItems = report.priorityItems ?? [];
  const gaps       = report.informationGaps ?? [];

  const filteredAll = activeFilter === "ALL"
    ? allItems
    : allItems.filter((i: any) => i.routing === activeFilter);

  const totalTime = allItems.reduce((s: number, i: any) => s + (i.estimatedMinutes ?? 0), 0);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FileBarChart2 className="w-5 h-5 text-slate-400" />
            <span className="text-slate-500 text-sm">AI Steering Report</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">M&A Due Diligence Steering Report</h1>
          <p className="text-slate-500 text-sm mt-1">
            Olive & Thyme LLC · Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>

        {/* ── Routing summary tiles ────────────────────────────── */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Routing Summary — based on model agreement
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(["CONSENSUS", "MAJORITY", "SPLIT"] as Routing[]).map((r) => {
            const cfg = ROUTING_CONFIG[r];
            const Icon = cfg.icon;
            const count = r === "CONSENSUS" ? summary.consensusCount
                        : r === "MAJORITY"  ? summary.majorityCount
                        : summary.splitCount;
            const isActive = activeFilter === r;
            return (
              <button
                key={r}
                onClick={() => { setActiveFilter(isActive ? "ALL" : r); setActiveTab("all"); }}
                className={cn(
                  "rounded-xl border-2 p-5 text-center transition-all hover:shadow-md",
                  cfg.cardBg,
                  isActive ? "shadow-md" : "border-transparent"
                )}
                style={{ borderColor: isActive ? cfg.ringColor : "transparent" }}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: cfg.badgeBg }} />
                <p className="text-3xl font-bold" style={{ color: cfg.badgeBg }}>{count}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: cfg.badgeBg }}>{cfg.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{cfg.sublabel}</p>
              </button>
            );
          })}
        </div>

        {/* ── Overall assessment bar ───────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-6 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("px-3 py-1.5 rounded-lg text-sm font-bold", {
              "bg-slate-100 text-slate-700": summary.overallRisk === "LOW",
              "bg-amber-100 text-amber-800": summary.overallRisk === "MODERATE",
              "bg-red-100 text-red-800":     summary.overallRisk === "ELEVATED",
            })}>
              {summary.overallRisk} AGREEMENT
            </div>
            <p className="text-xs text-slate-500">
              {summary.splitCount} Split · {summary.majorityCount} Majority · {summary.consensusCount} Consensus
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Est. total review time: <strong className="text-slate-700">{Math.round(totalTime / 60)} hours</strong></span>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { key: "split", label: `Split Items (${splitItems.length})` },
            { key: "all",   label: "All 42 Items" },
            { key: "gaps",  label: `Information Gaps (${gaps.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); if (tab.key !== "all") setActiveFilter("ALL"); }}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Split tab ─────────────────────────────────────────── */}
        {activeTab === "split" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Items where the three models <strong>could not reach agreement</strong> — human review and final call required.
              Sorted by priority score.
            </p>
            <div className="space-y-3">
              {splitItems.map((item: any) => (
                <ReviewItemCard key={item.checklistId} item={item} />
              ))}
              {splitItems.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  <p>No Split items — all models reached agreement on every checklist item.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── All items tab ─────────────────────────────────────── */}
        {activeTab === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex gap-2 flex-wrap">
                {(["ALL", "SPLIT", "MAJORITY", "CONSENSUS"] as const).map((f) => {
                  const labels: Record<string, string> = {
                    ALL: "All", SPLIT: "Split", MAJORITY: "Majority", CONSENSUS: "Consensus",
                  };
                  const isActive = activeFilter === f;
                  const cfg = f !== "ALL" ? ROUTING_CONFIG[f as Routing] : null;
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                        isActive
                          ? f === "ALL"
                            ? "bg-slate-800 text-white"
                            : "text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                      style={isActive && cfg ? { backgroundColor: cfg.badgeBg, color: cfg.badgeText } : undefined}
                    >
                      {labels[f]}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs text-slate-400 ml-2">{filteredAll.length} items</span>
            </div>
            <div className="space-y-3">
              {filteredAll.map((item: any) => (
                <ReviewItemCard key={item.checklistId} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* ── Information gaps tab ─────────────────────────────── */}
        {activeTab === "gaps" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Key information gaps that require follow-up before closing.
            </p>
            <div className="space-y-3">
              {gaps.map((gap: any, i: number) => (
                <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">{gap.description}</p>
                      <p className="text-xs text-amber-700 mt-1.5">
                        <strong>Impact:</strong> {gap.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-700">Disclaimer:</strong> This report is generated by AI models and is intended as a first-pass
            triage tool only. The routing categories (Consensus / Majority / Split) reflect the degree of model agreement —
            they do not constitute professional risk opinions. All findings must be independently verified by qualified professionals
            before any investment decision is made. Olive & Thyme LLC is entirely fictional and created for demonstration purposes.
          </p>
        </div>

      </div>
    </div>
  );
}
