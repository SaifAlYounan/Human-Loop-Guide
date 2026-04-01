import { useState } from "react";
import { useRunAnalysis, useGetCachedReport } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Play, CheckCircle, Clock, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";

const ANALYST_PROFILES = [
  {
    name: "Analyst Alpha",
    persona: "Conservative / Risk-Focused",
    model: "claude-sonnet-4-6",
    provider: "Anthropic",
    color: "border-red-200 bg-red-50",
    badgeColor: "bg-red-100 text-red-700",
    modelColor: "bg-red-100 text-red-800",
    icon: "🔴",
    description: "Retained by the buyer to protect against hidden risks. Flags non-issues rather than miss real ones. Cautious, direct, document-specific.",
  },
  {
    name: "Analyst Beta",
    persona: "Balanced / Objective",
    model: "gpt-5.2",
    provider: "OpenAI",
    color: "border-amber-200 bg-amber-50",
    badgeColor: "bg-amber-100 text-amber-700",
    modelColor: "bg-amber-100 text-amber-800",
    icon: "🟡",
    description: "M&A advisory firm analyst. Evidence-based and objective — weighs both risks and mitigating factors. Flags information gaps clearly.",
  },
  {
    name: "Analyst Gamma",
    persona: "Growth-Focused / Strategic",
    model: "gemini-2.5-pro",
    provider: "Google",
    color: "border-green-200 bg-green-50",
    badgeColor: "bg-green-100 text-green-700",
    modelColor: "bg-green-100 text-green-800",
    icon: "🟢",
    description: "Restaurant M&A specialist. Looks for upside opportunities and scalable platforms. Still flags genuine RED items, but weighs strategic potential heavily.",
  },
];

const STEPS = [
  { label: "Load all 62 data room documents", duration: "~5s" },
  { label: "Analyst Alpha assesses 42 checklist items (conservative lens)", duration: "~60s" },
  { label: "Analyst Beta assesses 42 checklist items (balanced lens)", duration: "~60s" },
  { label: "Analyst Gamma assesses 42 checklist items (growth lens)", duration: "~60s" },
  { label: "Aggregate ratings, detect disagreement, route to reviewers", duration: "~5s" },
  { label: "Generate Steering Report with priority triage", duration: "~2s" },
];

export default function AnalysisPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const queryClient = useQueryClient();

  const { data: cachedData } = useGetCachedReport();
  const { mutateAsync: runAnalysis } = useRunAnalysis();

  const hasReport = cachedData?.hasCache;
  const reportDate = cachedData?.report?.generatedAt;

  async function handleRun() {
    if (isRunning) return;
    setIsRunning(true);
    setPhase(1);

    const interval = setInterval(() => {
      setPhase((p) => {
        if (p >= STEPS.length - 1) {
          clearInterval(interval);
          return p;
        }
        return p + 1;
      });
    }, 45000);

    try {
      await runAnalysis({});
      clearInterval(interval);
      setPhase(STEPS.length);
      queryClient.invalidateQueries({ queryKey: ["getCachedReport"] });
      toast.success("Analysis complete! Steering report is ready.");
    } catch (err) {
      clearInterval(interval);
      toast.error("Analysis failed. Check API server logs.");
      console.error(err);
    } finally {
      setIsRunning(false);
      setPhase(0);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-slate-400" />
            <span className="text-slate-500 text-sm">Multi-Model AI Review</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Run Analysis</h1>
          <p className="text-slate-500 text-sm mt-1">
            Three independent AI analysts review all 62 documents against the 42-item checklist.
            Each analyst rates every item GREEN, AMBER, or RED with a confidence score.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {ANALYST_PROFILES.map((analyst) => (
            <div
              key={analyst.name}
              className={cn("rounded-xl border p-5", analyst.color)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{analyst.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{analyst.name}</h3>
                  <span
                    className={cn("text-xs px-1.5 py-0.5 rounded font-medium", analyst.badgeColor)}
                  >
                    {analyst.persona}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{analyst.description}</p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs px-2 py-0.5 rounded font-mono font-semibold", analyst.modelColor)}>
                  {analyst.model}
                </span>
                <span className="text-xs text-slate-400">{analyst.provider}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Analysis Pipeline (~3-5 minutes)
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = isRunning && phase === stepNum;
              const isDone = phase > stepNum || (!isRunning && phase === STEPS.length);
              const isPending = !isActive && !isDone;

              return (
                <div
                  key={i}
                  className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", {
                    "bg-blue-50 border border-blue-200": isActive,
                    "bg-green-50 border border-green-200": isDone,
                    "bg-slate-50 border border-slate-200": isPending,
                  })}
                >
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    {isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : isDone ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <span className="text-xs font-mono text-slate-400">{stepNum}</span>
                    )}
                  </div>
                  <p
                    className={cn("text-sm flex-1", {
                      "text-blue-800 font-medium": isActive,
                      "text-green-700": isDone,
                      "text-slate-500": isPending,
                    })}
                  >
                    {step.label}
                  </p>
                  <span className="text-xs text-slate-400 shrink-0">{step.duration}</span>
                </div>
              );
            })}
          </div>
        </div>

        {hasReport && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">Steering report available</p>
                {reportDate && (
                  <p className="text-xs text-green-600">
                    Generated: {new Date(reportDate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Link href="/report" className="flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-900">
              View Report <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg",
              isRunning
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:scale-95"
            )}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing... (Step {phase}/{STEPS.length})
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {hasReport ? "Re-run Analysis" : "Run Analysis"}
              </>
            )}
          </button>
          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Do not close this page — analysis in progress
            </div>
          )}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Note:</strong> This analysis uses OpenAI AI Integrations (billed to your Replit credits).
            Three independent model calls are made — one per analyst persona. Each call receives the full 62-document context
            and 42-item checklist. Total estimated cost: ~$0.10–0.30 per run using GPT-5-mini. Results are cached in memory
            and available via the Steering Report until the server restarts.
          </p>
        </div>
      </div>
    </div>
  );
}
