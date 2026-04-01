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
                  {/* Step box */}
                  <div className="flex flex-col items-center md:w-full">
                    {/* Icon circle */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                      style={{ backgroundColor: NAVY }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Connector line (desktop) */}
                    {!isLast && (
                      <div
                        className="hidden md:block absolute top-8 left-[calc(50%+32px)] right-[calc(-50%+32px)] h-0.5"
                        style={{ backgroundColor: GOLD, zIndex: 0 }}
                      />
                    )}

                    {/* Step number pill */}
                    <div
                      className="mt-3 px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: GOLD, color: NAVY }}
                    >
                      Step {step.step}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="md:text-center md:px-4 md:mt-3 flex-1">
                    <p className="font-bold text-sm mb-1" style={{ color: NAVY }}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector (mobile) */}
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

        {/* ── Routing Matrix ────────────────────────────────────── */}
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

        {/* ── Why Three Models? ─────────────────────────────────── */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>
            Why Three Models?
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            The value of this system is not in any individual model's opinion — it's in what happens when they disagree.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left */}
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

            {/* Right */}
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
