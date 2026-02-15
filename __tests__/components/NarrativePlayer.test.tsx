import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

  it("renders a 'Keep watching' button for stopping auto-advance", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    const keepWatchingButton = screen.getByRole("button", { name: /stop auto-advance/i });
    expect(keepWatchingButton).toBeInTheDocument();
  });

  it("shows 'Resume clips' after clicking 'Keep watching'", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    const keepWatchingButton = screen.getByRole("button", { name: /stop auto-advance/i });
    fireEvent.click(keepWatchingButton);
    expect(screen.getByRole("button", { name: /resume auto-advance/i })).toBeInTheDocument();
  });

  it("shows countdown text while auto-advancing", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    expect(screen.getByText(/until next clip/i)).toBeInTheDocument();
  });

  // --- 6 new tests ---

  it("iframe URL never contains &end=", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.src).not.toContain("&end=");
  });

  it("iframe does NOT remount on 'Keep watching' click", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={() => {}} />
    );

    const iframeBefore = document.querySelector("iframe");
    expect(iframeBefore).not.toBeNull();

    const keepWatchingButton = screen.getByRole("button", { name: /stop auto-advance/i });
    fireEvent.click(keepWatchingButton);

    const iframeAfter = document.querySelector("iframe");
    expect(iframeAfter).not.toBeNull();
    // Same DOM node — not remounted
    expect(iframeAfter).toBe(iframeBefore);
  });

  it("'Resume clips' calls onClipChange with next index", () => {
    const onClipChange = vi.fn();
    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={onClipChange} />
    );

    // Click "Keep watching" first to enter paused state
    fireEvent.click(screen.getByRole("button", { name: /stop auto-advance/i }));

    // Then click "Resume clips"
    fireEvent.click(screen.getByRole("button", { name: /resume auto-advance/i }));

    expect(onClipChange).toHaveBeenCalledWith(1);
  });

  it("timer auto-advances after clip duration", () => {
    vi.useFakeTimers();
    const onClipChange = vi.fn();

    render(
      <NarrativePlayer clips={mockClips} activeIndex={0} onClipChange={onClipChange} />
    );

    // Clip 0 duration is 7.5s. Advance past that.
    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(onClipChange).toHaveBeenCalledWith(1);

    vi.useRealTimers();
  });

  it("auto-advance stops at last clip", () => {
    vi.useFakeTimers();
    const onClipChange = vi.fn();

    render(
      <NarrativePlayer clips={mockClips} activeIndex={2} onClipChange={onClipChange} />
    );

    // Clip 2 duration is 7.9s. Advance past that.
    act(() => {
      vi.advanceTimersByTime(9000);
    });

    // Should NOT call onClipChange — it's the last clip
    expect(onClipChange).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("iframe start time matches clip.startTime", () => {
    render(
      <NarrativePlayer clips={mockClips} activeIndex={2} onClipChange={() => {}} />
    );

    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    // Clip 2 startTime is 4.2, Math.floor(4.2) = 4
    expect(iframe!.src).toContain("start=4");
  });
});
