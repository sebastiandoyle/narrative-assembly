#!/usr/bin/env bash
#
# Narrative Assembly — Full Data Pipeline
#
# Downloads BBC News YouTube transcripts, normalizes them to app format,
# and builds the co-occurrence index.
#
# Usage:
#   ./scripts/seed.sh              # Run full pipeline
#   ./scripts/seed.sh --count 100  # Download 100 videos instead of default 50
#
# Prerequisites:
#   - Python 3.8+
#   - yt-dlp (pip install yt-dlp)
#   - Node.js 18+ with npx
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RAW_DIR="$PROJECT_DIR/raw"

# Pass through any arguments (e.g., --count 100) to download script
DOWNLOAD_ARGS=("$@")

echo "============================================"
echo "  Narrative Assembly — Data Pipeline"
echo "============================================"
echo ""

# Step 1: Download transcripts
echo "[1/3] Downloading BBC News transcripts..."
echo "----------------------------------------------"
python3 "$SCRIPT_DIR/download-transcripts.py" --output "$RAW_DIR" "${DOWNLOAD_ARGS[@]}"
echo ""

# Step 2: Normalize to app format
echo "[2/3] Normalizing transcripts to JSON..."
echo "----------------------------------------------"
python3 "$SCRIPT_DIR/normalize-transcripts.py" --input "$RAW_DIR" --output "$PROJECT_DIR/data/transcripts"
echo ""

# Step 3: Build co-occurrence index
echo "[3/3] Building co-occurrence index..."
echo "----------------------------------------------"
cd "$PROJECT_DIR"
npx tsx "$SCRIPT_DIR/build-co-occurrence.ts"
echo ""

echo "============================================"
echo "  Pipeline complete!"
echo ""
echo "  Transcripts: $PROJECT_DIR/data/transcripts/"
echo "  Co-occurrence: $PROJECT_DIR/data/co-occurrence.json"
echo ""
echo "  Start the app with: npm run dev"
echo "============================================"
