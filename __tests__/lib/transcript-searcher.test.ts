import { describe, it, expect } from "vitest";
import { searchTranscripts } from "@/lib/search/transcript-searcher";
import type { ExpandedKeyword, TranscriptFile, ClipMatch } from "@/lib/types";
import {
  allMockTranscripts,
  mockTranscriptImmigration,
} from "../fixtures/mock-transcripts";

function makeKeyword(
  term: string,
  category: "primary" | "morphological" | "synonym" | "co-occurring" = "primary",
  weight = 1.0,
  source = term
): ExpandedKeyword {
  return { term, category, weight, source };
}

describe("transcript-searcher", () => {
  it("finds clips matching a basic keyword", () => {
    const keywords = [makeKeyword("immigration")];
    const results = searchTranscripts(allMockTranscripts, keywords);

    expect(results.length).toBeGreaterThan(0);
    results.forEach((clip) => {
      expect(clip.text.toLowerCase()).toContain("immigration");
      expect(clip.matchedKeywords).toContain("immigration");
    });
  });

  it("applies weighted scoring based on keyword category", () => {
    const primaryKeywords = [makeKeyword("immigration", "primary", 1.0)];
    const synonymKeywords = [makeKeyword("immigration", "synonym", 0.5)];

    const primaryResults = searchTranscripts(allMockTranscripts, primaryKeywords);
    const synonymResults = searchTranscripts(allMockTranscripts, synonymKeywords);

    // Primary matches should score higher than synonym matches for the same term
    if (primaryResults.length > 0 && synonymResults.length > 0) {
      expect(primaryResults[0].score).toBeGreaterThan(synonymResults[0].score);
    }
  });

  it("handles multi-keyword searches and accumulates scores", () => {
    const keywords = [
      makeKeyword("immigration"),
      makeKeyword("visa", "co-occurring", 0.3, "immigration"),
    ];
    const results = searchTranscripts(allMockTranscripts, keywords);
    expect(results.length).toBeGreaterThan(0);

    // A clip matching both keywords should have higher score
    const multiMatch = results.find(
      (c) => c.matchedKeywords.length > 1
    );
    const singleMatch = results.find(
      (c) => c.matchedKeywords.length === 1
    );

    if (multiMatch && singleMatch) {
      expect(multiMatch.score).toBeGreaterThan(singleMatch.score);
    }
  });

  it("returns empty array when no segments match", () => {
    const keywords = [makeKeyword("cryptocurrency")];
    const results = searchTranscripts(allMockTranscripts, keywords);
    expect(results).toEqual([]);
  });

  it("deduplicates overlapping clips from adjacent segments", () => {
    const keywords = [
      makeKeyword("immigration"),
      makeKeyword("migration", "morphological", 0.7, "immigration"),
    ];
    const results = searchTranscripts([mockTranscriptImmigration], keywords);

    // Check that no two clips have identical start times from the same video
    const startKeys = results.map((c) => `${c.videoId}:${c.startTime}`);
    const uniqueKeys = [...new Set(startKeys)];
    expect(startKeys.length).toBe(uniqueKeys.length);
  });

  it("respects maxClips limit", () => {
    const keywords = [makeKeyword("the")]; // Common word, will match many segments
    const maxClips = 3;
    const results = searchTranscripts(allMockTranscripts, keywords, maxClips);
    expect(results.length).toBeLessThanOrEqual(maxClips);
  });

  it("matches case-insensitively", () => {
    const upperKeywords = [makeKeyword("NHS")];
    const lowerKeywords = [makeKeyword("nhs")];

    const upperResults = searchTranscripts(allMockTranscripts, upperKeywords);
    const lowerResults = searchTranscripts(allMockTranscripts, lowerKeywords);

    expect(upperResults.length).toBe(lowerResults.length);
  });

  it("returns results ordered by score descending", () => {
    const keywords = [makeKeyword("government")];
    const results = searchTranscripts(allMockTranscripts, keywords);

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
});
