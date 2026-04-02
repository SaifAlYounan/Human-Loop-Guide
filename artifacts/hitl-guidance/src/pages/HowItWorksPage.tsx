import {
  FileText,
  Bot,
  GitCompare,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Eye,
  Search,
} from "lucide-react";

const NAVY  = "#1B2A4A";
const GOLD  = "#FFC72C";

const STEPS = [
  {
    icon: FileText,
    label: "Data Room",
    step: "01",
    description:
      "Your deal documents, organized by category — financials, legal, operational, employment, and more. 62 documents. Every one is read.",
  },
  {
    icon: Bot,
    label: "3 Independent AI Reviews",
    step: "02",
    description:
      "Three different AI models review every checklist item independently. Same prompt. Different models. No communication between them.",
  },
  {
    icon: GitCompare,
    label: "Consensus Engine",
    step: "03",
    description:
      "The system compares all three opinions. When models agree, confidence is high. When they disagree, that's exactly where human expertise matters most.",
  },
  {
    icon: ClipboardList,
    label: "Steering Report",
    step: "04",
    description:
      "A prioritized action plan: what to review, who should review it, and how long it should take. Your team focuses on what matters — not on reading everything.",
  },
];

const ROUTING_LEVELS = [
  {
    label: "CLEAR",
    bg: NAVY,
    text: "#ffffff",
    icon: CheckCircle2,
    meaning: "All models agree: low risk. Paralegal can verify quickly.",
  },
  {
    label: "CHECK",
    bg: GOLD,
    text: NAVY,
    icon: Search,
    meaning: "Minor disagreement or consistent medium risk. Associate reviews.",
  },
  {
    label: "REVIEW",
    bg: "#E88B3A",
    text: "#ffffff",
    icon: Eye,
    meaning: "Significant disagreement or one model flags high risk. Senior associate examines.",
  },
  {
    label: "ESCALATE",
    bg: "#E8614D",
    text: "#ffffff",
    icon: AlertTriangle,
    meaning: "Majority or all models flag high risk — or full 3-way split. Partner attention required.",
  },
];

const RISK_RUBRIC = [
  {
    label: "LOW RISK",
    bg: "#DBEAFE",
    border: "#93C5FD",
    textColor: "#1e40af",
    headingColor: "#1d4ed8",
    bullets: [
      "Fully documented, no gaps",
      "Standard market practice",
      "No contradictions across documents",
      "<1% impact on deal value",
    ],
  },
  {
    label: "MEDIUM RISK",
    bg: "#FEF3C7",
    border: "#FCD34D",
    textColor: "#92400e",
    headingColor: "#b45309",
    bullets: [
      "Partial documentation or minor gaps",
      "Non-standard but not unusual",
      "Minor inconsistencies between documents",
      "1–5% impact on deal value",
    ],
  },
  {
    label: "HIGH RISK",
    bg: "#FEE2E2",
    border: "#FCA5A5",
    textColor: "#991b1b",
    headingColor: "#dc2626",
    bullets: [
      "Missing or contradictory documentation",
      "Material deviation from market standard",
      "Document conflicts (X says one thing, Y says another)",
      ">5% impact or deal-breaker potential",
    ],
  },
];

const MATRIX_CELLS: Record<string, { label: string; bg: string; text: string }> = {
  "low-all":    { label: "CLEAR",    bg: "#DBEAFE", text: "#1d4ed8" },
  "low-2of3":   { label: "CHECK",    bg: "#FEF3C7", text: "#b45309" },
  "low-split":  { label: "REVIEW",   bg: "#FFEDD5", text: "#c2410c" },
  "med-all":    { label: "CHECK",    bg: "#FEF3C7", text: "#b45309" },
  "med-2of3":   { label: "REVIEW",   bg: "#FFEDD5", text: "#c2410c" },
  "med-split":  { label: "ESCALATE", bg: "#FEE2E2", text: "#b91c1c" },
  "high-all":   { label: "ESCALATE", bg: "#FEE2E2", text: "#b91c1c" },
  "high-2of3":  { label: "ESCALATE", bg: "#FEE2E2", text: "#b91c1c" },
  "high-split": { label: "ESCALATE", bg: "#FEE2E2", text: "#b91c1c" },
};

const ONE_MODEL_PROBLEMS = [
  "One AI reviewing documents is just automation",
  "If it misses something, nobody catches it",
  "You're trusting a single opinion on critical decisions",
  "Same blind spots on every review",
];

const THREE_MODEL_ADVANTAGES = [
  "When all three agree, confidence is high — you can move fast",
  "When they disagree, you've found where human judgment matters",
  "Different architectures catch different things",
  "Disagreement IS the signal, not a bug",
];

const DOES = [
  "Reads every document against a structured checklist",
  "Flags disagreements between independent AI reviewers",
  "Routes items to the right level of human expertise",
  "Estimates review time to help resource planning",
];

const DOES_NOT = [
  "Replace professional judgment",
  "Provide legal, tax, or investment advice",
  "Guarantee completeness or accuracy",
  "Make the investment decision for you",
];

