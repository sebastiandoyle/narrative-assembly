import type { CoOccurrenceIndex } from "../types";
import coOccurrenceData from "../../data/co-occurrence.json";

const index: CoOccurrenceIndex = coOccurrenceData as CoOccurrenceIndex;

/**
 * Load the full co-occurrence index.
 */
export function loadCoOccurrenceIndex(): CoOccurrenceIndex {
  return index;
}

/**
 * Get co-occurring terms for a given term from the pre-built index.
 * Case-insensitive lookup. Returns terms sorted by score descending.
 */
export function lookupCoOccurrences(
  term: string
): { term: string; score: number }[] {
  const lower = term.toLowerCase();
  return index[lower] ?? [];
}

// Aliases for backward compatibility
export const getCoOccurrenceIndex = loadCoOccurrenceIndex;
export const getCoOccurringTerms = lookupCoOccurrences;
