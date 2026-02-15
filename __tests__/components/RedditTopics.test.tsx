import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RedditTopics from "@/components/RedditTopics";
import type { RedditTopicsResponse } from "@/lib/types";

const mockTopicsResponse: RedditTopicsResponse = {
  success: true,
  topics: [
    {
      title: "Immigration numbers reach record high",
      extractedTopic: "immigration",
      score: 2847,
      url: "https://reddit.com/r/ukpolitics/comments/abc/immigration/",
      numComments: 512,
    },
    {
      title: "NHS waiting times at crisis levels",
      extractedTopic: "NHS waiting times",
      score: 1923,
      url: "https://reddit.com/r/ukpolitics/comments/def/nhs/",
      numComments: 389,
    },
    {
      title: "Cost of living continues to squeeze families",
      extractedTopic: "cost of living",
      score: 1654,
      url: "https://reddit.com/r/ukpolitics/comments/ghi/cost/",
      numComments: 278,
    },
  ],
  cached: false,
};

// Mock global fetch
const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", mockFetch);
});

describe("RedditTopics", () => {
  it("renders loading state initially then shows topics", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTopicsResponse),
    });

    render(<RedditTopics onSelectTopic={() => {}} />);

    // Initially shows loading
    expect(screen.getByText(/loading trending topics/i)).toBeInTheDocument();

    // After fetch resolves, shows topics
    await waitFor(() => {
      expect(screen.getByText("immigration")).toBeInTheDocument();
    });

    expect(screen.getByText("NHS waiting times")).toBeInTheDocument();
    expect(screen.getByText("cost of living")).toBeInTheDocument();
  });

  it("calls onSelectTopic with the extracted topic when clicked", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTopicsResponse),
    });

    const onSelectTopic = vi.fn();
    render(<RedditTopics onSelectTopic={onSelectTopic} />);

    await waitFor(() => {
      expect(screen.getByText("immigration")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("immigration"));

    expect(onSelectTopic).toHaveBeenCalledWith("immigration");
  });

  it("renders nothing when fetch returns error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ success: false, error: "Service unavailable" }),
    });

    const { container } = render(<RedditTopics onSelectTopic={() => {}} />);

    await waitFor(() => {
      // Loading should disappear
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Should render nothing (returns null on error)
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { container } = render(<RedditTopics onSelectTopic={() => {}} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(container.innerHTML).toBe("");
  });
});
