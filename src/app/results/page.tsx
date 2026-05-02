"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import StabilityResult from "@/components/results/StabilityResult";
import FactorBreakdown from "@/components/results/FactorBreakdown";
import DiscoverySuggestions from "@/components/results/DiscoverySuggestions";
import type { StabilityResult as StabilityResultType } from "@/lib/stability/types";

/** Shape of data stored in sessionStorage after analysis */
interface StoredAnalysis {
  result: StabilityResultType;
  formData: {
    drugName: string;
    smiles: string;
    formulation: string;
    stabilityClass: number;
  };
  saveStatus?: "saved" | "skipped" | "failed";
  saveWarning?: string | null;
}

/**
 * Results page — displays stability analysis results and
 * optional AI-powered drug discovery suggestions.
 *
 * Reads data from sessionStorage (set by the analysis form).
 * Redirects back to /analyze if no data is found.
 */
export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredAnalysis | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (!stored) {
      router.replace("/analyze");
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch {
      router.replace("/analyze");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen bg-cream">
        <Header />
        <div className="flex items-center justify-center py-20 text-gray-400">
          Loading results...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/analyze")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </button>

        {/* Page title */}
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Analysis{" "}
            <span className="text-brand">Results</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Stability estimation and drug discovery insights
          </p>
        </div>

        {/* Save status banner */}
        {data.saveStatus === "saved" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-xl text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Saved to your history.
          </div>
        )}
        {data.saveStatus === "failed" && data.saveWarning && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>{data.saveWarning}</strong>
              <p className="text-amber-700/80 mt-1">
                The analysis ran successfully, but it could not be saved to
                your history. Open the browser console for details, or run the
                Supabase setup SQL to make sure the <code>profiles</code> and{" "}
                <code>analyses</code> tables (and the{" "}
                <code>handle_new_user</code> trigger) are in place.
              </p>
            </div>
          </div>
        )}

        {/* Stability result card with gauge */}
        <StabilityResult
          result={data.result}
          drugName={data.formData.drugName}
        />

        {/* Factor breakdown table */}
        <FactorBreakdown factors={data.result.factors} />

        {/* AI Discovery suggestions */}
        <DiscoverySuggestions
          drugName={data.formData.drugName}
          smiles={data.formData.smiles}
          stabilityResult={data.result}
        />

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This tool provides heuristic estimates
          for research and educational purposes only. Results are not
          clinically validated and should not be used as the basis for
          medical decisions. Always consult a qualified pharmacist or
          physician before using any medication past its labeled expiry date.
        </div>
      </main>
    </div>
  );
}
