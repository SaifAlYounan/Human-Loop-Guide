import { useState } from "react";
import { useListDocuments, useGetDocument } from "@workspace/api-client-react";
import { FileText, Search, X, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  A: "bg-slate-100 text-slate-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-purple-100 text-purple-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-teal-100 text-teal-700",
  F: "bg-green-100 text-green-700",
  G: "bg-red-100 text-red-700",
  H: "bg-pink-100 text-pink-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  A: "Corporate & Foundational",
  B: "Financial",
  C: "Property & Lease",
  D: "Employment & HR",
  E: "Operational",
  F: "Regulatory & Compliance",
  G: "Legal",
  H: "Customer & Market",
};

function DocumentViewer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading, error } = useGetDocument(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              {data && (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-mono font-semibold",
                        CATEGORY_COLORS[data.categoryCode] ?? "bg-slate-100 text-slate-700"
                      )}
                    >
                      {data.id}
                    </span>
                    <span className="text-xs text-slate-500">{data.category}</span>
                  </div>
                  <h2 className="text-base font-semibold text-slate-800 mt-0.5">{data.title}</h2>
                </>
              )}
              {isLoading && <p className="text-slate-500">Loading document...</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
          {error && (
            <p className="text-red-600">Failed to load document.</p>
          )}
          {data && (
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
              {data.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { data: docs, isLoading } = useListDocuments();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewDocId, setViewDocId] = useState<string | null>(null);

  const filtered = docs?.filter((doc) => {
    const matchesSearch =
      !search ||
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || doc.categoryCode === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = filtered?.reduce<Record<string, typeof filtered>>((acc, doc) => {
    const key = doc.categoryCode;
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-slate-400" />
            <span className="text-slate-500 text-sm">Data Room</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">62 Documents</h1>
          <p className="text-slate-500 text-sm mt-1">
            All documents indexed from the Olive & Thyme LLC due diligence data room
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                !selectedCategory
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              All
            </button>
            {Object.entries(CATEGORY_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setSelectedCategory(selectedCategory === code ? null : code)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  selectedCategory === code
                    ? CATEGORY_COLORS[code] + " ring-1 ring-current"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {code} · {label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {grouped && (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([categoryCode, categoryDocs]) => (
                <div key={categoryCode}>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold",
                        CATEGORY_COLORS[categoryCode] ?? "bg-slate-100 text-slate-700"
                      )}
                    >
                      {categoryCode}
                    </span>
                    <h2 className="text-sm font-semibold text-slate-700">
                      {CATEGORY_LABELS[categoryCode] ?? "Other"}
                    </h2>
                    <span className="text-xs text-slate-400">
                      ({categoryDocs?.length ?? 0} documents)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryDocs?.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setViewDocId(doc.id)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white text-left hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0",
                            CATEGORY_COLORS[categoryCode] ?? "bg-slate-100 text-slate-700"
                          )}
                        >
                          {doc.id.split("-")[1]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-slate-400">{doc.id}</p>
                          <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                            {doc.title}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {filtered?.length === 0 && !isLoading && (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No documents match your search.</p>
          </div>
        )}
      </div>

      {viewDocId && (
        <DocumentViewer id={viewDocId} onClose={() => setViewDocId(null)} />
      )}
    </div>
  );
}
