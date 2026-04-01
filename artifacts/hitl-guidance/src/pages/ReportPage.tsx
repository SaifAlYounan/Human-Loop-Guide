import { useState } from "react";
import { useGetCachedReport } from "@workspace/api-client-react";
import {
  FileBarChart2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Scale,
  Brain,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type Rating = "GREEN" | "AMBER" | "RED" | "DISAGREE";

const RATING_CONFIG: Record<Rating, { label: string; icon: typeof CheckCircle2; bg: string; badge: string; border: string; text: string }> = {
  GREEN: {
    label: "Green",
    icon: CheckCircle2,
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
    border: "border-green-200",
    text: "text-green-700",
  },
  AMBER: {
    label: "Amber",
    icon: AlertTriangle,
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  RED: {
    label: "Red",
    icon: XCircle,
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
    text: "text-red-700",
  },
  DISAGREE: {
    label: "Disagree",
    icon: Scale,
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    border: "border-purple-200",
    text: "text-purple-700",
  },
};

const ANALYST_COLORS: Record<string, { dot: string; badge: string }> = {
  "Model A: GPT-5.2":            { dot: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200"   },
  "Model B: claude-sonnet-4-6":  { dot: "bg-orange-400", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  "Model C: gemini-2.5-pro":     { dot: "bg-green-400",  badge: "bg-green-50 text-green-700 border-green-200"  },
};

function RatingBadge({ rating }: { rating: Rating }) {
  const config = RATING_CONFIG[rating];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
        config.badge
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
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
      <span className="text-xs text-slate-400 w-4">{value}</span>
    </div>
  );
}

function ReviewItemCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = RATING_CONFIG[item.consensusRating as Rating] ?? RATING_CONFIG.AMBER;

  return (
    <div className={cn("rounded-xl border p-5 transition-all", cfg.bg, cfg.border)}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5 shrink-0">
          <span className="text-xs text-slate-400 font-mono block text-center w-6">
            #{item.checklistId}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <RatingBadge rating={item.consensusRating as Rating} />
            <p className="text-sm font-semibold text-slate-800 flex-1">{item.question}</p>
          </div>

          {item.disagreementInsight && (
            <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-purple-100 border border-purple-200">
              <Scale className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
              <p className="text-xs text-purple-700">{item.disagreementInsight}</p>
            </div>
          )}

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate font-medium text-slate-700">{item.routeTo}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{item.estimatedMinutes} min review</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.relevantDocuments.slice(0, 4).map((d: string) => (
                <span key={d} className="px-1.5 py-0.5 rounded font-mono bg-white border border-slate-200">
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
          onClick={() => setExpanded((e) => !e)}
          className="shrink-0 p-1 rounded hover:bg-white/50"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pl-9 space-y-3">
          <div className="p-3 rounded-lg bg-white/70 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">Focus On:</p>
            <p className="text-xs text-slate-700">{item.focusOn}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600">Analyst Findings:</p>
            {item.findings.map((finding: any) => {
              const analystCfg = ANALYST_COLORS[finding.analyst] ?? { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-700 border-slate-200" };
              const findingCfg = RATING_CONFIG[finding.rating as Rating] ?? RATING_CONFIG.AMBER;
              return (
                <div
                  key={finding.analyst}
                  className="rounded-lg border bg-white p-3"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={cn("w-2 h-2 rounded-full", analystCfg.dot)} />
                    <span className="text-xs font-semibold text-slate-700">{finding.analyst}</span>
                    <RatingBadge rating={finding.rating as Rating} />
                    <div className="flex-1">
                      <ConfidenceBar value={finding.confidence} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{finding.summary}</p>
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
  const [activeFilter, setActiveFilter] = useState<Rating | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<"priority" | "all" | "gaps">("priority");

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

  const summary = report.executiveSummary;
  const allItems = report.allItems ?? [];
  const priorityItems = report.priorityItems ?? [];
  const gaps = report.informationGaps ?? [];

  const filteredAll = activeFilter === "ALL"
    ? allItems
    : allItems.filter(i => i.consensusRating === activeFilter);

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(["GREEN", "AMBER", "RED", "DISAGREE"] as Rating[]).map((r) => {
            const cfg = RATING_CONFIG[r];
            const count = r === "GREEN" ? summary.greenCount : r === "AMBER" ? summary.amberCount : r === "RED" ? summary.redCount : summary.disagreeCount;
            const Icon = cfg.icon;
            return (
              <button
                key={r}
                onClick={() => {
                  setActiveFilter(r);
                  setActiveTab("all");
                }}
                className={cn(
                  "rounded-xl border p-4 text-center transition-all hover:shadow-md",
                  cfg.bg, cfg.border,
                  activeFilter === r && "ring-2 ring-offset-1",
                  {
                    "ring-green-400": activeFilter === "GREEN" && r === "GREEN",
                    "ring-amber-400": activeFilter === "AMBER" && r === "AMBER",
                    "ring-red-400": activeFilter === "RED" && r === "RED",
                    "ring-purple-400": activeFilter === "DISAGREE" && r === "DISAGREE",
                  }
                )}
              >
                <Icon className={cn("w-5 h-5 mx-auto mb-1", cfg.text)} />
                <p className={cn("text-3xl font-bold", cfg.text)}>{count}</p>
                <p className={cn("text-xs font-semibold mt-0.5", cfg.text)}>{cfg.label}</p>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("px-3 py-1.5 rounded-lg text-sm font-bold", {
                "bg-green-100 text-green-800": summary.overallRisk === "LOW",
                "bg-amber-100 text-amber-800": summary.overallRisk === "MODERATE",
                "bg-red-100 text-red-800": summary.overallRisk === "ELEVATED",
              })}>
                {summary.overallRisk} RISK
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Overall Assessment</p>
                <p className="text-xs text-slate-500">
                  {summary.redCount + summary.disagreeCount} items requiring human review · {summary.greenCount} items cleared
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Est. total review time: <strong className="text-slate-700">{Math.round(totalTime / 60)} hours</strong></span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { key: "priority", label: `Priority Items (${priorityItems.length})` },
            { key: "all", label: `All 42 Items` },
            { key: "gaps", label: `Information Gaps (${gaps.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); if (tab.key === "all") setActiveFilter("ALL"); }}
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

        {activeTab === "priority" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Items rated RED or where analysts DISAGREE — sorted by priority score
            </p>
            <div className="space-y-3">
              {priorityItems.map((item: any) => (
                <ReviewItemCard key={item.checklistId} item={item} />
              ))}
              {priorityItems.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  <p>No RED or DISAGREE items — strong consensus!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="flex gap-2">
                {(["ALL", "RED", "DISAGREE", "AMBER", "GREEN"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                      activeFilter === f
                        ? f === "ALL"
                          ? "bg-slate-800 text-white"
                          : (RATING_CONFIG[f as Rating]?.badge ?? "bg-slate-100 text-slate-700")
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {f}
                  </button>
                ))}
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

        {activeTab === "gaps" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              Key information gaps that require follow-up before closing
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

        <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          <p>
            <strong className="text-slate-700">Disclaimer:</strong> This report is generated by AI models and is intended as a first-pass triage tool only.
            All findings must be independently verified by qualified professionals (attorneys, CPAs, restaurant industry specialists, and M&A advisors)
            before any investment decision is made. The target company (Olive & Thyme LLC) is entirely fictional and created for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
