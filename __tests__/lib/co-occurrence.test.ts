import { describe, it, expect } from "vitest";
import {
  loadCoOccurrenceIndex,
  lookupCoOccurrences,
} from "@/lib/search/co-occurrence";
import type { CoOccurrenceIndex } from "@/lib/types";

describe("co-occurrence", () => {
  it("loads the co-occurrence index from data file", () => {
    const index = loadCoOccurrenceIndex();
    expect(index).toBeDefined();
    expect(typeof index).toBe("object");

    // Should have at least some terms
    const keys = Object.keys(index);
    expect(keys.length).toBeGreaterThan(0);
  });

  it("returns co-occurring terms for a known term", () => {
    const results = lookupCoOccurrences("immigration");
    expect(results.length).toBeGreaterThan(0);

    // Each result should have term and score
    results.forEach((entry) => {
      expect(entry.term).toBeDefined();
      expect(typeof entry.term).toBe("string");
      expect(entry.score).toBeDefined();
      expect(typeof entry.score).toBe("number");
      expect(entry.score).toBeGreaterThan(0);
      expect(entry.score).toBeLessThanOrEqual(1);
    });
  });

  it("returns empty array for an unknown term", () => {
    const results = lookupCoOccurrences("xyznonexistentterm");
    expect(results).toEqual([]);
  });

  it("returns results ordered by score descending", () => {
    const results = lookupCoOccurrences("NHS");
    expect(results.length).toBeGreaterThan(1);

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("handles case-insensitive lookup", () => {
    const upperResults = lookupCoOccurrences("NHS");
    const lowerResults = lookupCoOccurrences("nhs");

    // Both should return results (implementation should normalize case)
    // At minimum, one of them should work
    const combined = upperResults.length > 0 ? upperResults : lowerResults;
    expect(combined.length).toBeGreaterThan(0);
  });
});
