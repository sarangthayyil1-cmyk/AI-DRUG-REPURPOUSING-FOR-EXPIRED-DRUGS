"use client";

import type { StabilityVerdict } from "@/lib/stability/types";

interface ProbabilityGaugeProps {
  probability: number;
  verdict: StabilityVerdict;
}

/**
 * Semi-circular gauge that displays the stability probability.
 * Color-coded by verdict: green (active), amber (degraded), red (inactive).
 */
export default function ProbabilityGauge({
  probability,
  verdict,
}: ProbabilityGaugeProps) {
  // SVG arc calculation for a semi-circle gauge
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const progress = (probability / 100) * circumference;

  // Color mapping based on verdict
  const colorMap = {
    likely_active: { stroke: "#22C55E", bg: "#DCFCE7", text: "#166534" },
    possibly_degraded: { stroke: "#F59E0B", bg: "#FEF3C7", text: "#92400E" },
    likely_inactive: { stroke: "#EF4444", bg: "#FEE2E2", text: "#991B1B" },
  };
  const colors = colorMap[verdict];

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-56 h-32">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
        />
        {/* Percentage text */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          className="text-3xl font-black"
          fill={colors.text}
        >
          {probability}%
        </text>
        <text
          x="100"
          y="110"
          textAnchor="middle"
          className="text-xs"
          fill="#6B7280"
        >
          Activity Probability
        </text>
      </svg>
    </div>
  );
}
