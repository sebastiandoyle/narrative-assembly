import { describe, it, expect } from "vitest";
import { expandKeywords } from "@/lib/search/keyword-expander";
import type { ExpandedKeyword } from "@/lib/types";

describe("keyword-expander", () => {
  it("expands a basic single keyword with primary category", () => {
    const result = expandKeywords("immigration");
    expect(result.length).toBeGreaterThan(0);

    const primary = result.find(
      (k) => k.term === "immigration" && k.category === "primary"
    );
    expect(primary).toBeDefined();
    expect(primary!.weight).toBe(1.0);
    expect(primary!.source).toBe("immigration");
  });

  it("includes morphological forms of the input term", () => {
    const result = expandKeywords("immigration");
    const morphological = result.filter((k) => k.category === "morphological");
    expect(morphological.length).toBeGreaterThan(0);

    // Should include forms like "immigrate", "immigrant", "immigrants"
    const morphTerms = morphological.map((k) => k.term.toLowerCase());
    expect(
      morphTerms.some(
        (t) =>
          t.includes("immigrat") || t.includes("migrant") || t.includes("migrate")
      )
    ).toBe(true);

    // All morphological terms should have weight 0.7
    morphological.forEach((k) => {
      expect(k.weight).toBe(0.7);
    });
  });

  it("includes synonym expansions from the UK politics dictionary", () => {
    const result = expandKeywords("NHS");
    const synonyms = result.filter((k) => k.category === "synonym");

    // NHS should have synonyms like "health service", "national health service"
    expect(synonyms.length).toBeGreaterThan(0);
    synonyms.forEach((k) => {
      expect(k.weight).toBe(0.5);
      expect(k.source).toBe("NHS");
    });
  });

  it("includes co-occurring terms from the co-occurrence index", () => {
    const result = expandKeywords("immigration");
    const coOccurring = result.filter((k) => k.category === "co-occurring");
    expect(coOccurring.length).toBeGreaterThan(0);

    // Co-occurrence index has entries for "immigration" like "borders", "asylum"
    coOccurring.forEach((k) => {
      expect(k.weight).toBe(0.3);
      expect(k.source).toBe("immigration");
    });
  });

  it("returns empty array for empty input", () => {
    const result = expandKeywords("");
    expect(result).toEqual([]);
  });

  it("handles multi-word queries by expanding each word", () => {
    const result = expandKeywords("NHS waiting lists");
    expect(result.length).toBeGreaterThan(0);

    // Should have primary entries for the query terms
    const primaryTerms = result
      .filter((k) => k.category === "primary")
      .map((k) => k.term.toLowerCase());
    expect(primaryTerms.length).toBeGreaterThan(0);
  });

  it("assigns correct weights per category", () => {
    const result = expandKeywords("economy");
    const weightByCategory: Record<string, number> = {
      primary: 1.0,
      morphological: 0.7,
      synonym: 0.5,
      "co-occurring": 0.3,
    };

    result.forEach((keyword) => {
      expect(keyword.weight).toBe(weightByCategory[keyword.category]);
    });
  });

  it("deduplicates expanded keywords", () => {
    const result = expandKeywords("immigration");
    const terms = result.map((k) => k.term.toLowerCase());
    const uniqueTerms = [...new Set(terms)];
    expect(terms.length).toBe(uniqueTerms.length);
  });
});
