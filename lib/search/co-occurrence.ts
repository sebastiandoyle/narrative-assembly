import type { CoOccurrenceIndex } from "../types";
import coOccurrenceData from "../../data/co-occurrence.json";

const index: CoOccurrenceIndex = coOccurrenceData as CoOccurrenceIndex;

/**
 * Get co-occurring terms for a given term from the pre-built index.
 * Returns terms that statistically appear alongside the query term
 * in the transcript corpus, sorted by co-occurrence score.
 */
export function getCoOccurringTerms(
  term: string
): { term: string; score: number }[] {
  const lower = term.toLowerCase();
  return index[lower] ?? [];
}

/**
 * Get the full co-occurrence index.
 */
export function getCoOccurrenceIndex(): CoOccurrenceIndex {
  return index;
}
