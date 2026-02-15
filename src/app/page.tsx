"use client";

import { useState, useCallback } from "react";
import type { SearchResult } from "../../lib/types";
import TopicInput from "../../components/TopicInput";
import RedditTopics from "../../components/RedditTopics";
import NarrativeHeader from "../../components/NarrativeHeader";
import NarrativePlayer from "../../components/NarrativePlayer";
import ClipCard from "../../components/ClipCard";
import AssemblyProcess from "../../components/AssemblyProcess";
import Footer from "../../components/Footer";

export default function Home() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setActiveClipIndex(0);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, maxClips: 15 }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Search failed");
      }
    } catch {
      setError("Failed to connect to search API");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Hero */}
      <header className="pt-16 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-bbc-red">Narrative</span> Assembly
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-xl mx-auto">
            Explore how BBC News covers any topic by assembling narrative threads
            from real transcripts.
          </p>
        </div>
      </header>

      {/* Search area */}
      <section className="px-4 pb-6">
        <TopicInput onSearch={handleSearch} isLoading={isLoading} />
      </section>

      {/* Reddit trending topics */}
      {!result && !isLoading && (
        <section className="px-4 pb-8">
          <RedditTopics onSelectTopic={handleSearch} />
        </section>
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <div className="flex flex-col items-center gap-4 py-16">
            <svg
              className="animate-spin h-8 w-8 text-bbc-red"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-zinc-400">
              Expanding keywords and searching transcripts...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <main className="flex-1 max-w-5xl mx-auto px-4 w-full">
          <NarrativeHeader
            topic={result.query}
            clipCount={result.clips.length}
            searchTimeMs={result.searchTimeMs}
          />

          {result.clips.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-zinc-400 text-lg">
                No clips found for this topic.
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                Try a different search term or check trending topics.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player column */}
              <div className="lg:col-span-2 space-y-6">
                <NarrativePlayer
                  clips={result.clips}
                  activeIndex={activeClipIndex}
                  onClipChange={setActiveClipIndex}
                />
                <AssemblyProcess result={result} />
              </div>

              {/* Clip list column */}
              <div className="space-y-3 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                  Clip sequence
                </h3>
                {result.clips.map((clip, i) => (
                  <ClipCard
                    key={`${clip.videoId}-${clip.startTime}`}
                    clip={clip}
                    index={i}
                    isActive={i === activeClipIndex}
                    onClick={() => setActiveClipIndex(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      <Footer />
    </div>
  );
}
