# Narrative Assembly

[![CI](https://github.com/sebastiandoyle/narrative-assembly/actions/workflows/ci.yml/badge.svg)](https://github.com/sebastiandoyle/narrative-assembly/actions/workflows/ci.yml)

**An interactive tool that demonstrates how narratives can be mechanically assembled from real media clips.**

Type a topic. Watch as the system searches real BBC News transcripts, expands your keywords through NLP, and stitches together a sequence of clips that construct an apparent narrative -- all from segments that were originally spoken in completely different contexts.

This is not a news aggregator. It is an educational demonstration of how selective clipping, keyword expansion, and relevance scoring can manufacture coherent-seeming stories from fragments of real journalism.

## Why This Exists

Every day, social media accounts and partisan outlets build narratives by cherry-picking clips from legitimate news sources. A 4-second quote about immigration placed next to a 6-second quote about crime creates an implication that neither journalist intended.

Narrative Assembly makes this mechanic visible. By letting you assemble your own narratives from real BBC News transcripts, it exposes how easy -- and how mechanical -- the process actually is.

The tool is deliberately transparent: it shows you the keyword expansion, the relevance scores, the source videos, and the timestamps. Nothing is hidden. The point is to make the machinery legible.

## How It Works

```
  Your query: "immigration crisis"
        |
        v
  +-----------------+
  | Keyword Expand  |  compromise NLP: stem, synonymize, co-occurrence lookup
  +-----------------+
        |
        |  "immigration" (1.0), "immigrate" (0.7), "migrants" (0.5),
        |  "borders" (0.3), "asylum" (0.3), "visa" (0.3) ...
        v
  +-----------------+
  | Search Corpus   |  Score each transcript segment against expanded keywords
  +-----------------+
        |
        v
  +-----------------+
  | Rank & Clip     |  Sort by score, deduplicate, select top matches
  +-----------------+
        |
        v
  +-----------------+
  | Narrative View  |  YouTube embeds with precise start/end timestamps
  +-----------------+
```

1. **Keyword Expansion** -- Your search terms are expanded using [compromise](https://github.com/spencermountain/compromise) NLP into four weighted categories:
   - **Primary** (1.0): your exact terms
   - **Morphological** (0.7): stems and conjugations (`immigrate`, `immigrating`)
   - **Synonyms** (0.5): semantic equivalents (`migrants`, `migration`)
   - **Co-occurring** (0.3): terms that statistically appear alongside yours in the corpus (`borders`, `asylum`, `visa`)

2. **Weighted Search** -- Every transcript segment is scored against expanded keywords. Segments matching primary terms score highest; co-occurring matches contribute less but still surface relevant context.

3. **Narrative Player** -- Matched clips are presented as a sequence of YouTube embeds, each starting and ending at the exact timestamp of the matched segment. Watch them in sequence, and a narrative emerges -- one that was never intended by the original journalists.

## Architecture

```
narrative-assembly/
  data/
    transcripts/          # BBC News transcript JSON files
      manifest.json       # Index of all available transcripts
      {videoId}.json      # Individual transcript with timed segments
    co-occurrence.json    # Term co-occurrence index
  lib/
    types.ts              # Shared TypeScript type definitions
  src/
    app/
      api/                # Next.js API routes
        search/           # POST /api/search -- keyword search endpoint
        reddit-topics/    # GET /api/reddit-topics -- trending topic feed
      page.tsx            # Main UI: search + narrative player
      layout.tsx          # Root layout with fonts/metadata
  scripts/                # Data pipeline scripts
  __tests__/              # Vitest test suite
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deep technical dive.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Python 3.8+ (for data pipeline scripts only)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for downloading transcripts)

### Installation

```bash
git clone https://github.com/sebastiandoyle/narrative-assembly.git
cd narrative-assembly
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

## Data Pipeline

The app ships with sample transcript data. To build a fresh corpus from real BBC News videos:

```bash
# Full pipeline: download → normalize → build co-occurrence index
./scripts/seed.sh

# Or run steps individually:
python3 scripts/download-transcripts.py          # Download VTT captions
python3 scripts/normalize-transcripts.py          # Convert to app JSON format
npx tsx scripts/build-co-occurrence.ts            # Build term co-occurrence index
```

See each script's `--help` flag for options.

## How to Use

1. **Search** -- Type any topic into the search bar. Try broad topics like "immigration", "NHS", or "climate change".
2. **Explore expansions** -- See how your query is expanded into weighted keyword categories.
3. **Watch the narrative** -- Play the matched clips in sequence. Notice how clips from different videos, recorded weeks apart, create an apparent through-line.
4. **Reflect** -- Consider: if a tool can assemble this narrative mechanically in seconds, how much easier is it for someone with editorial intent?

### Trending Topics

The sidebar pulls trending topics from Reddit's UK news communities, giving you one-click access to search terms that are currently in public discourse.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **NLP**: [compromise](https://github.com/spencermountain/compromise) -- lightweight NLP for keyword expansion
- **Testing**: [Vitest](https://vitest.dev) + Testing Library
- **Deployment**: [Vercel](https://vercel.com)

## License

[MIT](./LICENSE) -- Sebastian Doyle, 2026
