"use client";

import { ShieldCheck, AlertTriangle, ShieldX } from "lucide-react";
import ProbabilityGauge from "./ProbabilityGauge";
import type { StabilityResult as StabilityResultType } from "@/lib/stability/types";

interface StabilityResultProps {
  result: StabilityResultType;
  drugName: string;
}

/**
 * Main result card showing the verdict, probability gauge,
 * and summary text. Color-coded by verdict.
 */
export default function StabilityResult({
  result,
  drugName,
}: StabilityResultProps) {
  const verdictConfig = {
    likely_active: {
      label: "Likely Active",
      icon: ShieldCheck,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      badgeColor: "bg-green-100 text-green-800",
    },
    possibly_degraded: {
      label: "Possibly Degraded",
      icon: AlertTriangle,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-800",
      badgeColor: "bg-amber-100 text-amber-800",
    },
    likely_inactive: {
      label: "Likely Inactive",
      icon: ShieldX,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      badgeColor: "bg-red-100 text-red-800",
    },
  };

  const config = verdictConfig[result.verdict];
  const Icon = config.icon;

  return (
    <div
      className={`card-section ${config.bgColor} border ${config.borderColor}`}
    >
      {/* Verdict header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Stability Analysis Result
          </h2>
          <h3 className="text-2xl font-black text-gray-900 mt-1">
            {drugName}
          </h3>
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${config.badgeColor}`}
        >
          <Icon className="w-5 h-5" />
          {config.label}
        </div>
      </div>

      {/* Gauge */}
      <ProbabilityGauge
        probability={result.probability}
        verdict={result.verdict}
      />

      {/* Summary */}
      <p className="text-sm text-gray-600 leading-relaxed mt-4">
        {result.summary}
      </p>

      {/* Risk level badge */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Risk Level:
        </span>
        <span
          className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
            result.riskLevel === "low"
              ? "bg-green-100 text-green-700"
              : result.riskLevel === "medium"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {result.riskLevel}
        </span>
      </div>
    </div>
  );
}
