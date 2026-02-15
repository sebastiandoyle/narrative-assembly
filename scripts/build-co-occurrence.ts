#!/usr/bin/env npx tsx
/**
 * Build a co-occurrence index from the transcript corpus.
 *
 * Analyzes all transcript segments to find terms that frequently appear
 * near each other, producing a statistical co-occurrence index used
 * by the keyword expansion system.
 *
 * Usage:
 *   npx tsx scripts/build-co-occurrence.ts
 *   npx tsx scripts/build-co-occurrence.ts --window 5 --min-count 2
 */

import * as fs from "fs";
import * as path from "path";

// --- Config ---

const TRANSCRIPTS_DIR = path.resolve(__dirname, "..", "data", "transcripts");
const OUTPUT_PATH = path.resolve(__dirname, "..", "data", "co-occurrence.json");
const WINDOW_SIZE = parseInt(process.argv.find((_, i, a) => a[i - 1] === "--window") ?? "5");
const MIN_COUNT = parseInt(process.argv.find((_, i, a) => a[i - 1] === "--min-count") ?? "2");
const TOP_N = parseInt(process.argv.find((_, i, a) => a[i - 1] === "--top") ?? "10");

// Common English stop words to exclude
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "need", "must",
  "it", "its", "this", "that", "these", "those", "i", "you", "he", "she",
  "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
  "our", "their", "what", "which", "who", "whom", "where", "when", "how",
  "not", "no", "nor", "so", "if", "then", "than", "too", "very", "just",
  "about", "up", "out", "also", "as", "into", "all", "some", "more",
  "other", "there", "here", "over", "such", "only", "own", "same",
  "both", "each", "well", "back", "after", "before", "between", "under",
  "again", "once", "during", "while", "because", "through", "against",
  "says", "said", "say", "going", "get", "got", "go", "one", "two",
  "new", "now", "way", "even", "still", "already", "much", "many",
  "been", "being", "make", "made", "think", "know", "see", "come",
  "take", "want", "look", "like", "really", "right", "yeah", "yes",
]);

// --- Types ---

interface TranscriptSegment {
  start: number;
  dur: number;
  text: string;
}

interface TranscriptFile {
  videoId: string;
  title: string;
  segments: TranscriptSegment[];
}

interface CoOccurrence {
  [term: string]: { term: string; score: number }[];
}

// --- Logic ---

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function loadTranscripts(): TranscriptFile[] {
  const manifestPath = path.join(TRANSCRIPTS_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: manifest.json not found at ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const transcripts: TranscriptFile[] = [];

  for (const video of manifest.videos) {
    const filePath = path.join(TRANSCRIPTS_DIR, `${video.videoId}.json`);
    if (fs.existsSync(filePath)) {
      transcripts.push(JSON.parse(fs.readFileSync(filePath, "utf-8")));
    }
  }

  return transcripts;
}

function buildCoOccurrence(transcripts: TranscriptFile[]): CoOccurrence {
  // Count co-occurrences within sliding windows
  const pairCounts = new Map<string, Map<string, number>>();
  const termCounts = new Map<string, number>();

  for (const transcript of transcripts) {
    // Build a flat token stream from all segments
    const tokens: string[] = [];
    for (const seg of transcript.segments) {
      tokens.push(...tokenize(seg.text));
    }

    // Sliding window co-occurrence
    for (let i = 0; i < tokens.length; i++) {
      const term = tokens[i];
      termCounts.set(term, (termCounts.get(term) ?? 0) + 1);

      for (let j = i + 1; j < Math.min(i + WINDOW_SIZE, tokens.length); j++) {
        const other = tokens[j];
        if (term === other) continue;

        // Record both directions
        if (!pairCounts.has(term)) pairCounts.set(term, new Map());
        if (!pairCounts.has(other)) pairCounts.set(other, new Map());

        const termMap = pairCounts.get(term)!;
        const otherMap = pairCounts.get(other)!;

        termMap.set(other, (termMap.get(other) ?? 0) + 1);
        otherMap.set(term, (otherMap.get(term) ?? 0) + 1);
      }
    }
  }

  // Convert to normalized scores
  const result: CoOccurrence = {};

  for (const [term, coTerms] of pairCounts) {
    const termCount = termCounts.get(term) ?? 1;

    // Filter by minimum count and compute PMI-like score
    const scored: { term: string; score: number }[] = [];

    for (const [coTerm, count] of coTerms) {
      if (count < MIN_COUNT) continue;

      const coTermCount = termCounts.get(coTerm) ?? 1;
      // Pointwise mutual information approximation
      const totalTokens = Array.from(termCounts.values()).reduce((a, b) => a + b, 0);
      const pmi = Math.log2(
        (count * totalTokens) / (termCount * coTermCount)
      );
      const score = Math.max(0, Math.min(1, (pmi + 2) / 8)); // Normalize to 0-1

      if (score > 0.1) {
        scored.push({ term: coTerm, score: Math.round(score * 100) / 100 });
      }
    }

    // Sort by score descending, take top N
    scored.sort((a, b) => b.score - a.score);
    const topScored = scored.slice(0, TOP_N);

    if (topScored.length > 0) {
      result[term] = topScored;
    }
  }

  return result;
}

// --- Main ---

function main() {
  console.log("Building co-occurrence index...");
  console.log(`  Window size: ${WINDOW_SIZE}`);
  console.log(`  Min count: ${MIN_COUNT}`);
  console.log(`  Top N per term: ${TOP_N}`);

  const transcripts = loadTranscripts();
  console.log(`\nLoaded ${transcripts.length} transcripts`);

  const totalSegments = transcripts.reduce((sum, t) => sum + t.segments.length, 0);
  console.log(`Total segments: ${totalSegments}`);

  const coOccurrence = buildCoOccurrence(transcripts);
  const termCount = Object.keys(coOccurrence).length;

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(coOccurrence, null, 2));

  console.log(`\nCo-occurrence index built:`);
  console.log(`  Terms with co-occurrences: ${termCount}`);
  console.log(`  Output: ${OUTPUT_PATH}`);

  // Show a sample
  const sampleTerms = Object.keys(coOccurrence).slice(0, 3);
  if (sampleTerms.length > 0) {
    console.log(`\nSample entries:`);
    for (const term of sampleTerms) {
      const top3 = coOccurrence[term].slice(0, 3);
      console.log(
        `  "${term}" → ${top3.map((t) => `"${t.term}" (${t.score})`).join(", ")}`
      );
    }
  }
}

main();
