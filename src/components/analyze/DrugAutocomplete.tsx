"use client";

import { useState, useRef, useEffect } from "react";
import { useDrugSearch } from "@/hooks/useDrugSearch";
import type { WHODrug } from "@/lib/stability/types";

interface DrugAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (drug: WHODrug) => void;
}

/**
 * Drug name autocomplete input.
 * Searches the WHO drug dataset as the user types and shows
 * a dropdown of matching drugs. Selecting a drug triggers
 * auto-fill of SMILES and other fields via onSelect.
 */
export default function DrugAutocomplete({
  value,
  onChange,
  onSelect,
}: DrugAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const results = useDrugSearch(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="form-label">
        Drug Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => value.length > 0 && setIsOpen(true)}
        placeholder="e.g. Amoxicillin"
        className="form-input mt-1"
        autoComplete="off"
      />

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {results.map((drug, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect(drug);
                onChange(drug.name);
                setIsOpen(false);
              }}
              className="px-4 py-3 cursor-pointer hover:bg-brand-light transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="font-medium text-gray-900 text-sm">
                {drug.name}
                {drug.synonyms && drug.synonyms.length > 0 && (
                  <span className="text-gray-400 text-xs ml-2 font-normal">
                    (e.g., {drug.synonyms.join(", ")})
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {drug.category} · Class {drug.defaultStabilityClass}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
