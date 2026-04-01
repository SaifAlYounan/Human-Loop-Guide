import { useGetCachedReport } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  FileText,
  CheckSquare,
  Brain,
  FileBarChart2,
  AlertTriangle,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Scale,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEAL_FACTS = [
  { label: "Target", value: "Olive & Thyme LLC" },
  { label: "Location", value: "1847 S Congress Ave, Austin TX" },
  { label: "Founded", value: "March 2022" },
  { label: "FY2025 Revenue", value: "$1,210,000" },
  { label: "FY2025 EBITDA", value: "$133,000 (11.0%)" },
  { label: "Asking Price", value: "$850,000 (~6.4× EBITDA)" },
  { label: "Ownership", value: "Maria Konstantinou (60%) / James Park (40%)" },
  { label: "Cuisine Type", value: "Upscale Casual Mediterranean" },
  { label: "Seating", value: "65 indoor + 8 patio" },
  { label: "Avg Check", value: "$52/person (dinner)" },
];

const KEY_FLAGS = [
  {
    severity: "red",
    title: "No Lease Renewal Option",
    detail: "Lease expires February 2032. No option to renew. Landlord has no obligation to offer new terms.",
    docs: ["C-28", "C-34"],
  },
  {
    severity: "red",
    title: "Chef At-Will — No Non-Compete",
    detail: "Dimitri Alexandros is at-will with no non-compete, non-solicitation, or IP assignment. Can leave with 2 weeks notice.",
    docs: ["D-36", "D-39"],
  },
  {
    severity: "amber",
    title: "Maria K Catering — Related Party Discrepancy",
    detail: "B-27 says no company staff used. A-09 says Maria 'sometimes uses restaurant staff.' Unquantified financial impact.",
    docs: ["B-27", "A-09"],
  },
  {
    severity: "amber",
    title: "Supplier Concentration (45%)",
    detail: "Hill Country Provisions supplies 45% of all food inputs. Exclusive source for Fredericksburg Ranch lamb. Month-to-month contract.",
    docs: ["E-46", "E-45"],
  },
  {
    severity: "amber",
    title: "Delivery Margin Compression",
    detail: "Delivery platforms at 25-30% commission now account for 23% of revenue. Commissions classified as OpEx, not COGS.",
    docs: ["E-48", "B-25"],
  },
  {
    severity: "amber",
    title: "No Federal Trademark",
    detail: "Brand has only common-law protection. California 'Olive & Thyme' bakery creates potential conflict. Domain owned by Maria personally.",
    docs: ["G-61", "E-51"],
  },
];

const QUICK_LINKS = [
  { href: "/documents", icon: FileText, label: "Browse 62 Documents", color: "bg-blue-50 text-blue-700" },
  { href: "/checklist", icon: CheckSquare, label: "View 42-Item Checklist", color: "bg-purple-50 text-purple-700" },
  { href: "/analysis", icon: Brain, label: "Run AI Analysis", color: "bg-amber-50 text-amber-700" },
  { href: "/report", icon: FileBarChart2, label: "Steering Report", color: "bg-green-50 text-green-700" },
];

export default function DashboardPage() {
  const { data: cachedData } = useGetCachedReport();

  const hasReport = cachedData?.hasCache;
  const report = cachedData?.report;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            <span className="text-slate-500 text-sm">Acquisition Target</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Olive & Thyme LLC
          </h1>
          <p className="text-slate-600 mt-1">
            Human-in-the-Loop Due Diligence · Multi-Model AI Review Triage · M&A Guidance System
          </p>
        </div>

        {hasReport && report && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileBarChart2 className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Latest Steering Report</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Available
                </span>
              </div>
              <Link href="/report" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Report <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Consensus", sub: "all 3 models agree",   count: report.executiveSummary.consensusCount, bg: "#1B2A4A", fg: "#ffffff" },
                { label: "Majority",  sub: "2 of 3 models agree",  count: report.executiveSummary.majorityCount,  bg: "#FFC72C", fg: "#1B2A4A" },
                { label: "Split",     sub: "no consensus",          count: report.executiveSummary.splitCount,     bg: "#E8614D", fg: "#ffffff" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border p-3 text-center" style={{ backgroundColor: s.bg, borderColor: s.bg }}>
                  <p className="text-2xl font-bold" style={{ color: s.fg }}>{s.count}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: s.fg }}>{s.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: s.fg, opacity: 0.75 }}>{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                Agreement level:{" "}
                <span className={cn("font-semibold", {
                  "text-green-700": report.executiveSummary.overallRisk === "LOW",
                  "text-amber-700": report.executiveSummary.overallRisk === "MODERATE",
                  "text-red-700": report.executiveSummary.overallRisk === "ELEVATED",
                })}>
                  {report.executiveSummary.overallRisk === "LOW" ? "High" : report.executiveSummary.overallRisk === "MODERATE" ? "Mixed" : "Low"}
                </span>
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Deal Snapshot
            </h2>
            <dl className="space-y-2.5">
              {DEAL_FACTS.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-2 text-sm">
                  <dt className="text-slate-500 shrink-0">{fact.label}</dt>
                  <dd className="text-slate-800 font-medium text-right">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Key Risk Flags — Pre-Analysis
            </h2>
            <div className="space-y-3">
              {KEY_FLAGS.map((flag) => (
                <div
                  key={flag.title}
                  className={cn(
                    "rounded-xl border p-4 shadow-sm",
                    flag.severity === "red"
                      ? "border-red-200 bg-red-50"
                      : "border-amber-200 bg-amber-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={cn(
                        "w-4 h-4 shrink-0 mt-0.5",
                        flag.severity === "red" ? "text-red-500" : "text-amber-500"
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            flag.severity === "red" ? "text-red-800" : "text-amber-800"
                          )}
                        >
                          {flag.title}
                        </h3>
                        <div className="flex gap-1">
                          {flag.docs.map((d) => (
                            <span
                              key={d}
                              className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-mono",
                                flag.severity === "red"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          flag.severity === "red" ? "text-red-700" : "text-amber-700"
                        )}
                      >
                        {flag.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={cn("p-2 rounded-lg", link.color)}>
                <link.icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                {link.label}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Revenue Trend</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { year: "FY2023", revenue: "$980K", ebitda: "$88K (9.0%)", color: "bg-blue-50 border-blue-200" },
              { year: "FY2024", revenue: "$1,105K", ebitda: "$110K (10.0%)", color: "bg-blue-50 border-blue-200" },
              { year: "FY2025", revenue: "$1,210K", ebitda: "$133K (11.0%)", color: "bg-blue-100 border-blue-300" },
              { year: "Q1 2026", revenue: "$320K", ebitda: "~$33K (10.3%)", color: "bg-green-50 border-green-200" },
            ].map((item) => (
              <div key={item.year} className={cn("rounded-lg border p-4", item.color)}>
                <p className="text-xs text-slate-500 font-medium">{item.year}</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{item.revenue}</p>
                <p className="text-xs text-slate-600 mt-0.5">EBITDA: {item.ebitda}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              15 employees · 2 H-2B visa workers
            </span>
            <span>·</span>
            <span>2,800 loyalty members</span>
            <span>·</span>
            <span>4.4★ Google (380 reviews)</span>
            <span>·</span>
            <span>62 data room documents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
