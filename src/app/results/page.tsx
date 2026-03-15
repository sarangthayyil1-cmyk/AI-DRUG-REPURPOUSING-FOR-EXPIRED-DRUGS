"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    apiKey: string;
  };
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
          apiKey={data.formData.apiKey}
        />

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
          <strong>Disclaimer:</strong> This tool provides heuristic estimates
          for research and educational purposes only. Results are not
          clinically validated and should not be used as the basis for
          medical decisions. Always consult a qualified pharmacist or
          physician before using any medication past its labeled expiry date.
        </div>

        {/* Future integration note */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
          <strong>Future enhancements:</strong> Integration with RDKit for
          molecular property calculations, Arrhenius kinetics for
          temperature-dependent degradation modeling, and ML-based stability
          prediction using historical pharmaceutical data.
        </div>
      </main>
    </div>
  );
}
