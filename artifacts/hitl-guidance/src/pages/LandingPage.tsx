import { Link } from "wouter";
import { Database, CheckSquare, Brain, ShieldCheck, XCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0f1e2e" }}
    >
      <div className="w-full bg-red-600 text-black text-center text-xs font-bold py-1.5 tracking-widest uppercase shrink-0">
        PROTOTYPE — VERSION 0 — FOR PROOF OF CONCEPT
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl flex flex-col items-center text-center">

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 text-white font-bold text-xl"
          style={{ backgroundColor: "#1a3a5c" }}
        >
          H
        </div>

        <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
          Human-in-the-Loop<br />Guidance System
        </h1>
        <p className="mt-4 text-lg" style={{ color: "#7fa8c9" }}>
          Multi-model AI review triage for M&amp;A due diligence —<br />
          three independent analysts, one steering report, you decide.
        </p>

        <div className="mt-12 flex flex-col gap-4 w-full">
          <Link
            href="/documents"
            className="flex items-center gap-4 px-8 py-5 rounded-2xl font-semibold text-lg text-white transition-all hover:scale-[1.02] active:scale-100"
            style={{ backgroundColor: "#1a3a5c" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#2a5a8c" }}
            >
              <Database className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">Explore Data Room</p>
              <p className="text-sm font-normal" style={{ color: "#7fa8c9" }}>
                Browse all 62 source documents
              </p>
            </div>
          </Link>

          <Link
            href="/checklist"
            className="flex items-center gap-4 px-8 py-5 rounded-2xl font-semibold text-lg text-white transition-all hover:scale-[1.02] active:scale-100"
            style={{ backgroundColor: "#1a3a5c" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#2a5a8c" }}
            >
              <CheckSquare className="w-5 h-5 text-blue-200" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">View Checklists</p>
              <p className="text-sm font-normal" style={{ color: "#7fa8c9" }}>
                42-item due diligence framework across 6 dimensions
              </p>
            </div>
          </Link>

          <Link
            href="/analysis"
            className="flex items-center gap-4 px-8 py-5 rounded-2xl font-semibold text-lg text-white transition-all hover:scale-[1.02] active:scale-100"
            style={{ backgroundColor: "#163060" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#1e4a90" }}
            >
              <Brain className="w-5 h-5 text-blue-300" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold">Run Review Analysis</p>
              <p className="text-sm font-normal" style={{ color: "#7fa8c9" }}>
                Launch three AI analysts · generate steering report
              </p>
            </div>
          </Link>
        </div>

        <div
          className="mt-14 w-full rounded-2xl p-7 text-left"
          style={{ backgroundColor: "#0a1520", border: "1px solid #1a3a5c" }}
        >
          <h2 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: "#4a7a9b" }}>
            What this system does — and doesn't
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              {[
                "Runs three independent AI analysts with distinct risk personas",
                "Routes each of 42 checklist items: Cleared / Review / Escalate / Priority",
                "Surfaces disagreement between analysts for human adjudication",
                "Routes each item to the right specialist reviewer",
                "Identifies information gaps requiring follow-up",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#22c55e" }} />
                  <p className="text-sm leading-snug" style={{ color: "#a8c8e0" }}>{item}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[
                "Does not replace a qualified M&A attorney or CPA",
                "Does not constitute legal, tax, or investment advice",
                "Does not verify documents for authenticity or fraud",
                "Does not make the investment decision for you",
                "All target data is entirely fictional (demo only)",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
                  <p className="text-sm leading-snug" style={{ color: "#a8c8e0" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
