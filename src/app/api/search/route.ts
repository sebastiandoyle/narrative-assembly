import { NextRequest, NextResponse } from "next/server";
import { expandKeywords } from "@/lib/search/keyword-expander";
import { searchTranscripts } from "@/lib/search/transcript-searcher";
import type { SearchResponse, ErrorResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, maxClips = 15 } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      const error: ErrorResponse = {
        success: false,
        error: "Query is required and must be a non-empty string",
      };
      return NextResponse.json(error, { status: 400 });
    }

    const trimmedQuery = query.trim();
    const startTime = Date.now();

    // 1. Expand keywords
    const expandedKeywords = expandKeywords(trimmedQuery);

    // 2. Search transcripts
    const clips = searchTranscripts(expandedKeywords, maxClips);

    const searchTimeMs = Date.now() - startTime;

    const response: SearchResponse = {
      success: true,
      data: {
        query: trimmedQuery,
        expandedKeywords,
        clips,
        searchTimeMs,
      },
    };

    return NextResponse.json(response);
  } catch {
    const error: ErrorResponse = {
      success: false,
      error: "Internal server error during search",
    };
    return NextResponse.json(error, { status: 500 });
  }
}
