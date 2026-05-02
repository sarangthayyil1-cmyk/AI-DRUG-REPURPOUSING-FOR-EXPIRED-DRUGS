import { WHO_DRUGS } from "./dataset";
import type { WHODrug } from "@/lib/stability/types";

/**
 * Simple fuzzy search over the WHO drug dataset.
 * Matches by substring on drug name, then ranks by:
 * 1. Exact match (highest)
 * 2. Starts-with match
 * 3. Contains match (by position)
 * Returns top `limit` results.
 */
export function searchDrugs(query: string, limit = 8): WHODrug[] {
  if (!query || query.length < 1) return [];

  const lower = query.toLowerCase().trim();

  // Score each drug based on how well it matches
  const scored = WHO_DRUGS.map((drug) => {
    let bestScore = 0;
    
    // Include the main name and any synonyms for matching
    const searchNames = [drug.name, ...(drug.synonyms || [])];

    for (const nameObj of searchNames) {
      const name = nameObj.toLowerCase();
      let score = 0;

      if (name === lower) {
        score = 1000; // Exact match
      } else if (name.startsWith(lower)) {
        score = 500 - name.length; // Shorter names rank higher
      } else if (name.includes(lower)) {
        score = 200 - name.indexOf(lower); // Earlier position ranks higher
      } else {
        // Check individual words
        const words = name.split(/[\s(),-]+/);
        for (const word of words) {
          if (word.startsWith(lower)) {
            score = 100;
            break;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
      }
    }

    return { drug, score: bestScore };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((item) => item.drug);
}
