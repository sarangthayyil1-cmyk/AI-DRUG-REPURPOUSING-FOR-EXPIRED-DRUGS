"use client";

import type { StabilityClass } from "@/lib/stability/types";

interface StabilityClassSelectorProps {
  value: StabilityClass | 0;
  onChange: (value: StabilityClass | 0) => void;
}

const CLASSES: { value: StabilityClass | 0; label: string }[] = [
  { value: 0, label: "Unknown" },
  { value: 1, label: "Very Stable" },
  { value: 2, label: "Stable" },
  { value: 3, label: "Moderately Stable" },
  { value: 4, label: "Unstable" },
  { value: 5, label: "Highly Unstable" },
];

/**
 * Section 02: Stability Class
 * Toggle buttons for selecting the known stability class of the drug.
 * Matches the pill-shaped button group from the design screenshots.
 */
export default function StabilityClassSelector({
  value,
  onChange,
}: StabilityClassSelectorProps) {
  return (
    <div className="card-section">
      <div className="flex items-center gap-3 mb-4">
        <span className="section-badge">02</span>
        <h2 className="text-lg font-bold text-gray-900">Stability Class</h2>
      </div>

      <p className="form-label mb-3">
        Select the known stability class of this drug
      </p>

      <div className="flex flex-wrap gap-2">
        {CLASSES.map((cls) => (
          <button
            key={cls.value}
            type="button"
            onClick={() => onChange(cls.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                value === cls.value
                  ? "bg-brand text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-brand hover:text-brand"
              }
            `}
          >
            {cls.label}
          </button>
        ))}
      </div>
    </div>
  );
}
