"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";
import { Clock, ArrowRight, Loader2, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SavedAnalysis {
  id: string;
  drug_name: string;
  created_at: string;
  result_data: any;
  input_data: any;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchHistory() {
      const { data: { session } } = await supabase.auth.getSession();
      
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
    // Reconstruct the stored format for the results page
    sessionStorage.setItem(
      "analysisResult",
      JSON.stringify({
        result: analysis.result_data,
        formData: {
          drugName: analysis.drug_name,
          smiles: analysis.input_data.smiles,
          formulation: analysis.input_data.formulation,
          stabilityClass: analysis.input_data.stabilityClass,
          apiKey: "", // User will need to re-enter if they want new AI discovery, or we could save it (encrypted)
        },
      })
    );
    router.push("/results");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Analysis History</h1>
            <p className="text-slate-400">View your previous drug stability reports</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-slate-500">Retrieving your records...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-900/20 border border-red-500 rounded-2xl text-red-200">
            <p className="font-bold">Error loading history</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700 border-dashed">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-slate-300">No analyses found</h2>
            <p className="text-slate-500 mb-6">Start by running your first stability analysis.</p>
            <Link 
              href="/analyze" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all"
            >
              Analyze a Drug
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {analyses.map((item) => (
              <div 
                key={item.id}
                className="group flex items-center justify-between p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer"
                onClick={() => viewResult(item)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    item.result_data.percentage >= 65 ? "bg-green-600/20 text-green-400" :
                    item.result_data.percentage >= 35 ? "bg-amber-600/20 text-amber-400" :
                    "bg-red-600/20 text-red-400"
                  }`}>
                    {item.result_data.percentage}%
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                      {item.drug_name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span>{item.input_data.formulation}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
