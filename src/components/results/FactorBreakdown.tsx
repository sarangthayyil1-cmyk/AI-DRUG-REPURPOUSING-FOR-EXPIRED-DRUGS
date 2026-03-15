"use client";

import type { StabilityFactor } from "@/lib/stability/types";

interface FactorBreakdownProps {
  factors: StabilityFactor[];
}

/**
 * Table showing each degradation factor, its impact, and description.
 * Positive impacts are green (stability bonus), negative are red (degradation).
 */
export default function FactorBreakdown({ factors }: FactorBreakdownProps) {
  return (
    <div className="card-section">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Factor Breakdown
      </h3>
      <div className="space-y-3">
        {factors.map((factor, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-3 rounded-lg bg-gray-50"
          >
            {/* Impact indicator */}
            <div className="shrink-0 mt-0.5">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  factor.impact > 0
                    ? "bg-green-100 text-green-700"
                    : factor.impact === 0
                      ? "bg-gray-100 text-gray-500"
                      : factor.impact > -15
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                }`}
              >
                {factor.impact > 0 ? "+" : ""}
                {factor.impact}
              </div>
            </div>

            {/* Factor details */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm">
                {factor.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {factor.description}
              </div>
            </div>

            {/* Impact bar */}
            <div className="w-24 shrink-0 pt-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    factor.impact > 0
                      ? "bg-green-500"
                      : factor.impact === 0
                        ? "bg-gray-300"
                        : factor.impact > -15
                          ? "bg-amber-500"
                          : "bg-red-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.abs(factor.impact) * 2)}%`,
                    marginLeft: factor.impact > 0 ? "50%" : undefined,
                    marginRight: factor.impact <= 0 ? "auto" : undefined,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
