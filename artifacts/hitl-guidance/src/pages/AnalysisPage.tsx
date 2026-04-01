import { useState, useEffect, useRef } from "react";
import { useRunAnalysis, useGetCachedReport } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Brain, Play, CheckCircle, Clock, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";

const MODEL_CARDS = [
  {
    label: "GPT-5.2",
    provider: "OpenAI",
    dotColor: "#60a5fa",
    color: "border-blue-200 bg-blue-50",
    badgeColor: "bg-blue-100 text-blue-800",
  },
  {
    label: "Claude Sonnet 4.6",
    provider: "Anthropic",
    dotColor: "#fb923c",
    color: "border-orange-200 bg-orange-50",
    badgeColor: "bg-orange-100 text-orange-800",
  },
  {
    label: "Gemini 2.5 Pro",
    provider: "Google",
    dotColor: "#4ade80",
    color: "border-green-200 bg-green-50",
    badgeColor: "bg-green-100 text-green-800",
  },
];

const STEPS = [
  { label: "Load all 62 data room documents" },
  { label: "GPT-5.2 — rates all 42 checklist items LOW / MEDIUM / HIGH RISK" },
  { label: "Claude Sonnet 4.6 — rates all 42 checklist items LOW / MEDIUM / HIGH RISK" },
  { label: "Gemini 2.5 Pro — rates all 42 checklist items LOW / MEDIUM / HIGH RISK" },
  { label: "Apply routing matrix: CLEAR / CHECK / REVIEW / ESCALATE based on agreement + severity" },
  { label: "Generate Steering Report" },
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

  const activeStep = isRunning
    ? elapsedSeconds < 5 ? 1
    : elapsedSeconds < 95 ? 2
    : elapsedSeconds < 185 ? 3
    : elapsedSeconds < 275 ? 4
    : 5
    : hasReport ? STEPS.length : 0;

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
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    } catch (err) {
      toast.error("Could not start analysis. Check API server.");
      console.error(err);
    }
  }

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
            Three different AI models receive the <strong>exact same prompt</strong> and the <strong>exact same 42-item checklist</strong>.
            The value comes from model diversity — not prompt diversity. Runs take 3–5 minutes in the background.
          </p>
        </div>

        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 leading-relaxed font-mono">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Single system prompt — sent to all three models identically</p>
          <p className="text-slate-700 italic">
            "You are a due diligence analyst. For each of the 42 checklist items, review all provided documents and return a JSON array.
            Each item must have: itemNumber (integer), rating (exactly one of: LOW RISK, MEDIUM RISK, HIGH RISK), confidence (integer 1-10), rationale
            (2-3 sentences citing specific documents and numbers). If information is missing, rate MEDIUM RISK. If two documents contradict
            each other, rate HIGH RISK and cite both. Return ONLY valid JSON, no other text."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {MODEL_CARDS.map((m) => (
            <div key={m.label} className={cn("rounded-xl border p-5", m.color)}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.dotColor }} />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{m.provider}</p>
              </div>
              <p className={cn("text-sm font-bold px-2 py-1 rounded inline-block mb-1", m.badgeColor)}>
                {m.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">Rates: LOW RISK · MEDIUM RISK · HIGH RISK</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Analysis Pipeline (~3-5 minutes, all models run in parallel)
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
                  <p className={cn("text-sm flex-1", {
                    "text-blue-800 font-medium": isActive,
                    "text-green-700": isDone,
                    "text-slate-500": isPending,
                  })}>
                    {step.label}
                  </p>
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
                  <p className="text-xs text-green-600">Generated: {new Date(reportDate).toLocaleString()}</p>
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
                Running in background — all three models processing in parallel
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                You can navigate away. The report will appear automatically when ready.
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
              Est. 3–5 min · ~$0.10–0.50 in AI credits
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
