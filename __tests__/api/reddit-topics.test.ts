import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RedditTopicsResponse, ErrorResponse } from "@/lib/types";

// Mock fetch globally for Reddit API calls
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("reddit-topics API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to clear any internal caching
    vi.resetModules();
  });

  it("returns trending Reddit topics", async () => {
    // Mock the Reddit API call that the route handler will make
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          kind: "Listing",
          data: {
            children: [
              {
                kind: "t3",
                data: {
                  title: "Immigration debate heats up in Parliament",
                  score: 1500,
                  url: "https://reddit.com/r/ukpolitics/comments/test/immigration/",
                  num_comments: 200,
                  selftext: "Discussion about immigration...",
                  link_flair_text: "News",
                },
              },
            ],
          },
        }),
    });

    const { GET } = await import("@/app/api/reddit-topics/route");

    const request = new Request("http://localhost:3000/api/reddit-topics");
    const response = await GET(request);
    const data = (await response.json()) as RedditTopicsResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.topics)).toBe(true);
    expect(data.topics.length).toBeGreaterThan(0);

    const topic = data.topics[0];
    expect(topic).toHaveProperty("title");
    expect(topic).toHaveProperty("extractedTopic");
    expect(topic).toHaveProperty("score");
    expect(topic).toHaveProperty("url");
    expect(topic).toHaveProperty("numComments");
  });

  it("handles fetch failure gracefully with fallback topics", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { GET } = await import("@/app/api/reddit-topics/route");

    const request = new Request("http://localhost:3000/api/reddit-topics");
    const response = await GET(request);
    const data = (await response.json()) as RedditTopicsResponse;

    // Should still return 200 with fallback topics
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.topics.length).toBeGreaterThan(0);
  });

  it("includes cache status in response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          kind: "Listing",
          data: {
            children: [
              {
                kind: "t3",
                data: {
                  title: "Test topic",
                  score: 100,
                  url: "https://reddit.com/test",
                  num_comments: 10,
                  selftext: "",
                  link_flair_text: "News",
                },
              },
            ],
          },
        }),
    });

    const { GET } = await import("@/app/api/reddit-topics/route");

    const request = new Request("http://localhost:3000/api/reddit-topics");
    const response = await GET(request);
    const data = (await response.json()) as RedditTopicsResponse;

    expect(data).toHaveProperty("cached");
    expect(typeof data.cached).toBe("boolean");
  });
});
