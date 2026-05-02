"use client";

import { useState } from "react";
import {
  Loader2,
  Beaker,
  PenTool,
  Pill,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type {
  DiscoveryResponse,
  DiscoverySuggestion,
  StabilityResult,
} from "@/lib/stability/types";

interface DiscoverySuggestionsProps {
  drugName: string;
  smiles: string;
  stabilityResult: StabilityResult;
}

type TabKey = "analogs" | "modifications" | "relatedDrugs" | "repurposing";

const TABS: { key: TabKey; label: string; icon: typeof Beaker }[] = [
  { key: "analogs", label: "Analog Compounds", icon: Beaker },
  { key: "modifications", label: "Modifications", icon: PenTool },
  { key: "relatedDrugs", label: "Related Drugs", icon: Pill },
  { key: "repurposing", label: "Repurposing", icon: RefreshCw },
];

/**
 * AI-powered drug discovery suggestions panel.
 * Calls the auth-gated /api/discover endpoint and displays Claude's
 * suggestions in tabbed categories.
 */
export default function DiscoverySuggestions({
  drugName,
  smiles,
  stabilityResult,
}: DiscoverySuggestionsProps) {
  const [discovery, setDiscovery] = useState<DiscoveryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("analogs");

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugName, smiles, stabilityResult }),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        throw new Error(
          `Too many AI requests. Try again in ${retryAfter ?? "a few"} seconds.`
        );
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate suggestions");
      }

      const data: DiscoveryResponse = await res.json();
      setDiscovery(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Render a single suggestion card
  const renderSuggestion = (item: DiscoverySuggestion, i: number) => (
    <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">{item.name}</h4>
        <span
          className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
            item.confidence === "high"
              ? "bg-green-100 text-green-700"
              : item.confidence === "medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {item.confidence}
        </span>
      </div>
      <p className="text-sm text-gray-600">{item.description}</p>
      <p className="text-xs text-gray-500 italic">{item.rationale}</p>
      {item.smiles && (
        <p className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded">
          SMILES: {item.smiles}
        </p>
      )}
    </div>
  );

  return (
    <div className="card-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand" />
          AI Drug Discovery Suggestions
        </h3>
        {!discovery && !isLoading && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Suggestions
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Generating AI-powered suggestions...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
          <button
            onClick={handleGenerate}
            className="ml-2 underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results with tabs */}
      {discovery && (
        <div>
          {/* Tab bar */}
          <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
            {TABS.map(({ key, label, icon: TabIcon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {label}
                <span className="text-xs text-gray-400 ml-1">
                  ({discovery[key]?.length || 0})
                </span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="space-y-3">
            {discovery[activeTab]?.length > 0 ? (
              discovery[activeTab].map(renderSuggestion)
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                No suggestions available for this category.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
