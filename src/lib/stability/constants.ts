import type { StabilityClass, FormulationType, LightExposure, ContainerIntegrity } from "./types";

// ── Stability class multipliers for time-based degradation ──
// Lower = more stable (penalty is multiplied by this factor)
export const STABILITY_CLASS_MULTIPLIERS: Record<StabilityClass, number> = {
  1: 0.5,   // Very Stable: half the time penalty
  2: 0.75,  // Stable
  3: 1.0,   // Moderately Stable: baseline
  4: 1.5,   // Unstable
  5: 2.0,   // Highly Unstable: double the time penalty
};

// ── Time-based degradation rates (penalty per month past expiry) ──
export const TIME_DEGRADATION_RATES = {
  earlyPhase: { months: 6, penaltyPerMonth: 3 },     // 0-6 months past expiry
  midPhase: { months: 24, penaltyPerMonth: 4 },       // 6-24 months past expiry
  latePhase: { penaltyPerMonth: 6 },                   // 24+ months past expiry
  notExpiredBonus: { maxBonus: 15, perMonthRemaining: 1 }, // Bonus for not-yet-expired drugs
};

// ── Temperature impact scoring ──
// Returns a penalty value based on storage temperature (Celsius)
export function getTemperaturePenalty(temp: number): number {
  if (temp >= 2 && temp <= 8) return -3;    // Refrigerated: slight risk of crystallization
  if (temp > 8 && temp <= 15) return -2;     // Cool storage
  if (temp > 15 && temp <= 25) return 0;     // Room temperature: ideal
  if (temp > 25 && temp <= 30) return -10;   // Slightly elevated
  if (temp > 30 && temp <= 40) return -20;   // Elevated: significant degradation risk
  if (temp > 40) return -35;                  // Hot: severe degradation
  if (temp >= -20 && temp < 2) return -15;   // Below freezing: freeze-thaw damage
  return -25;                                  // Extreme cold
}

// ── Humidity impact scoring ──
// Returns a penalty based on relative humidity (%RH)
export function getHumidityPenalty(humidity: number, formulation: FormulationType): number {
  // Solid dosage forms are more sensitive to moisture
  const isSolid = formulation === "tablet" || formulation === "capsule";
  const multiplier = isSolid ? 1.2 : 0.8;

  if (humidity <= 40) return 0;                                  // Dry: no impact
  if (humidity > 40 && humidity <= 60) return Math.round(-5 * multiplier);   // Normal
  if (humidity > 60 && humidity <= 75) return Math.round(-10 * multiplier);  // Elevated
  if (humidity > 75 && humidity <= 90) return Math.round(-20 * multiplier);  // High
  return Math.round(-30 * multiplier);                           // Saturated
}

// ── Light exposure penalties ──
export const LIGHT_EXPOSURE_PENALTIES: Record<LightExposure, number> = {
  none: 0,
  indirect: -5,
  direct: -15,
};

// ── Container integrity penalties ──
export const CONTAINER_INTEGRITY_PENALTIES: Record<ContainerIntegrity, number> = {
  sealed: 0,
  opened: -10,
  damaged: -25,
};

// ── Formulation-specific base modifiers ──
// Some formulations are inherently less stable
export const FORMULATION_MODIFIERS: Record<FormulationType, number> = {
  tablet: 0,        // Most stable solid form
  capsule: -2,      // Slightly less stable than tablets
  liquid: -10,      // Hydrolysis and microbial risk
  injectable: -12,  // Sterility concern + solution stability
  topical: -5,      // Emulsion stability
  inhaler: -8,      // Propellant/delivery system degradation
  patch: -5,        // Adhesive and drug release stability
  suppository: -8,  // Temperature-sensitive base
};
