"use client";

import DrugAutocomplete from "./DrugAutocomplete";
import type { WHODrug, FormulationType } from "@/lib/stability/types";

interface DrugIdentificationProps {
  drugName: string;
  smiles: string;
  formulation: FormulationType | "";
  manufacturer: string;
  strength: string;
  onDrugNameChange: (value: string) => void;
  onDrugSelect: (drug: WHODrug) => void;
  onSmilesChange: (value: string) => void;
  onFormulationChange: (value: FormulationType | "") => void;
  onManufacturerChange: (value: string) => void;
  onStrengthChange: (value: string) => void;
}

const FORMULATION_OPTIONS: { value: FormulationType; label: string }[] = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "liquid", label: "Liquid / Suspension" },
  { value: "injectable", label: "Injectable" },
  { value: "topical", label: "Topical (Cream/Ointment)" },
  { value: "inhaler", label: "Inhaler" },
  { value: "patch", label: "Transdermal Patch" },
  { value: "suppository", label: "Suppository" },
];

/**
 * Section 01: Drug Identification
 * Contains drug name autocomplete, SMILES string, formulation,
 * manufacturer, and strength fields.
 */
export default function DrugIdentification({
  drugName,
  smiles,
  formulation,
  manufacturer,
  strength,
  onDrugNameChange,
  onDrugSelect,
  onSmilesChange,
  onFormulationChange,
  onManufacturerChange,
  onStrengthChange,
}: DrugIdentificationProps) {
  return (
    <div className="card-section space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="section-badge">01</span>
        <h2 className="text-lg font-bold text-gray-900">Drug Identification</h2>
      </div>

      {/* Drug name + Formulation row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DrugAutocomplete
          value={drugName}
          onChange={onDrugNameChange}
          onSelect={onDrugSelect}
        />
        <div>
          <label className="form-label">Formulation</label>
          <select
            value={formulation}
            onChange={(e) =>
              onFormulationChange(e.target.value as FormulationType | "")
            }
            className="form-select mt-1"
          >
            <option value="">Select formulation...</option>
            {FORMULATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Manufacturer + SMILES row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="form-label">
            Manufacturer <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={manufacturer}
            onChange={(e) => onManufacturerChange(e.target.value)}
            placeholder="e.g. Pfizer, GSK, Novartis..."
            className="form-input mt-1"
          />
        </div>
        <div>
          <label className="form-label">
            SMILES String{" "}
            <span className="text-gray-400">(auto-fills from drug name)</span>
          </label>
          <input
            type="text"
            value={smiles}
            onChange={(e) => onSmilesChange(e.target.value)}
            placeholder="Type drug name above to auto-fill..."
            className="form-input mt-1 font-mono text-sm"
          />
        </div>
      </div>

      {/* Strength row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="form-label">
            Strength / Dose <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={strength}
            onChange={(e) => onStrengthChange(e.target.value)}
            placeholder="e.g. 500 mg, 5 mg/ml, 0.5%, 10 mg/5 ml"
            className="form-input mt-1"
          />
        </div>
        <div className="flex items-end">
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter the strength as printed on the label — any unit is accepted
            (mg, g, ml, %, IU, mcg...). This helps the AI give dose-specific
            degradation advice.
          </p>
        </div>
      </div>
    </div>
  );
}
