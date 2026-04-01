import { useState } from "react";
import { useGetCachedReport } from "@workspace/api-client-react";
import {
  FileBarChart2,
  AlertTriangle,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Brain,
  Filter,
  ShieldCheck,
  Eye,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

type Routing = "CLEAR" | "CHECK" | "REVIEW" | "ESCALATE";
type ActiveFilter = Routing | "ALL" | "GAPS";

const ROUTING_CONFIG: Record<Routing, {
  label: string;
  sublabel: string;
  icon: typeof CheckCircle2;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
}> = {
  CLEAR: {
    label: "CLEAR",
    sublabel: "no action needed",
    icon: CheckCircle2,
    badgeBg: "#1B2A4A",
    badgeText: "#ffffff",
    cardBg: "bg-slate-50",
    cardBorder: "border-slate-200",
  },
  CHECK: {
    label: "CHECK",
    sublabel: "targeted review needed",
    icon: Search,
    badgeBg: "#FFC72C",
    badgeText: "#1B2A4A",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
  },
  REVIEW: {
    label: "REVIEW",
    sublabel: "substantive review required",
    icon: Eye,
    badgeBg: "#E88B3A",
    badgeText: "#ffffff",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-200",
  },
  ESCALATE: {
    label: "ESCALATE",
    sublabel: "partner attention required",
    icon: AlertTriangle,
    badgeBg: "#E8614D",
    badgeText: "#ffffff",
    cardBg: "bg-red-50",
    cardBorder: "border-red-100",
  },
};

const ANALYST_COLORS: Record<string, string> = {
  "GPT-5.2":           "#60a5fa",
  "Claude Sonnet 4.6": "#fb923c",
  "Gemini 2.5 Pro":    "#4ade80",
};

function RoutingBadge({ routing }: { routing: Routing }) {
  const cfg = ROUTING_CONFIG[routing] ?? ROUTING_CONFIG.CLEAR;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 tracking-wide"
      style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="flex items-center gap-1.5 flex-1">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", {
            "bg-green-400": value >= 8,
            "bg-amber-400": value >= 5 && value < 8,
            "bg-red-400":   value < 5,
          })}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-9 text-right shrink-0">{value}/10</span>
    </div>
  );
}

function ReviewItemCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);
  const routing = item.routing as Routing;
  const cfg = ROUTING_CONFIG[routing] ?? ROUTING_CONFIG.CLEAR;

  return (
    <div className={cn("rounded-xl border transition-all", cfg.cardBg, cfg.cardBorder)}>
      <div className="flex items-start gap-3 p-4">
        <span className="text-xs font-mono text-slate-400 pt-0.5 w-6 shrink-0 text-right">
          #{item.checklistId}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap mb-1.5">
            <RoutingBadge routing={routing} />
            <p className="text-sm font-semibold text-slate-800 leading-snug flex-1">
              {item.question}
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-snug mb-2 italic">
            {item.routingRationale}
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
                <span key={d} className="px-1.5 py-0.5 rounded font-mono bg-white border border-slate-200 text-slate-500 text-xs">
                  {d}
                </span>
              ))}
              {item.relevantDocuments.length > 4 && (
                <span className="text-slate-400 text-xs">+{item.relevantDocuments.length - 4}</span>
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
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Focus On</p>
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
              {item.focusOn}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Individual Model Assessments
            </p>
            <div className="space-y-2">
              {item.findings.map((f: any) => {
                const dotColor = ANALYST_COLORS[f.analyst] ?? "#94a3b8";
                return (
                  <div key={f.analyst} className="rounded-lg bg-white border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                      <span className="text-xs font-semibold text-slate-700 shrink-0">{f.analyst}</span>
                      <span className="text-xs text-slate-500 shrink-0 border border-slate-200 rounded px-1.5 py-0.5">
                        {f.rating}
                      </span>
                      <ConfidenceBar value={f.confidence} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.summary}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  const { data: cachedData, isLoading } = useGetCachedReport();
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("ALL");

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

  const summary  = report.executiveSummary;
  const allItems = report.allItems ?? [];
  const gaps     = report.informationGaps ?? [];

  const countFor = (r: Routing) => summary[`${r.toLowerCase()}Count` as keyof typeof summary] as number;

  const filteredItems = activeFilter === "ALL"
    ? allItems
    : activeFilter === "GAPS"
    ? []
    : allItems.filter((i: any) => i.routing === activeFilter);

  const totalTime = allItems.reduce((s: number, i: any) => s + (i.estimatedMinutes ?? 0), 0);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FileBarChart2 className="w-5 h-5 text-slate-400" />
            <span className="text-slate-500 text-sm">AI Steering Report</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">M&A Due Diligence Steering Report</h1>
          <p className="text-slate-500 text-sm mt-1">
            Olive & Thyme LLC · Asking price $850K · Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            3 models · 62 documents · 42 checklist items · {Math.round(totalTime / 60)}h estimated review time
          </p>
        </div>

        {/* ── 4 summary tiles ──────────────────────────────────── */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Routing Summary — click to filter
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(["CLEAR", "CHECK", "REVIEW", "ESCALATE"] as Routing[]).map((r) => {
            const cfg = ROUTING_CONFIG[r];
            const Icon = cfg.icon;
            const count = countFor(r);
            const isActive = activeFilter === r;
            return (
              <button
                key={r}
                onClick={() => setActiveFilter(isActive ? "ALL" : r)}
                className={cn(
                  "rounded-xl border-2 p-5 text-center transition-all hover:shadow-md",
                  cfg.cardBg,
                  isActive ? "shadow-lg" : "border-transparent"
                )}
                style={{ borderColor: isActive ? cfg.badgeBg : "transparent" }}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: cfg.badgeBg }} />
                <p className="text-3xl font-bold" style={{ color: cfg.badgeBg }}>{count}</p>
                <p className="text-xs font-bold mt-0.5 tracking-wide" style={{ color: cfg.badgeBg }}>{cfg.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{cfg.sublabel}</p>
              </button>
            );
          })}
        </div>

        {/* ── Overall risk bar ─────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-6 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Deal risk level:</span>
            <div className={cn("px-3 py-1 rounded-lg text-sm font-bold", {
              "bg-slate-100 text-slate-700": summary.overallRisk === "LOW",
              "bg-amber-100 text-amber-800": summary.overallRisk === "MODERATE",
              "bg-red-100 text-red-800":     summary.overallRisk === "ELEVATED",
            })}>
              {summary.overallRisk}
            </div>
            <p className="text-xs text-slate-400">
              {summary.escalateCount} Escalate · {summary.reviewCount} Review · {summary.checkCount} Check · {summary.clearCount} Clear
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Est. total review: <strong className="text-slate-700">{Math.round(totalTime / 60)} hours</strong></span>
          </div>
        </div>

        {/* ── Filter bar ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-2 flex-wrap">
            {(["ESCALATE", "REVIEW", "CHECK", "CLEAR", "ALL", "GAPS"] as const).map((f) => {
              const labels: Record<string, string> = {
                ALL: "All Items", GAPS: `Info Gaps (${gaps.length})`,
                ESCALATE: `Escalate (${summary.escalateCount})`,
                REVIEW:   `Review (${summary.reviewCount})`,
                CHECK:    `Check (${summary.checkCount})`,
                CLEAR:    `Clear (${summary.clearCount})`,
              };
              const isActive = activeFilter === f;
              const cfg = f !== "ALL" && f !== "GAPS" ? ROUTING_CONFIG[f as Routing] : null;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                    isActive
                      ? cfg ? "text-white" : "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                  style={isActive && cfg ? { backgroundColor: cfg.badgeBg, color: cfg.badgeText } : undefined}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
          {activeFilter !== "GAPS" && (
            <span className="text-xs text-slate-400 ml-1">{filteredItems.length} items</span>
          )}
        </div>

        {/* ── Item list ────────────────────────────────────────── */}
        {activeFilter !== "GAPS" && (
          <div className="space-y-3">
            {filteredItems.map((item: any) => (
              <ReviewItemCard key={item.checklistId} item={item} />
            ))}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                <p>No items in this category.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Info gaps ────────────────────────────────────────── */}
        {activeFilter === "GAPS" && (
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
              {gaps.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  <p>No information gaps identified.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Routing key ──────────────────────────────────────── */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Routing Key</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {(["CLEAR", "CHECK", "REVIEW", "ESCALATE"] as Routing[]).map((r) => {
              const cfg = ROUTING_CONFIG[r];
              return (
                <div key={r} className="text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-xs mb-1" style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}>
                    {cfg.label}
                  </span>
                  <p className="text-slate-500">{cfg.sublabel}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Routing reflects both model <strong className="text-slate-600">agreement</strong> and <strong className="text-slate-600">severity</strong>.
            CLEAR = all three rate LOW RISK (or 2× LOW + 1× MEDIUM).
            CHECK = consistent moderate concern.
            REVIEW = mixed signals, at least one HIGH.
            ESCALATE = majority or all rate HIGH, or full 3-way split.
            Individual model ratings (LOW RISK / MEDIUM RISK / HIGH RISK) are shown in the expanded view — these are the raw inputs to the routing matrix, not the headline decision.
          </p>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Disclaimer:</strong> This report is generated by AI models and is intended as a first-pass
          triage tool only. Routing categories reflect model agreement and severity levels — they do not constitute professional risk opinions.
          All findings must be independently verified by qualified professionals before any investment decision is made.
          Olive & Thyme LLC is entirely fictional and created for demonstration purposes only.
        </div>

      </div>
    </div>
  );
}
