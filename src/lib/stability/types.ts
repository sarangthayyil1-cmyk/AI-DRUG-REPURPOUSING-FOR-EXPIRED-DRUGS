// ── Core types for the stability analysis system ──

/** Drug dosage formulation types */
export type FormulationType =
  | "tablet"
  | "capsule"
  | "liquid"
  | "injectable"
  | "topical"
  | "inhaler"
  | "patch"
  | "suppository";

/** Stability class: 1 = Very Stable, 5 = Highly Unstable */
export type StabilityClass = 1 | 2 | 3 | 4 | 5;

/** Human-readable labels for stability classes */
export const STABILITY_CLASS_LABELS: Record<StabilityClass, string> = {
  1: "Very Stable",
  2: "Stable",
  3: "Moderately Stable",
  4: "Unstable",
  5: "Highly Unstable",
};

/** Light exposure levels */
export type LightExposure = "none" | "indirect" | "direct";

/** Container integrity states */
export type ContainerIntegrity = "sealed" | "opened" | "damaged";

/** Input to the stability estimation algorithm */
export interface StabilityInput {
  drugName: string;
  smiles: string;
  stabilityClass: StabilityClass;
  formulation: FormulationType;
  expiryDate: string; // ISO date string
  manufacturingDate?: string; // ISO date string, optional
  storageTemp: number; // Celsius, range -20 to 60
  storageHumidity: number; // 0-100 %RH
  lightExposure: LightExposure;
  containerIntegrity: ContainerIntegrity;
  strength?: string; // e.g. "500 mg"
  manufacturer?: string;
  notes?: string;
}

/** Verdict categories for stability analysis */
export type StabilityVerdict =
  | "likely_active"
  | "possibly_degraded"
  | "likely_inactive";

/** Individual factor contributing to the stability score */
export interface StabilityFactor {
  name: string;
  impact: number; // -100 to +100 (negative = reduces stability)
  description: string;
}

/** Complete result from the stability analysis */
export interface StabilityResult {
  verdict: StabilityVerdict;
  probability: number; // 0-100, probability of being still active
  factors: StabilityFactor[];
  riskLevel: "low" | "medium" | "high";
  summary: string;
  monthsSinceExpiry: number;
}

/** Drug entry in the WHO/EMA dataset */
export interface WHODrug {
  name: string;
  synonyms?: string[];
  smiles: string;
  category: string;
  defaultStabilityClass: StabilityClass;
  commonFormulations: FormulationType[];
}

/** Discovery suggestion from Claude */
export interface DiscoverySuggestion {
  name: string;
  description: string;
  rationale: string;
  confidence: "high" | "medium" | "low";
  smiles?: string;
}

/** Complete discovery response from Claude */
export interface DiscoveryResponse {
  analogs: DiscoverySuggestion[];
  modifications: DiscoverySuggestion[];
  relatedDrugs: DiscoverySuggestion[];
  repurposing: DiscoverySuggestion[];
}

/** Form state for the analysis page */
export interface AnalysisFormState {
  drugName: string;
  smiles: string;
  formulation: FormulationType | "";
  manufacturer: string;
  strength: string;
  stabilityClass: StabilityClass | 0; // 0 = Unknown/not selected
  expiryDate: string;
  manufacturingDate: string;
  storageTemp: number;
  storageHumidity: number;
  lightExposure: LightExposure;
  containerIntegrity: ContainerIntegrity;
  notes: string;
}
