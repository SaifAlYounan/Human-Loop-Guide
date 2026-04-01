import { useState, useEffect, useRef } from "react";
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
  { label: "Analyst Alpha reviews 42 items — Claude claude-sonnet-4-6 (Anthropic)", duration: "~60-90s" },
  { label: "Analyst Beta reviews 42 items — GPT-5.2 (OpenAI)", duration: "~60-90s" },
  { label: "Analyst Gamma reviews 42 items — Gemini 2.5 Pro (Google)", duration: "~60-90s" },
  { label: "Aggregate ratings, detect disagreement, route to reviewers", duration: "~5s" },
  { label: "Generate Steering Report with priority triage", duration: "~2s" },
];

export default function AnalysisPage() {
  const [polling, setPolling] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  const { data: cachedData, refetch } = useGetCachedReport();
  const { mutateAsync: runAnalysis } = useRunAnalysis();

  const serverStatus = (cachedData as any)?.status as string | undefined;
  const isRunning = serverStatus === "running" || polling;
  const hasReport = cachedData?.hasCache;
  const reportDate = cachedData?.report?.generatedAt;

  // Active step based on elapsed time (rough estimate for UX)
  const activeStep = isRunning
    ? elapsedSeconds < 5 ? 1
    : elapsedSeconds < 95 ? 2
    : elapsedSeconds < 185 ? 3
    : elapsedSeconds < 275 ? 4
    : 5
    : hasReport ? STEPS.length : 0;

  // Poll while running
  useEffect(() => {
    if (!polling) return;
    const poll = setInterval(async () => {
      const result = await refetch();
      const status = (result.data as any)?.status;
      if (status === "complete") {
        clearInterval(poll);
        clearInterval(timerRef.current!);
        setPolling(false);
        queryClient.invalidateQueries({ queryKey: ["getCachedReport"] });
        toast.success("Analysis complete! Steering report is ready.");
      } else if (status === "error") {
        clearInterval(poll);
        clearInterval(timerRef.current!);
        setPolling(false);
        const err = (result.data as any)?.error ?? "Unknown error";
        toast.error(`Analysis failed: ${err}`);
      }
    }, 4000);
    return () => clearInterval(poll);
  }, [polling]);

  async function handleRun() {
    if (isRunning) return;
    setElapsedSeconds(0);
    try {
      await runAnalysis({});
      setPolling(true);
      // Elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      toast.error("Could not start analysis. Check API server.");
      console.error(err);
    }
  }

  // Clean up timer on unmount
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

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
            Three independent AI analysts — each on a different model — review all 62 documents against the 42-item checklist.
            Runs take <strong>3–5 minutes</strong> and execute in the background; you can safely navigate away.
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Analysis Pipeline (~3-5 minutes)
            </h2>
            {isRunning && (
              <span className="text-sm font-mono text-blue-600 font-semibold">
                {formatElapsed(elapsedSeconds)} elapsed
              </span>
            )}
          </div>
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = isRunning && activeStep === stepNum;
              const isDone = (!isRunning && hasReport) || (isRunning && activeStep > stepNum);
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

        {hasReport && !isRunning && (
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

        {isRunning && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Analysis running in background — all three models running in parallel
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                You can navigate away and come back. The report will appear automatically when ready.
              </p>
            </div>
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
                Analyzing... ({formatElapsed(elapsedSeconds)})
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                {hasReport ? "Re-run Analysis" : "Run Analysis"}
              </>
            )}
          </button>
          {!isRunning && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Est. 3–5 min · ~$0.10–0.40 in AI credits
            </div>
          )}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700">Models:</strong> Alpha uses <code className="bg-slate-100 px-1 rounded">claude-sonnet-4-6</code> (Anthropic) ·
            Beta uses <code className="bg-slate-100 px-1 rounded">gpt-5.2</code> (OpenAI) ·
            Gamma uses <code className="bg-slate-100 px-1 rounded">gemini-2.5-pro</code> (Google).
            All three run in parallel. Results are cached on the server until it restarts.
            Billed to your Replit AI credits.
          </p>
        </div>
      </div>
    </div>
  );
}
