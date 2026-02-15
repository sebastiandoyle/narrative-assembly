import { NextResponse } from "next/server";
import { fetchRedditTopics } from "@/lib/reddit/topics";
import type { ErrorResponse } from "@/lib/types";

export async function GET() {
  try {
    const topics = await fetchRedditTopics();

    return NextResponse.json({
      success: true,
      topics,
      cached: false,
    });
  } catch {
    const error: ErrorResponse = {
      success: false,
      error: "Failed to fetch Reddit topics",
    };
    return NextResponse.json(error, { status: 500 });
  }
}
