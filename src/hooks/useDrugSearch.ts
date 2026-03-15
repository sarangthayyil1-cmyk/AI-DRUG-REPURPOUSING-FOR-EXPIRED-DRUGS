"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { searchDrugs } from "@/lib/drugs/search";
import type { WHODrug } from "@/lib/stability/types";

/**
 * Hook that wraps drug search with debouncing.
 * Returns matching drugs for the current query.
 */
export function useDrugSearch(query: string) {
  const debouncedQuery = useDebounce(query, 200);
  const [results, setResults] = useState<WHODrug[]>([]);

  useEffect(() => {
    const matches = searchDrugs(debouncedQuery);
    setResults(matches);
  }, [debouncedQuery]);

  return results;
}
