#!/usr/bin/env python3
"""
Download YouTube auto-captions (VTT format) for BBC News videos.

Requires: yt-dlp (pip install yt-dlp)

Usage:
    python3 scripts/download-transcripts.py                    # Default: 50 latest BBC News videos
    python3 scripts/download-transcripts.py --count 100        # Download 100 videos
    python3 scripts/download-transcripts.py --output raw/      # Custom output directory
    python3 scripts/download-transcripts.py --help
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


BBC_NEWS_CHANNEL = "https://www.youtube.com/@BBCNews/videos"

DEFAULT_OUTPUT = os.path.join(os.path.dirname(__file__), "..", "raw")
DEFAULT_COUNT = 50


def check_ytdlp():
    """Verify yt-dlp is installed."""
    try:
        subprocess.run(["yt-dlp", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("Error: yt-dlp is not installed.", file=sys.stderr)
        print("Install it with: pip install yt-dlp", file=sys.stderr)
        sys.exit(1)


def download_captions(output_dir: str, count: int, channel_url: str):
    """Download auto-generated English captions for BBC News videos."""
    os.makedirs(output_dir, exist_ok=True)

    print(f"Downloading captions for up to {count} videos from {channel_url}")
    print(f"Output directory: {output_dir}")

    cmd = [
        "yt-dlp",
        "--write-auto-sub",
        "--sub-lang", "en",
        "--sub-format", "vtt",
        "--skip-download",
        "--write-info-json",
        "--playlist-end", str(count),
        "--output", os.path.join(output_dir, "%(id)s.%(ext)s"),
        "--no-overwrites",
        channel_url,
    ]

    print(f"\nRunning: {' '.join(cmd)}\n")

    result = subprocess.run(cmd, capture_output=False)

    if result.returncode != 0:
        print(f"\nyt-dlp exited with code {result.returncode}", file=sys.stderr)
        print("Some videos may not have auto-captions available.", file=sys.stderr)

    # Count downloaded files
    vtt_files = list(Path(output_dir).glob("*.vtt"))
    json_files = list(Path(output_dir).glob("*.info.json"))

    print(f"\nDownloaded {len(vtt_files)} VTT caption files")
    print(f"Downloaded {len(json_files)} metadata files")

    return vtt_files


def main():
    parser = argparse.ArgumentParser(
        description="Download BBC News YouTube auto-captions (VTT format)"
    )
    parser.add_argument(
        "--count", "-n",
        type=int,
        default=DEFAULT_COUNT,
        help=f"Number of videos to download (default: {DEFAULT_COUNT})"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=DEFAULT_OUTPUT,
        help=f"Output directory for VTT files (default: {DEFAULT_OUTPUT})"
    )
    parser.add_argument(
        "--channel",
        type=str,
        default=BBC_NEWS_CHANNEL,
        help=f"YouTube channel URL (default: BBC News)"
    )

    args = parser.parse_args()

    check_ytdlp()
    vtt_files = download_captions(args.output, args.count, args.channel)

    if not vtt_files:
        print("\nNo captions downloaded. Try a different channel or check your network.")
        sys.exit(1)

    print(f"\nDone. Run normalize-transcripts.py next to convert to app format.")


if __name__ == "__main__":
    main()
