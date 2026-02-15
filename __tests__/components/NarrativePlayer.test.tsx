import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NarrativePlayer from "@/components/NarrativePlayer";
import type { ClipMatch } from "@/lib/types";

const mockClips: ClipMatch[] = [
  {
    videoId: "test_vid_001",
    videoTitle: "UK immigration policy debate - BBC News",
    publishedAt: "2025-11-15",
    startTime: 0,
    endTime: 7.5,
    text: "The government has announced sweeping changes to immigration policy",
    score: 0.95,
    matchedKeywords: ["immigration"],
  },
  {
    videoId: "test_vid_002",
    videoTitle: "NHS waiting lists hit record high - BBC News",
    publishedAt: "2025-12-03",
    startTime: 0,
    endTime: 7.8,
    text: "NHS waiting lists have reached an all time high",
    score: 0.85,
    matchedKeywords: ["NHS"],
  },
  {
    videoId: "test_vid_003",
    videoTitle: "Climate change and net zero targets - BBC News",
    publishedAt: "2025-11-28",
    startTime: 4.2,
    endTime: 12.1,
    text: "Carbon emissions have fallen but not fast enough",
    score: 0.75,
    matchedKeywords: ["climate"],
  },
];

describe("NarrativePlayer", () => {
  it("renders the current clip with video title", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    expect(screen.getByText(/UK immigration policy debate/i)).toBeInTheDocument();
  });

  it("shows clip counter (e.g. 1 / 3)", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
  });

  it("returns null when clips array is empty", () => {
    const { container } = render(
      <NarrativePlayer clips={[]} activeIndex={0} onClipChange={() => {}} />
    );

    expect(container.innerHTML).toBe("");
  });

  it("calls onClipChange when next button is clicked", () => {
    const onClipChange = vi.fn();
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={onClipChange} />
    );

    const nextButton = screen.getByRole("button", { name: /next clip/i });
    fireEvent.click(nextButton);

    expect(onClipChange).toHaveBeenCalledWith(1);
  });

  it("disables previous button on first clip", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    const prevButton = screen.getByRole("button", { name: /previous clip/i });
    expect(prevButton).toBeDisabled();
  });

  it("disables next button on last clip", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={2} onClipChange={() => {}} />
    );

    const nextButton = screen.getByRole("button", { name: /next clip/i });
    expect(nextButton).toBeDisabled();
  });

  it("renders progress bar segments for each clip", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={1} onClipChange={() => {}} />
    );

    // Should have buttons for each clip in the progress bar
    const progressButtons = screen.getAllByRole("button", { name: /go to clip/i });
    expect(progressButtons.length).toBe(3);
  });
});
