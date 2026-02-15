// ============================================================
// Narrative Assembly — Shared Type Definitions
// ============================================================

/** A single subtitle segment from a BBC News YouTube video */
export interface TranscriptSegment {
  /** Start time in seconds */
  start: number;
  /** Duration in seconds */
  dur: number;
  /** The spoken text */
  text: string;
}

/** Metadata + transcript for one BBC News YouTube video */
export interface TranscriptFile {
  videoId: string;
  title: string;
  /** ISO date string (YYYY-MM-DD) */
  publishedAt: string;
  /** Channel name, e.g. "BBC News" */
  channel: string;
  /** Duration of the full video in seconds */
  durationSeconds: number;
  segments: TranscriptSegment[];
}

/** The manifest listing all available transcripts */
export interface TranscriptManifest {
  generatedAt: string;
  totalVideos: number;
  videos: {
    videoId: string;
    title: string;
    publishedAt: string;
    segmentCount: number;
  }[];
}

// --- Keyword Expansion ---

export type KeywordCategory =
  | "primary"
  | "morphological"
  | "synonym"
  | "co-occurring";

export interface ExpandedKeyword {
  term: string;
  category: KeywordCategory;
  /** Search weight: primary=1.0, morphological=0.7, synonym=0.5, co-occurring=0.3 */
  weight: number;
  /** Which original term produced this expansion */
  source: string;
}

// --- Search Results ---

export interface ClipMatch {
  videoId: string;
  videoTitle: string;
  publishedAt: string;
  /** Start time of the matching segment (seconds) */
  startTime: number;
  /** End time of the matching segment (seconds) */
  endTime: number;
  /** The matched transcript text */
  text: string;
  /** Relevance score (higher = more relevant) */
  score: number;
  /** Which keywords matched */
  matchedKeywords: string[];
}

export interface SearchResult {
  query: string;
  expandedKeywords: ExpandedKeyword[];
  clips: ClipMatch[];
  /** How long the search took in milliseconds */
  searchTimeMs: number;
}

// --- Reddit Topics ---

export interface RedditTopic {
  title: string;
  /** Extracted key phrase for search */
  extractedTopic: string;
  score: number;
  url: string;
  /** Number of comments */
  numComments: number;
}

// --- API Request/Response ---

export interface SearchRequest {
  query: string;
  /** Max clips to return (default 15) */
  maxClips?: number;
}

export interface SearchResponse {
  success: true;
  data: SearchResult;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface RedditTopicsResponse {
  success: true;
  topics: RedditTopic[];
  cached: boolean;
}

// --- Co-occurrence Index ---

export interface CoOccurrenceIndex {
  /** Map from term → array of co-occurring terms with scores */
  [term: string]: { term: string; score: number }[];
}

// --- Narrative Player ---

export interface NarrativeClip {
  videoId: string;
  title: string;
  startTime: number;
  endTime: number;
  text: string;
}