function MatrixCell({ cellKey }: { cellKey: string }) {
  const cell = MATRIX_CELLS[cellKey];
  return (
    <td className="p-0">
      <div
        className="m-1 rounded-lg px-3 py-2 text-center text-xs font-bold tracking-wide"
        style={{ backgroundColor: cell.bg, color: cell.text }}
      >
        {cell.label}
      </div>
    </td>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            System Overview
          </p>
          <h1 className="text-3xl font-bold" style={{ color: NAVY }}>
            How It Works
          </h1>
          <p className="mt-3 text-slate-500 text-base">
            Three AI models. One steering report. Zero blind spots.
          </p>
        </div>

        {/* ── 4-Step Flow ───────────────────────────────────────── */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === STEPS.length - 1;
              return (
                <div key={step.step} className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 relative">
                  <div className="flex flex-col items-center md:w-full">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                      style={{ backgroundColor: NAVY }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {!isLast && (
                      <div
                        className="hidden md:block absolute top-8 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-0.5"
                        style={{ backgroundColor: GOLD, zIndex: 0 }}
                      />
                    )}

                    <div
                      className="mt-3 px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: GOLD, color: NAVY }}
                    >
                      Step {step.step}
                    </div>
                  </div>

                  <div className="md:text-center md:px-4 md:mt-3 flex-1">
                    <p className="font-bold text-sm mb-1" style={{ color: NAVY }}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {!isLast && (
                    <div className="md:hidden flex justify-center py-1 w-16 shrink-0">
                      <ArrowRight className="w-4 h-4 rotate-90" style={{ color: GOLD }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── How Items Get Routed ──────────────────────────────── */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
            How Items Get Routed
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Every checklist item gets exactly one routing decision, based on what the three models collectively found.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {ROUTING_LEVELS.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.label}
                  className="flex items-start gap-4 p-4 rounded-xl border"
                  style={{ borderColor: r.bg, backgroundColor: r.bg + "12" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: r.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: r.text }} />
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide mb-1"
                      style={{ backgroundColor: r.bg, color: r.text }}
                    >
                      {r.label}
                    </span>
                    <p className="text-sm text-slate-600 leading-snug">{r.meaning}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="rounded-xl border p-4 text-sm italic leading-relaxed"
            style={{ borderColor: GOLD + "60", backgroundColor: "#fffbea" }}
          >
            <span style={{ color: "#92670a" }}>
              "Colors belong to the system, not the models. Each model gives a plain-text risk rating.
              The system earns the right to use color because it represents the combined judgment of three independent reviewers."
            </span>
          </div>
        </div>

        {/* ── How Risk Is Rated ─────────────────────────────────── */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
            How Risk Is Rated
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Every model applies this rubric independently. If an item meets any single criterion of a higher tier, it is rated at the higher tier. When in doubt, rate up.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {RISK_RUBRIC.map((r) => (
              <div
                key={r.label}
                className="rounded-xl border p-5"
                style={{ backgroundColor: r.bg, borderColor: r.border }}
              >
                <p className="text-sm font-bold tracking-wide mb-3" style={{ color: r.headingColor }}>
                  {r.label}
                </p>
                <div className="space-y-2">
                  {r.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: r.headingColor }}
                      />
                      <p className="text-xs leading-snug" style={{ color: r.textColor }}>
                        {b}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500 leading-relaxed">
            Each model applies this same standard independently. The differences come from perspective, not criteria — like three reviewers reading the same contract with different instincts.
          </p>
        </div>

        {/* ── How Findings Become Actions ───────────────────────── */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
            How Findings Become Actions
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Two dimensions drive every routing decision: what the models found (severity) and whether they agree (consensus).
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-200 w-28">
                    Severity
                  </th>
                  <th className="p-3 text-center text-xs font-bold text-slate-700 border-b border-slate-200">
                    All 3 Agree
                  </th>
                  <th className="p-3 text-center text-xs font-bold text-slate-700 border-b border-slate-200">
                    2 of 3 Agree
                  </th>
                  <th className="p-3 text-center text-xs font-bold text-slate-700 border-b border-slate-200">
                    All Disagree
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-3 text-xs font-bold text-slate-600">Low Risk</td>
                  <MatrixCell cellKey="low-all" />
                  <MatrixCell cellKey="low-2of3" />
                  <MatrixCell cellKey="low-split" />
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 text-xs font-bold text-slate-600">Medium Risk</td>
                  <MatrixCell cellKey="med-all" />
                  <MatrixCell cellKey="med-2of3" />
                  <MatrixCell cellKey="med-split" />
                </tr>
                <tr>
                  <td className="p-3 text-xs font-bold text-slate-600">High Risk</td>
                  <MatrixCell cellKey="high-all" />
                  <MatrixCell cellKey="high-2of3" />
                  <MatrixCell cellKey="high-split" />
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-sm text-slate-600 leading-relaxed">
            When all three models flag the same high-risk issue, it goes straight to a senior reviewer. When they disagree on something minor, a quick check is enough. The matrix ensures nothing gets the wrong level of attention.
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            This matrix is fully customizable. Swap in your firm's own risk framework, adjust the thresholds per deal type, or add dimensions — the system adapts to however you classify risk, not the other way around.
          </p>
        </div>

        {/* ── Why Three Models? ─────────────────────────────────── */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
            Why Three Models?
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            The value of this system is not in any individual model's opinion — it's in what happens when they disagree.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-slate-400" />
                <h3 className="font-bold text-slate-700">The Problem with One Model</h3>
              </div>
              <div className="space-y-3">
                {ONE_MODEL_PROBLEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <p className="text-sm text-slate-600 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl border p-6"
              style={{ borderColor: GOLD + "80", backgroundColor: "#fffbea" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5" style={{ color: GOLD }} />
                <h3 className="font-bold" style={{ color: NAVY }}>The Advantage of Three</h3>
              </div>
              <div className="space-y-3">
                {THREE_MODEL_ADVANTAGES.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: GOLD }}
                    />
                    <p className="text-sm leading-snug" style={{ color: "#78570a" }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Honesty Block ─────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
            What This System Does — and Doesn't
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Transparency about scope is part of responsible AI use.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-800">What it does</h3>
              </div>
              <div className="space-y-3">
                {DOES.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-green-800 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-red-800">What it does NOT do</h3>
              </div>
              <div className="space-y-3">
                {DOES_NOT.map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-800 leading-snug">{item}</p>
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
