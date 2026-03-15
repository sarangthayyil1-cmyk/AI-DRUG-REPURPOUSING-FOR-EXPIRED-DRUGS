import type {
  StabilityInput,
  StabilityResult,
  StabilityFactor,
  StabilityVerdict,
  StabilityClass,
} from "./types";
import {
  STABILITY_CLASS_MULTIPLIERS,
  TIME_DEGRADATION_RATES,
  getTemperaturePenalty,
  getHumidityPenalty,
  LIGHT_EXPOSURE_PENALTIES,
  CONTAINER_INTEGRITY_PENALTIES,
  FORMULATION_MODIFIERS,
} from "./constants";

/**
 * Calculate months between two dates.
 * Positive = past expiry, negative = before expiry.
 */
function monthsSinceExpiry(expiryDate: string): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return (
    (now.getFullYear() - expiry.getFullYear()) * 12 +
    (now.getMonth() - expiry.getMonth())
  );
}

/**
 * Calculate the time-based degradation penalty.
 * This is the heaviest factor in the scoring system.
 */
function calculateTimePenalty(
  months: number,
  stabilityClass: StabilityClass
): { penalty: number; description: string } {
  const multiplier = STABILITY_CLASS_MULTIPLIERS[stabilityClass];
  const rates = TIME_DEGRADATION_RATES;

  // Drug has not yet expired — give a small bonus
  if (months <= 0) {
    const monthsRemaining = Math.abs(months);
    const bonus = Math.min(
      rates.notExpiredBonus.maxBonus,
      monthsRemaining * rates.notExpiredBonus.perMonthRemaining
    );
    return {
      penalty: bonus,
      description: `${monthsRemaining} months before expiry (+${bonus} stability bonus)`,
    };
  }

  // Drug is past expiry — apply escalating penalties
  let penalty = 0;
  let remaining = months;

  // Early phase: 0-6 months past expiry
  const earlyMonths = Math.min(remaining, rates.earlyPhase.months);
  penalty += earlyMonths * rates.earlyPhase.penaltyPerMonth;
  remaining -= earlyMonths;

  // Mid phase: 6-24 months past expiry
  if (remaining > 0) {
    const midMonths = Math.min(
      remaining,
      rates.midPhase.months - rates.earlyPhase.months
    );
    penalty += midMonths * rates.midPhase.penaltyPerMonth;
    remaining -= midMonths;
  }

  // Late phase: 24+ months past expiry
  if (remaining > 0) {
    penalty += remaining * rates.latePhase.penaltyPerMonth;
  }

  // Apply stability class multiplier
  const adjustedPenalty = Math.round(penalty * multiplier);

  return {
    penalty: -adjustedPenalty,
    description: `${months} months past expiry (${adjustedPenalty} point penalty, class multiplier: ${multiplier}x)`,
  };
}

/**
 * Main stability estimation algorithm.
 *
 * Starts with a base score of 100 (fully active) and applies
 * weighted penalties based on multiple degradation factors.
 * The final score maps to a verdict and probability.
 *
 * This is a heuristic model — not clinically validated.
 * Real implementations should use Arrhenius kinetics or ML models.
 */
export function calculateStability(input: StabilityInput): StabilityResult {
  const BASE_SCORE = 100;
  const factors: StabilityFactor[] = [];
  const months = monthsSinceExpiry(input.expiryDate);

  // 1. Time-based degradation (heaviest weight ~40%)
  const timeFactor = calculateTimePenalty(months, input.stabilityClass);
  factors.push({
    name: "Time Since Expiry",
    impact: timeFactor.penalty,
    description: timeFactor.description,
  });

  // 2. Temperature impact (~20%)
  const tempPenalty = getTemperaturePenalty(input.storageTemp);
  factors.push({
    name: "Storage Temperature",
    impact: tempPenalty,
    description:
      tempPenalty === 0
        ? `${input.storageTemp}°C — within recommended range`
        : `${input.storageTemp}°C — ${tempPenalty > -15 ? "slightly" : "significantly"} outside optimal range`,
  });

  // 3. Humidity impact (~15%)
  const humidityPenalty = getHumidityPenalty(
    input.storageHumidity,
    input.formulation
  );
  factors.push({
    name: "Relative Humidity",
    impact: humidityPenalty,
    description:
      humidityPenalty === 0
        ? `${input.storageHumidity}% RH — acceptable`
        : `${input.storageHumidity}% RH — moisture exposure risk`,
  });

  // 4. Light exposure (~10%)
  const lightPenalty = LIGHT_EXPOSURE_PENALTIES[input.lightExposure];
  factors.push({
    name: "Light Exposure",
    impact: lightPenalty,
    description:
      lightPenalty === 0
        ? "No significant light exposure"
        : `${input.lightExposure === "direct" ? "Direct sunlight" : "Indirect light"} — photodegradation risk`,
  });

  // 5. Container integrity (~15%)
  const containerPenalty =
    CONTAINER_INTEGRITY_PENALTIES[input.containerIntegrity];
  factors.push({
    name: "Container Integrity",
    impact: containerPenalty,
    description:
      containerPenalty === 0
        ? "Container sealed and intact"
        : `Container ${input.containerIntegrity} — exposure to air, moisture, and contaminants`,
  });

  // 6. Formulation modifier
  const formulationPenalty = FORMULATION_MODIFIERS[input.formulation];
  if (formulationPenalty !== 0) {
    factors.push({
      name: "Formulation Type",
      impact: formulationPenalty,
      description: `${input.formulation} formulation — ${formulationPenalty < -8 ? "inherently less stable form" : "minor stability consideration"}`,
    });
  }

  // Calculate final score
  const totalImpact = factors.reduce((sum, f) => sum + f.impact, 0);
  const finalScore = Math.max(0, Math.min(100, BASE_SCORE + totalImpact));

  // Map score to verdict
  let verdict: StabilityVerdict;
  let riskLevel: "low" | "medium" | "high";
  if (finalScore >= 65) {
    verdict = "likely_active";
    riskLevel = "low";
  } else if (finalScore >= 35) {
    verdict = "possibly_degraded";
    riskLevel = "medium";
  } else {
    verdict = "likely_inactive";
    riskLevel = "high";
  }

  // Generate human-readable summary
  const summary = generateSummary(
    input.drugName,
    verdict,
    finalScore,
    months,
    factors
  );

  return {
    verdict,
    probability: Math.round(finalScore),
    factors,
    riskLevel,
    summary,
    monthsSinceExpiry: months,
  };
}

/**
 * Generate a human-readable summary of the analysis.
 */
function generateSummary(
  drugName: string,
  verdict: StabilityVerdict,
  score: number,
  months: number,
  factors: StabilityFactor[]
): string {
  const verdictText = {
    likely_active: "likely still biologically active",
    possibly_degraded: "possibly degraded with reduced efficacy",
    likely_inactive: "likely inactive or significantly degraded",
  };

  const timeContext =
    months <= 0
      ? `${Math.abs(months)} months before its expiry date`
      : `${months} months past its expiry date`;

  // Find the most impactful negative factor
  const worstFactor = factors
    .filter((f) => f.impact < 0)
    .sort((a, b) => a.impact - b.impact)[0];

  let summary = `${drugName} is estimated to be ${verdictText[verdict]} with a ${Math.round(score)}% probability of retained activity. `;
  summary += `The drug is ${timeContext}. `;

  if (worstFactor) {
    summary += `The most significant degradation factor is ${worstFactor.name.toLowerCase()}. `;
  }

  summary +=
    "Note: This is a heuristic estimate for research purposes only. Always consult a pharmacist or physician before using any medication past its expiry date.";

  return summary;
}
