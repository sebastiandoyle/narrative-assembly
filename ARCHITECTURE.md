# Architecture

Technical deep-dive into how Narrative Assembly works.

## System Overview

Narrative Assembly is a Next.js application that searches a corpus of BBC News YouTube transcripts using NLP-expanded keywords, then presents matched segments as a playable narrative sequence via YouTube embeds.

The system has two main phases:
1. **Data Pipeline** (offline) -- download, normalize, and index transcripts
2. **Runtime** (online) -- expand keywords, search corpus, present results

## Data Pipeline

### 1. Transcript Download (`scripts/download-transcripts.py`)

Uses yt-dlp to download auto-generated captions (VTT format) from BBC News YouTube videos.

```
BBC News YouTube Channel
        |
        | yt-dlp --write-auto-sub --sub-lang en --skip-download
        v
   raw/*.vtt files
```

VTT (Web Video Text Tracks) files contain timed subtitle segments:
```
00:00:04.200 --> 00:00:08.000
The government has announced sweeping
changes to immigration policy
```

### 2. Transcript Normalization (`scripts/normalize-transcripts.py`)

Converts VTT files into the app's JSON format (`TranscriptFile`):

```typescript
interface TranscriptFile {
  videoId: string;
  title: string;
  publishedAt: string;       // ISO date
  channel: string;
  durationSeconds: number;
  segments: TranscriptSegment[];
}

interface TranscriptSegment {
  start: number;    // seconds
  dur: number;      // seconds
  text: string;     // spoken text
}
```

The normalizer:
- Parses VTT timing format into numeric seconds
- Merges adjacent duplicate segments (auto-captions often repeat)
- Strips formatting tags (`<c>`, `<i>`, etc.)
- Extracts video metadata from filenames and yt-dlp JSON

### 3. Co-occurrence Index (`scripts/build-co-occurrence.ts`)

Analyzes the full transcript corpus to build a statistical co-occurrence index. For every significant term in the corpus, it records which other terms frequently appear nearby (within a sliding window).

```typescript
interface CoOccurrenceIndex {
  [term: string]: { term: string; score: number }[];
}
```

Example output:
```json
{
  "immigration": [
    { "term": "borders", "score": 0.89 },
    { "term": "asylum", "score": 0.85 },
    { "term": "visa", "score": 0.78 }
  ]
}
```

This powers the "co-occurring" category in keyword expansion.

## Runtime: Keyword Expansion

When a user searches, the query goes through four expansion stages:

### Stage 1: Primary (weight 1.0)

The user's exact search terms, normalized to lowercase.

### Stage 2: Morphological (weight 0.7)

Using compromise NLP, each term is expanded to its root form and conjugations:

```
"immigrants" → "immigrant", "immigrate", "immigrating", "immigration"
```

This uses compromise's `.root()`, `.conjugate()`, and related methods to generate morphological variants without requiring a large dictionary.

### Stage 3: Synonyms (weight 0.5)

A curated synonym map provides semantic equivalents for common news terms:

```
"immigration" → "migration", "migrants"
"crisis" → "emergency", "catastrophe"
```

These are intentionally conservative -- only high-confidence synonyms are included to avoid false matches.

### Stage 4: Co-occurring (weight 0.3)

Terms from the co-occurrence index that statistically appear alongside the query terms in the BBC News corpus:

```
"immigration" → "borders" (0.89), "asylum" (0.85), "visa" (0.78)
```

The co-occurrence score is multiplied by the base weight (0.3), so a term with co-occurrence score 0.89 gets final weight 0.267.

### Weight Rationale

The weights are designed so that:
- Direct keyword matches dominate results
- Morphological variants catch inflected forms without diluting relevance
- Synonyms broaden recall moderately
- Co-occurring terms surface contextually related clips without overwhelming primary matches

## Runtime: Transcript Search

### Scoring Algorithm

Each transcript segment is scored against the expanded keyword set:

```
segment_score = sum(
  for each expanded keyword that appears in segment.text:
    keyword.weight * (1 / sqrt(segment_position))
)
```

The position factor slightly favors segments near the start of videos, where key claims tend to appear (the "inverted pyramid" of news writing).

### Deduplication

Adjacent segments from the same video are merged if they're within 5 seconds of each other, preventing the same clip from appearing multiple times with slight offset.

### Result Shape

```typescript
interface ClipMatch {
  videoId: string;
  videoTitle: string;
  publishedAt: string;
  startTime: number;      // seconds
  endTime: number;        // seconds
  text: string;           // matched transcript text
  score: number;          // relevance score
  matchedKeywords: string[];
}
```

## YouTube Embed Approach

Matched clips are rendered as YouTube iframe embeds with precise timing parameters:

```
https://www.youtube.com/embed/{videoId}?start={startTime}&end={endTime}&autoplay=0
```

Key considerations:
- **Start/End Precision**: YouTube's iframe API supports second-level precision for start times. End times are advisory (the player will continue past them), so the UI handles advancement to the next clip.
- **No Download Required**: The app never downloads or hosts video content. All playback happens through YouTube's embed player, respecting the original content creator's rights.
- **Lazy Loading**: Embeds use `loading="lazy"` to avoid loading all iframes simultaneously.

## Reddit Topics Integration

The `/api/reddit-topics` endpoint fetches trending posts from UK news subreddits (r/unitedkingdom, r/ukpolitics, etc.) via Reddit's public JSON API.

Topics are extracted from post titles using compromise NLP to identify the key noun phrase, then presented as one-click search suggestions.

Results are cached server-side (5-minute TTL) to avoid hitting Reddit's rate limits.

## API Routes

### POST /api/search

```typescript
// Request
{ query: string; maxClips?: number }

// Response
{
  success: true,
  data: {
    query: string;
    expandedKeywords: ExpandedKeyword[];
    clips: ClipMatch[];
    searchTimeMs: number;
  }
}
```

### GET /api/reddit-topics

```typescript
// Response
{
  success: true,
  topics: RedditTopic[];
  cached: boolean;
}
```

## Performance

- **Corpus size**: The transcript corpus is loaded into memory at startup (~5 sample videos, expandable to hundreds)
- **Search time**: Typically < 50ms for the sample corpus
- **Keyword expansion**: ~10ms (compromise NLP is fast for single-term operations)
- **No database**: All data is JSON files read from disk, keeping the architecture simple and deployable as a static-ish Next.js app
