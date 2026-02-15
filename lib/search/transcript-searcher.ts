import type {
  ExpandedKeyword,
  ClipMatch,
  TranscriptFile,
  TranscriptManifest,
} from "../types";
import fs from "fs";
import path from "path";

const TRANSCRIPT_DIR = path.join(process.cwd(), "data", "transcripts");

/**
 * Load the transcript manifest.
 */
export function loadManifest(): TranscriptManifest {
  const manifestPath = path.join(TRANSCRIPT_DIR, "manifest.json");
  const raw = fs.readFileSync(manifestPath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Load a single transcript file by video ID.
 */
export function loadTranscript(videoId: string): TranscriptFile | null {
  const filePath = path.join(TRANSCRIPT_DIR, `${videoId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Load all transcripts from disk.
 */
export function loadAllTranscripts(): TranscriptFile[] {
  const manifest = loadManifest();
  const transcripts: TranscriptFile[] = [];
  for (const video of manifest.videos) {
    const t = loadTranscript(video.videoId);
    if (t) transcripts.push(t);
  }
  return transcripts;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesWholeWord(text: string, term: string): boolean {
  const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
  return regex.test(text);
}

/**
 * Search transcripts for segments matching the expanded keywords.
 * Each segment is scored by the weighted sum of matching keywords.
 * Results are deduplicated (overlapping clips from same video merged)
 * and sorted by score descending.
 *
 * @param transcripts - Array of transcript files to search through
 * @param keywords - Expanded keywords with weights
 * @param maxClips - Maximum number of clips to return (default 15)
 */
export function searchTranscripts(
  transcripts: TranscriptFile[],
  keywords: ExpandedKeyword[],
  maxClips: number = 15
): ClipMatch[] {
  const allMatches: ClipMatch[] = [];

  for (const transcript of transcripts) {
    for (const segment of transcript.segments) {
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const kw of keywords) {
        if (kw.term && matchesWholeWord(segment.text, kw.term)) {
          score += kw.weight;
          matchedKeywords.push(kw.term);
        }
      }

      if (score > 0) {
        allMatches.push({
          videoId: transcript.videoId,
          videoTitle: transcript.title,
          publishedAt: transcript.publishedAt,
          startTime: Math.max(0, segment.start - 2), // 2s lead-in for context
          endTime: segment.start + segment.dur + 2, // 2s trail for context
          text: segment.text,
          score,
          matchedKeywords,
        });
      }
    }
  }

  // Sort by score descending
  allMatches.sort((a, b) => b.score - a.score);

  // Deduplicate overlapping clips from the same video
  const deduped = deduplicateClips(allMatches);

  return deduped.slice(0, maxClips);
}

/**
 * Remove overlapping clips from the same video.
 * When two clips from the same video overlap in time,
 * keep the higher-scoring one.
 */
function deduplicateClips(clips: ClipMatch[]): ClipMatch[] {
  const result: ClipMatch[] = [];

  for (const clip of clips) {
    const overlaps = result.some(
      (existing) =>
        existing.videoId === clip.videoId &&
        existing.startTime < clip.endTime &&
        existing.endTime > clip.startTime
    );

    if (!overlaps) {
      result.push(clip);
    }
  }

  return result;
}
