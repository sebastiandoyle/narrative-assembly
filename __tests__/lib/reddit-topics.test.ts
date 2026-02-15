import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRedditTopics, resetCache } from "@/lib/reddit/topics";
import type { RedditTopic } from "@/lib/types";
import { mockRedditApiResponse } from "../fixtures/mock-reddit";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("reddit-topics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCache();
  });

  it("parses Reddit API response into RedditTopic array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRedditApiResponse),
    });

    const topics = await fetchRedditTopics();
    expect(topics.length).toBeGreaterThan(0);

    topics.forEach((topic) => {
      expect(topic).toHaveProperty("title");
      expect(topic).toHaveProperty("extractedTopic");
      expect(topic).toHaveProperty("score");
      expect(topic).toHaveProperty("url");
      expect(topic).toHaveProperty("numComments");
      expect(typeof topic.title).toBe("string");
      expect(typeof topic.score).toBe("number");
    });
  });

  it("extracts meaningful topic phrases from post titles", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRedditApiResponse),
    });

    const topics = await fetchRedditTopics();

    // Should filter out non-topical posts like megathreads
    const titles = topics.map((t) => t.title.toLowerCase());
    expect(
      titles.some((t) => t.includes("megathread"))
    ).toBe(false);

    // extractedTopic should be non-empty for all results
    topics.forEach((topic) => {
      expect(topic.extractedTopic.length).toBeGreaterThan(0);
    });
  });

  it("handles fetch errors gracefully with fallback topics", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const topics = await fetchRedditTopics();

    // Should return fallback topics rather than throwing
    expect(topics.length).toBeGreaterThan(0);
    topics.forEach((topic) => {
      expect(topic).toHaveProperty("title");
      expect(topic).toHaveProperty("extractedTopic");
    });
  });

  it("returns fallback topics when API returns non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    });

    const topics = await fetchRedditTopics();
    expect(topics.length).toBeGreaterThan(0);
  });

  it("caches results to avoid excessive API calls", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRedditApiResponse),
    });

    // Call twice in quick succession
    const first = await fetchRedditTopics();
    const second = await fetchRedditTopics();

    // Should only have fetched once due to caching
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });
});
