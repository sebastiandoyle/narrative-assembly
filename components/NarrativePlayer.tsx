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
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const clip = clips[activeIndex];
  if (!clip) return null;

  const duration = clip.endTime - clip.startTime;

  const advanceClip = useCallback(() => {
    if (activeIndex < clips.length - 1) {
      onClipChange(activeIndex + 1);
    } else {
      setIsPlaying(false);
    }
  }, [activeIndex, clips.length, onClipChange]);

  // Auto-advance polling timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed >= duration) {
        advanceClip();
      }
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, isPlaying, duration, advanceClip]);


  const youtubeUrl = `https://www.youtube.com/embed/${clip.videoId}?start=${Math.floor(clip.startTime)}&end=${Math.ceil(clip.endTime)}&autoplay=1&rel=0&modestbranding=1`;

  return (
    <div className="space-y-4">
      <div className="youtube-container rounded-lg overflow-hidden border border-zinc-800">
        <iframe
          key={`${clip.videoId}-${clip.startTime}`}
          src={youtubeUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={clip.videoTitle}
        />
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeIndex > 0) onClipChange(activeIndex - 1);
            }}
            disabled={activeIndex === 0}
            className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous clip"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" />
            </svg>
          </button>

          <button
            onClick={() => setIsPlaying(prev => !prev)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label={isPlaying ? "Pause auto-advance" : "Resume auto-advance"}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <span className="text-sm text-zinc-400 font-mono">
            {activeIndex + 1} / {clips.length}
          </span>

          <button
            onClick={() => {
              if (activeIndex < clips.length - 1)
                onClipChange(activeIndex + 1);
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
            onClick={() => onClipChange(i)}
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
