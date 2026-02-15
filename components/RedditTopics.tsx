"use client";

import { useEffect, useState } from "react";
import type { RedditTopic, RedditTopicsResponse } from "../lib/types";

interface RedditTopicsProps {
  onSelectTopic: (topic: string) => void;
}

export default function RedditTopics({ onSelectTopic }: RedditTopicsProps) {
  const [topics, setTopics] = useState<RedditTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("/api/reddit-topics");
        const data = await res.json();
        if (data.success) {
          setTopics((data as RedditTopicsResponse).topics);
        } else {
          setError(data.error || "Failed to load topics");
        }
      } catch {
        setError("Failed to fetch trending topics");
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-500 text-sm">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
        Loading trending topics...
      </div>
    );
  }

  if (error || topics.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
        Trending in UK Politics
      </p>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic.url}
            onClick={() => onSelectTopic(topic.extractedTopic)}
            className="px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700 hover:border-bbc-red hover:text-white transition-colors max-w-[200px] truncate"
            title={topic.title}
          >
            {topic.extractedTopic}
          </button>
        ))}
      </div>
    </div>
  );
}
