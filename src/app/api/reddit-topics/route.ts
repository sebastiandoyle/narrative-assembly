import { NextResponse } from "next/server";
import { fetchRedditTopics } from "@/lib/reddit/topics";
import type { RedditTopicsResponse, ErrorResponse } from "@/lib/types";

export async function GET() {
  try {
    const { topics, cached } = await fetchRedditTopics();

    const response: RedditTopicsResponse = {
      success: true,
      topics,
      cached,
    };

    return NextResponse.json(response);
  } catch {
    const error: ErrorResponse = {
      success: false,
      error: "Failed to fetch Reddit topics",
    };
    return NextResponse.json(error, { status: 500 });
  }
}
