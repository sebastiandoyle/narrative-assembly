"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ClipMatch } from "../lib/types";

interface NarrativePlayerProps {
  clips: ClipMatch[];
  activeIndex: number;
  onClipChange: (index: number) => void;
}

export default function NarrativePlayer({
  clips,
  activeIndex,
  onClipChange,
}: NarrativePlayerProps) {
  const [isAutoAdvance, setIsAutoAdvance] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const clip = clips[activeIndex];
  if (!clip) return null;

  const duration = clip.endTime - clip.startTime;
  const remaining = Math.max(0, Math.ceil(duration - elapsed));
  const progress = Math.min(1, elapsed / duration);

  const advanceClip = useCallback(() => {
    if (activeIndex < clips.length - 1) {
      onClipChange(activeIndex + 1);
    } else {
      setIsAutoAdvance(false);
    }
  }, [activeIndex, clips.length, onClipChange]);

  // Reset elapsed when clip changes
  useEffect(() => {
    setElapsed(0);
    startTimeRef.current = Date.now();
  }, [activeIndex]);

  // Auto-advance timer with smooth elapsed tracking
  useEffect(() => {
    if (!isAutoAdvance) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - elapsed * 1000;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const newElapsed = (now - startTimeRef.current) / 1000;
      setElapsed(newElapsed);
      if (newElapsed >= duration) {
        advanceClip();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, isAutoAdvance, duration, advanceClip]);

  // When auto-advance is on: clip plays within start/end bounds
  // When stopped: remove &end= so full video plays from current position
  const youtubeUrl = isAutoAdvance
    ? `https://www.youtube.com/embed/${clip.videoId}?start=${Math.floor(clip.startTime)}&end=${Math.ceil(clip.endTime)}&autoplay=1&rel=0&modestbranding=1`
    : `https://www.youtube.com/embed/${clip.videoId}?start=${Math.floor(clip.startTime)}&autoplay=1&rel=0&modestbranding=1`;

  const handleKeepWatching = () => {
    setIsAutoAdvance(false);
  };

  const handleResumeAutoAdvance = () => {
    setIsAutoAdvance(true);
    setElapsed(0);
    startTimeRef.current = Date.now();
  };

  return (
    <div className="space-y-3">
      {/* Video with countdown overlay */}
      <div className="relative rounded-lg overflow-hidden border border-zinc-800">
        <div className="youtube-container">
          <iframe
            key={`${clip.videoId}-${clip.startTime}-${isAutoAdvance}`}
            src={youtubeUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={clip.videoTitle}
          />
        </div>

        {/* Netflix-style countdown overlay — only in auto-advance mode */}
        {isAutoAdvance && (
          <div className="absolute bottom-0 left-0 right-0">
            {/* Progress bar filling up */}
            <div className="h-1 bg-zinc-800/80">
              <div
                className="h-full bg-bbc-red transition-all duration-100 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Countdown strip */}
            <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white font-mono text-lg font-bold tabular-nums">
                  {remaining}s
                </span>
                <span className="text-zinc-300 text-sm">
                  until next clip
                </span>
              </div>
              <button
                onClick={handleKeepWatching}
                className="px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-md hover:bg-zinc-200 transition-colors"
                aria-label="Stop auto-advance and keep watching"
              >
                Keep watching
              </button>
            </div>
          </div>
        )}

        {/* "Stopped" state — show resume option */}
        {!isAutoAdvance && activeIndex < clips.length - 1 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-4 py-3 flex items-center justify-between">
              <span className="text-zinc-400 text-sm">
                Auto-advance paused — watching full video
              </span>
              <button
                onClick={handleResumeAutoAdvance}
                className="px-5 py-2.5 bg-bbc-red text-white font-semibold text-sm rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                aria-label="Resume auto-advance"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Resume clips
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeIndex > 0) {
                setIsAutoAdvance(true);
                onClipChange(activeIndex - 1);
              }
            }}
            disabled={activeIndex === 0}
            className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous clip"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
            </svg>
          </button>

          <span className="text-sm text-zinc-400 font-mono">
            {activeIndex + 1} / {clips.length}
          </span>

          <button
            onClick={() => {
              if (activeIndex < clips.length - 1) {
                setIsAutoAdvance(true);
                onClipChange(activeIndex + 1);
              }
            }}
            disabled={activeIndex === clips.length - 1}
            className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next clip"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-zinc-500 truncate max-w-xs">
          {clip.videoTitle}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1">
        {clips.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoAdvance(true);
              onClipChange(i);
            }}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i === activeIndex
                ? "bg-bbc-red"
                : i < activeIndex
                ? "bg-zinc-600"
                : "bg-zinc-800"
            }`}
            aria-label={`Go to clip ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
