import Header from "@/components/layout/Header";
import AnalysisForm from "@/components/analyze/AnalysisForm";

/**
 * Main analysis page — renders the header and the drug analysis form.
 */
export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <AnalysisForm />
      </main>
    </div>
  );
}
