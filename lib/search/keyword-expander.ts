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
  const trimmed = query.trim();
  if (!trimmed) return [];
  const queryLower = trimmed.toLowerCase();

  addKeyword(queryLower, "primary", trimmed);

  // Also add individual words if multi-word query
  const words = queryLower.split(/\s+/).filter((w) => w.length > 2);
  const originalWords = trimmed.split(/\s+/).filter((w) => w.length > 2);
  for (let i = 0; i < words.length; i++) {
    addKeyword(words[i], "primary", trimmed);
  }

  // 2. Morphological forms via compromise NLP
  const doc = nlp(queryLower);

  // Get noun forms
  const nouns = doc.nouns();
  if (nouns.length > 0) {
    const plural = nouns.toPlural().text();
    const singular = nouns.toSingular().text();
    if (plural) addKeyword(plural, "morphological", trimmed);
    if (singular) addKeyword(singular, "morphological", trimmed);
  }

  // Get verb forms
  const verbs = doc.verbs();
  if (verbs.length > 0) {
    const past = verbs.toPastTense().text();
    const present = verbs.toPresentTense().text();
    const gerund = verbs.toGerund().text();
    if (past) addKeyword(past, "morphological", trimmed);
    if (present) addKeyword(present, "morphological", trimmed);
    if (gerund) addKeyword(gerund, "morphological", trimmed);
  }

  // Also try individual words for morphological expansion
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const origWord = originalWords[i] || word;
    const wordDoc = nlp(word);
    const wordNouns = wordDoc.nouns();
    if (wordNouns.length > 0) {
      const p = wordNouns.toPlural().text();
      const s = wordNouns.toSingular().text();
      if (p) addKeyword(p, "morphological", origWord);
      if (s) addKeyword(s, "morphological", origWord);
    }
  }

  // 3. Curated synonyms
  const synonyms = getSynonyms(queryLower);
  for (const syn of synonyms) {
    addKeyword(syn, "synonym", trimmed);
  }

  // Also look up synonyms for individual words
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const origWord = originalWords[i] || word;
    const wordSyns = getSynonyms(word);
    for (const syn of wordSyns) {
      addKeyword(syn, "synonym", origWord);
    }
  }

  // 4. Co-occurring terms from corpus analysis
  const coTerms = getCoOccurringTerms(queryLower);
  for (const { term } of coTerms) {
    addKeyword(term, "co-occurring", trimmed);
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const origWord = originalWords[i] || word;
    const wordCoTerms = getCoOccurringTerms(word);
    for (const { term } of wordCoTerms) {
      addKeyword(term, "co-occurring", origWord);
    }
  }

  return keywords;
}
