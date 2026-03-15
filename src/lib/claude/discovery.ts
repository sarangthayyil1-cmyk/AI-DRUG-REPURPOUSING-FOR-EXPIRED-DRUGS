import type { StabilityResult, DiscoveryResponse } from "@/lib/stability/types";

/**
 * Build the system prompt for Claude as a pharmaceutical chemistry expert.
 */
export function buildSystemPrompt(): string {
  return `You are a pharmaceutical chemistry and pharmacology expert. You provide evidence-based drug discovery and repurposing suggestions based on stability analysis data. Be scientifically rigorous but accessible to healthcare professionals. Always note that suggestions are for research purposes and require clinical validation.`;
}

/**
 * Build the user prompt with the drug's analysis context.
 */
export function buildUserPrompt(
  drugName: string,
  smiles: string,
  stabilityResult: StabilityResult
): string {
  const factorSummary = stabilityResult.factors
    .map((f) => `- ${f.name}: ${f.description} (impact: ${f.impact})`)
    .join("\n");

  return `Analyze the following drug stability data and provide drug discovery/repurposing suggestions.

Drug: ${drugName}
SMILES: ${smiles || "Not available"}
Stability Verdict: ${stabilityResult.verdict.replace("_", " ")} (${stabilityResult.probability}% estimated active)
Months Since Expiry: ${stabilityResult.monthsSinceExpiry}
Risk Level: ${stabilityResult.riskLevel}

Degradation Factors:
${factorSummary}

Based on this analysis, provide suggestions in the following categories. Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:

{
  "analogs": [
    {
      "name": "compound name",
      "description": "brief description",
      "rationale": "why this is relevant",
      "confidence": "high|medium|low",
      "smiles": "SMILES string if known"
    }
  ],
  "modifications": [
    {
      "name": "modification type",
      "description": "what the modification involves",
      "rationale": "how it improves stability or efficacy",
      "confidence": "high|medium|low"
    }
  ],
  "relatedDrugs": [
    {
      "name": "drug name",
      "description": "therapeutic similarity",
      "rationale": "why consider this alternative",
      "confidence": "high|medium|low"
    }
  ],
  "repurposing": [
    {
      "name": "repurposing opportunity",
      "description": "alternative therapeutic use",
      "rationale": "evidence or mechanism basis",
      "confidence": "high|medium|low"
    }
  ]
}

Provide 2-3 items per category. Be specific with drug names, chemical modifications, and therapeutic areas.`;
}

/**
 * Parse Claude's response into a typed DiscoveryResponse.
 * Handles potential JSON parsing issues gracefully.
 */
export function parseDiscoveryResponse(text: string): DiscoveryResponse {
  // Try to extract JSON from the response (handle markdown code blocks)
  let jsonStr = text.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      analogs: parsed.analogs || [],
      modifications: parsed.modifications || [],
      relatedDrugs: parsed.relatedDrugs || [],
      repurposing: parsed.repurposing || [],
    };
  } catch {
    // Return empty structure if parsing fails
    return {
      analogs: [],
      modifications: [],
      relatedDrugs: [],
      repurposing: [],
    };
  }
}
