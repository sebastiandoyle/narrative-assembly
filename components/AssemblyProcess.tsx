"use client";

import { useState } from "react";
import type { SearchResult } from "../lib/types";
import KeywordBadge from "./KeywordBadge";

interface AssemblyProcessProps {
  result: SearchResult;
}

export default function AssemblyProcess({ result }: AssemblyProcessProps) {
  const [isOpen, setIsOpen] = useState(false);

  const primaryKeywords = result.expandedKeywords.filter(
    (k) => k.category === "primary"
  );
  const morphKeywords = result.expandedKeywords.filter(
    (k) => k.category === "morphological"
  );
  const synKeywords = result.expandedKeywords.filter(
    (k) => k.category === "synonym"
  );
  const coKeywords = result.expandedKeywords.filter(
    (k) => k.category === "co-occurring"
  );

  // Count unique videos matched
  const uniqueVideos = new Set(result.clips.map((c) => c.videoId)).size;

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-bbc-red"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="font-medium text-zinc-200">
            How was this narrative assembled?
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-zinc-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-800 p-4 space-y-6 bg-zinc-900/30">
          {/* Step 1: Query parsing */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Step 1: Query Parsing
            </h4>
            <p className="text-sm text-zinc-400">
              Your query <span className="text-white font-medium">&ldquo;{result.query}&rdquo;</span>{" "}
              was split into primary keywords:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {primaryKeywords.map((kw) => (
                <KeywordBadge key={kw.term} keyword={kw} />
              ))}
            </div>
          </div>

          {/* Step 2: Keyword expansion */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Step 2: Keyword Expansion
            </h4>
            <p className="text-sm text-zinc-400 mb-2">
              Each keyword was expanded using morphological variants, synonyms,
              and co-occurrence data to catch related coverage.
            </p>

            {morphKeywords.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-zinc-500 mb-1">
                  Morphological variants (weight: 0.7):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {morphKeywords.map((kw) => (
                    <KeywordBadge key={kw.term} keyword={kw} />
                  ))}
                </div>
              </div>
            )}

            {synKeywords.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-zinc-500 mb-1">
                  Synonyms (weight: 0.5):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {synKeywords.map((kw) => (
                    <KeywordBadge key={kw.term} keyword={kw} />
                  ))}
                </div>
              </div>
            )}

            {coKeywords.length > 0 && (
              <div>
                <p className="text-xs text-zinc-500 mb-1">
                  Co-occurring terms (weight: 0.3):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {coKeywords.map((kw) => (
                    <KeywordBadge key={kw.term} keyword={kw} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Transcript search */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Step 3: Transcript Search
            </h4>
            <p className="text-sm text-zinc-400">
              Searched across transcripts and found{" "}
              <span className="text-white font-medium">
                {result.clips.length} matching clips
              </span>{" "}
              from{" "}
              <span className="text-white font-medium">
                {uniqueVideos} different videos
              </span>
              . Clips are scored by keyword weight and match density, then ranked
              by relevance.
            </p>
          </div>

          {/* Step 4: Assembly */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Step 4: Narrative Assembly
            </h4>
            <p className="text-sm text-zinc-400">
              The top clips were ordered chronologically and assembled into a
              playable narrative thread. Each clip links directly to the relevant
              section of the original BBC video.
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-200">
                {result.expandedKeywords.length}
              </p>
              <p className="text-xs text-zinc-500">Keywords searched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-200">{uniqueVideos}</p>
              <p className="text-xs text-zinc-500">Videos matched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-200">
                {result.searchTimeMs}ms
              </p>
              <p className="text-xs text-zinc-500">Search time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
