import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Brain,
  FileBarChart2,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/documents", icon: FileText, label: "Data Room (62 Docs)" },
  { href: "/checklist", icon: CheckSquare, label: "DD Checklist (42)" },
  { href: "/analysis", icon: Brain, label: "Run AI Analysis" },
  { href: "/report", icon: FileBarChart2, label: "Steering Report" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="w-full bg-red-600 text-black text-center text-xs font-bold py-1.5 tracking-widest uppercase z-50 shrink-0">
        PROTOTYPE — VERSION 0 — FOR PROOF OF CONCEPT
      </div>
      <div className="flex flex-1 relative">
      <aside
        className="fixed left-0 top-[32px] bottom-0 w-72 flex flex-col z-30 overflow-y-auto"
        style={{ backgroundColor: "#1a3a5c" }}
      >
        <div className="px-6 py-7 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: "#2a5a8c" }}
            >
              H
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">
                HITL Guidance
              </h1>
              <p className="text-blue-200 text-xs opacity-70">M&A Due Diligence</p>
            </div>
          </div>
          <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-blue-100 text-xs font-medium leading-tight">
              Olive & Thyme LLC
            </p>
            <p className="text-blue-300 text-xs opacity-70 mt-0.5">
              1847 S Congress Ave · Austin TX
            </p>
            <p className="text-blue-300 text-xs opacity-70">
              Ask: $850,000 · ~6.4× EBITDA
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? location === "/"
                : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  active
                    ? "bg-white/15 text-white"
                    : "text-blue-200 hover:text-white"
                )}
                style={!active ? { backgroundColor: "transparent" } : undefined}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-white" : "text-blue-300 group-hover:text-white"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <p className="text-blue-200 text-xs font-medium">AI Models</p>
            <div className="mt-2 space-y-1.5">
              {[
                { label: "GPT-5.2",           color: "#60a5fa" },
                { label: "Claude Sonnet 4.6",  color: "#fb923c" },
                { label: "Gemini 2.5 Pro",     color: "#4ade80" },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-blue-300 text-xs">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-72 flex-1 min-h-screen">
        {children}
      </main>
      </div>
    </div>
  );
}
