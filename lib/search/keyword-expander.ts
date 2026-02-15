import nlp from "compromise";
import type { ExpandedKeyword } from "../types";
import { getSynonyms } from "../synonyms/uk-politics";
import { getCoOccurringTerms } from "./co-occurrence";

const WEIGHTS: Record<string, number> = {
  primary: 1.0,
  morphological: 0.7,
  synonym: 0.5,
  "co-occurring": 0.3,
};

/**
 * Expand a search query into weighted keywords using:
 * 1. Primary terms (the query itself)
 * 2. Morphological forms (plurals, verb conjugations via compromise NLP)
 * 3. Curated synonyms (hand-mapped UK politics terms)
 * 4. Co-occurring terms (statistically associated words from corpus)
 *
 * No external API required — demonstrates that narrative assembly
 * is a mechanical process, not an AI one.
 */
export function expandKeywords(query: string): ExpandedKeyword[] {
  const keywords: ExpandedKeyword[] = [];
  const seen = new Set<string>();

  const addKeyword = (
    term: string,
    category: ExpandedKeyword["category"],
    source: string
  ) => {
    const lower = term.toLowerCase().trim();
    if (!lower || seen.has(lower)) return;
    seen.add(lower);
    keywords.push({
      term: lower,
      category,
      weight: WEIGHTS[category],
      source,
    });
  };

  // 1. Primary terms — the query itself and individual words
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return [];

  addKeyword(queryLower, "primary", queryLower);

  // Also add individual words if multi-word query
  const words = queryLower.split(/\s+/).filter((w) => w.length > 2);
  for (const word of words) {
    addKeyword(word, "primary", queryLower);
  }

  // 2. Morphological forms via compromise NLP
  const doc = nlp(queryLower);

  // Get noun forms
  const nouns = doc.nouns();
  if (nouns.length > 0) {
    const plural = nouns.toPlural().text();
    const singular = nouns.toSingular().text();
    if (plural) addKeyword(plural, "morphological", queryLower);
    if (singular) addKeyword(singular, "morphological", queryLower);
  }

  // Get verb forms
  const verbs = doc.verbs();
  if (verbs.length > 0) {
    const past = verbs.toPastTense().text();
    const present = verbs.toPresentTense().text();
    const gerund = verbs.toGerund().text();
    if (past) addKeyword(past, "morphological", queryLower);
    if (present) addKeyword(present, "morphological", queryLower);
    if (gerund) addKeyword(gerund, "morphological", queryLower);
  }

  // Also try individual words for morphological expansion
  for (const word of words) {
    const wordDoc = nlp(word);
    const wordNouns = wordDoc.nouns();
    if (wordNouns.length > 0) {
      const p = wordNouns.toPlural().text();
      const s = wordNouns.toSingular().text();
      if (p) addKeyword(p, "morphological", word);
      if (s) addKeyword(s, "morphological", word);
    }
  }

  // 3. Curated synonyms
  const synonyms = getSynonyms(queryLower);
  for (const syn of synonyms) {
    addKeyword(syn, "synonym", queryLower);
  }

  // Also look up synonyms for individual words
  for (const word of words) {
    const wordSyns = getSynonyms(word);
    for (const syn of wordSyns) {
      addKeyword(syn, "synonym", word);
    }
  }

  // 4. Co-occurring terms from corpus analysis
  const coTerms = getCoOccurringTerms(queryLower);
  for (const { term } of coTerms) {
    addKeyword(term, "co-occurring", queryLower);
  }

  for (const word of words) {
    const wordCoTerms = getCoOccurringTerms(word);
    for (const { term } of wordCoTerms) {
      addKeyword(term, "co-occurring", word);
    }
  }

  return keywords;
}
