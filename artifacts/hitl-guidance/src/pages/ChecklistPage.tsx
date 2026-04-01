import { useGetChecklist } from "@workspace/api-client-react";
import { CheckSquare, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const DIMENSION_COLORS: Record<string, string> = {
  I: "bg-blue-600",
  II: "bg-purple-600",
  III: "bg-orange-500",
  IV: "bg-teal-600",
  V: "bg-pink-600",
  VI: "bg-slate-700",
};

const DIMENSION_LIGHT: Record<string, string> = {
  I: "bg-blue-50 border-blue-200",
  II: "bg-purple-50 border-purple-200",
  III: "bg-orange-50 border-orange-200",
  IV: "bg-teal-50 border-teal-200",
  V: "bg-pink-50 border-pink-200",
  VI: "bg-slate-50 border-slate-200",
};

export default function ChecklistPage() {
  const { data: checklist, isLoading } = useGetChecklist();

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-5 h-5 text-slate-400" />
            <span className="text-slate-500 text-sm">Due Diligence Framework</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">42-Item Checklist</h1>
          <p className="text-slate-500 text-sm mt-1">
            Six dimensions assessed independently by all three AI analysts
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {checklist?.map((dim) => (
            <a
              key={dim.code}
              href={`#dim-${dim.code}`}
              className={cn(
                "rounded-xl border p-4 transition-colors hover:shadow-md",
                DIMENSION_LIGHT[dim.code] ?? "bg-slate-50 border-slate-200"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold mb-2",
                  DIMENSION_COLORS[dim.code] ?? "bg-slate-600"
                )}
              >
                {dim.code}
              </div>
              <p className="text-sm font-semibold text-slate-800">{dim.dimension}</p>
              <p className="text-xs text-slate-500 mt-1">{dim.items.length} items</p>
            </a>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {checklist && (
          <div className="space-y-8">
            {checklist.map((dim) => (
              <div key={dim.code} id={`dim-${dim.code}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0",
                      DIMENSION_COLORS[dim.code] ?? "bg-slate-600"
                    )}
                  >
                    {dim.code}
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">{dim.dimension}</h2>
                  <span className="text-sm text-slate-400">{dim.items.length} items</span>
                </div>

                <div className="space-y-2">
                  {dim.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border bg-white",
                        DIMENSION_LIGHT[dim.code] ?? "border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-400 text-xs font-mono w-4 text-right">
                          {item.id}
                        </span>
                        <CheckSquare
                          className={cn("w-4 h-4 shrink-0", {
                            "text-blue-400": dim.code === "I",
                            "text-purple-400": dim.code === "II",
                            "text-orange-400": dim.code === "III",
                            "text-teal-400": dim.code === "IV",
                            "text-pink-400": dim.code === "V",
                            "text-slate-400": dim.code === "VI",
                          })}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800">{item.question}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Docs:
                          </span>
                          {item.relevantDocuments.map((docId) => (
                            <span
                              key={docId}
                              className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600"
                            >
                              {docId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
