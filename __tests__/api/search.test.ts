import { describe, it, expect, vi } from "vitest";
import type { SearchRequest, SearchResponse, ErrorResponse } from "@/lib/types";

// We test the API handler function directly
// The handler is expected to be at app/api/search/route.ts as a Next.js route handler

describe("search API route", () => {
  it("returns search results for a valid query", async () => {
    const { POST } = await import("@/app/api/search/route");

    const request = new Request("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "immigration" } satisfies SearchRequest),
    });

    const response = await POST(request);
    const data = (await response.json()) as SearchResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.query).toBe("immigration");
    expect(data.data.expandedKeywords.length).toBeGreaterThan(0);
    expect(Array.isArray(data.data.clips)).toBe(true);
    expect(typeof data.data.searchTimeMs).toBe("number");
  });

  it("returns error for empty query", async () => {
    const { POST } = await import("@/app/api/search/route");

    const request = new Request("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "" }),
    });

    const response = await POST(request);
    const data = (await response.json()) as ErrorResponse;

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(typeof data.error).toBe("string");
  });

  it("returns clips with correct structure", async () => {
    const { POST } = await import("@/app/api/search/route");

    const request = new Request("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "NHS", maxClips: 5 } satisfies SearchRequest),
    });

    const response = await POST(request);
    const data = (await response.json()) as SearchResponse;

    expect(data.success).toBe(true);

    if (data.data.clips.length > 0) {
      const clip = data.data.clips[0];
      expect(clip).toHaveProperty("videoId");
      expect(clip).toHaveProperty("videoTitle");
      expect(clip).toHaveProperty("startTime");
      expect(clip).toHaveProperty("endTime");
      expect(clip).toHaveProperty("text");
      expect(clip).toHaveProperty("score");
      expect(clip).toHaveProperty("matchedKeywords");
      expect(clip.startTime).toBeLessThan(clip.endTime);
      expect(clip.score).toBeGreaterThan(0);
      expect(clip.matchedKeywords.length).toBeGreaterThan(0);
    }
  });

  it("respects maxClips parameter", async () => {
    const { POST } = await import("@/app/api/search/route");

    const request = new Request("http://localhost:3000/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "the", maxClips: 2 } satisfies SearchRequest),
    });

    const response = await POST(request);
    const data = (await response.json()) as SearchResponse;

    expect(data.success).toBe(true);
    expect(data.data.clips.length).toBeLessThanOrEqual(2);
  });
});
