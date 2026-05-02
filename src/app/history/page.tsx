"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Database, Loader2, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";

interface SavedAnalysis {
  id: string;
  drug_name: string;
  smiles: string | null;
  created_at: string;
  result_data: any;
  input_data: any;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedAnalysis | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error: dbError } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbError) {
        setError(dbError.message);
      } else {
        setAnalyses(data || []);
      }
      setLoading(false);
    }

    fetchHistory();
  }, [router]);

  const viewResult = (analysis: SavedAnalysis) => {
    sessionStorage.setItem(
      "analysisResult",
      JSON.stringify({
        result: analysis.result_data,
        formData: {
          drugName: analysis.drug_name,
          smiles: analysis.smiles ?? analysis.input_data?.smiles ?? "",
          formulation: analysis.input_data?.formulation ?? "",
          stabilityClass: analysis.input_data?.stabilityClass ?? 3,
        },
      })
    );
    router.push("/results");
  };

  const requestDelete = (e: React.MouseEvent, item: SavedAnalysis) => {
    e.stopPropagation();
    setPendingDelete(item);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setDeletingId(id);

    const { error: delError } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id);

    if (delError) {
      alert(`Could not delete: ${delError.message}`);
    } else {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    }

    setDeletingId(null);
    setPendingDelete(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-brand-light rounded-xl">
            <Clock className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Analysis <span className="text-brand">History</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Your previous drug stability reports.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-brand" />
            <p className="text-gray-400 text-sm">Retrieving your records...</p>
          </div>
        ) : error ? (
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700">
            <p className="font-bold">Error loading history</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-1 text-gray-700">
              No analyses yet
            </h2>
            <p className="text-gray-500 mb-6">
              Run your first stability analysis to see it here.
            </p>
            <Link
              href="/analyze"
              className="inline-block px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold transition-colors"
            >
              Analyze a Drug
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {analyses.map((item) => {
              const pct = Math.round(
                item.result_data?.probability ?? item.result_data?.percentage ?? 0
              );
              return (
                <div
                  key={item.id}
                  onClick={() => viewResult(item)}
                  className="group flex items-center justify-between p-5 bg-white hover:border-brand border border-gray-100 rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base ${
                        pct >= 65
                          ? "bg-green-50 text-green-700"
                          : pct >= 35
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      {pct}%
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand transition-colors">
                        {item.drug_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>
                          {new Date(item.created_at).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </span>
                        {item.input_data?.formulation && (
                          <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span className="capitalize">
                              {item.input_data.formulation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => requestDelete(e, item)}
                      disabled={deletingId === item.id}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Delete analysis"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {pendingDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => deletingId !== pendingDelete.id && setPendingDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPendingDelete(null)}
              disabled={deletingId === pendingDelete.id}
              className="absolute top-3 right-3 text-gray-300 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Delete this analysis?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-700">
                {pendingDelete.drug_name}
              </span>{" "}
              will be permanently removed from your history. This can&apos;t
              be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deletingId === pendingDelete.id}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === pendingDelete.id}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deletingId === pendingDelete.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
