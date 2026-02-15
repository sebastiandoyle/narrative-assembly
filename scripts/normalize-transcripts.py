#!/usr/bin/env python3
"""
Convert VTT subtitle files (from yt-dlp) to the app's TranscriptFile JSON format.

Reads VTT + info.json files from the raw/ directory and writes normalized
JSON files to data/transcripts/.

Usage:
    python3 scripts/normalize-transcripts.py                      # Default directories
    python3 scripts/normalize-transcripts.py --input raw/ --output data/transcripts/
    python3 scripts/normalize-transcripts.py --help
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime


DEFAULT_INPUT = os.path.join(os.path.dirname(__file__), "..", "raw")
DEFAULT_OUTPUT = os.path.join(os.path.dirname(__file__), "..", "data", "transcripts")


def parse_vtt_timestamp(ts: str) -> float:
    """Convert VTT timestamp (HH:MM:SS.mmm) to seconds."""
    parts = ts.strip().split(":")
    if len(parts) == 3:
        h, m, s = parts
        return int(h) * 3600 + int(m) * 60 + float(s)
    elif len(parts) == 2:
        m, s = parts
        return int(m) * 60 + float(s)
    return float(parts[0])


def strip_vtt_tags(text: str) -> str:
    """Remove VTT formatting tags like <c>, </c>, <i>, etc."""
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_vtt_file(vtt_path: str) -> list[dict]:
    """Parse a VTT file into a list of segments."""
    with open(vtt_path, "r", encoding="utf-8") as f:
        content = f.read()

    segments = []
    # Match VTT cue blocks: timestamp --> timestamp followed by text
    pattern = r"(\d{1,2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}\.\d{3})\s*\n((?:(?!\n\n|\d{1,2}:\d{2}).+\n?)+)"
    matches = re.finditer(pattern, content)

    for match in matches:
        start = parse_vtt_timestamp(match.group(1))
        end = parse_vtt_timestamp(match.group(2))
        text = strip_vtt_tags(match.group(3).strip())

        if not text:
            continue

        dur = round(end - start, 3)
        if dur <= 0:
            continue

        segments.append({
            "start": round(start, 3),
            "dur": dur,
            "text": text,
        })

    return segments


def deduplicate_segments(segments: list[dict]) -> list[dict]:
    """Merge adjacent segments with identical or near-identical text."""
    if not segments:
        return segments

    deduped = [segments[0]]

    for seg in segments[1:]:
        prev = deduped[-1]
        # If text is identical or one contains the other, merge
        if seg["text"] == prev["text"]:
            # Extend duration to cover both
            prev["dur"] = round(seg["start"] + seg["dur"] - prev["start"], 3)
        elif seg["text"] in prev["text"]:
            # Skip subset
            continue
        else:
            deduped.append(seg)

    return deduped


def load_video_metadata(info_json_path: str) -> dict:
    """Load video metadata from yt-dlp's info.json file."""
    with open(info_json_path, "r", encoding="utf-8") as f:
        info = json.load(f)

    upload_date = info.get("upload_date", "")
    if upload_date and len(upload_date) == 8:
        published = f"{upload_date[:4]}-{upload_date[4:6]}-{upload_date[6:8]}"
    else:
        published = datetime.now().strftime("%Y-%m-%d")

    return {
        "videoId": info.get("id", ""),
        "title": info.get("title", "Unknown"),
        "publishedAt": published,
        "channel": info.get("channel", info.get("uploader", "Unknown")),
        "durationSeconds": info.get("duration", 0),
    }


def normalize_transcript(vtt_path: str, info_json_path: str) -> dict:
    """Create a TranscriptFile from VTT and info.json files."""
    segments = parse_vtt_file(vtt_path)
    segments = deduplicate_segments(segments)

    if os.path.exists(info_json_path):
        metadata = load_video_metadata(info_json_path)
    else:
        video_id = Path(vtt_path).stem.split(".")[0]
        metadata = {
            "videoId": video_id,
            "title": "Unknown",
            "publishedAt": datetime.now().strftime("%Y-%m-%d"),
            "channel": "Unknown",
            "durationSeconds": 0,
        }

    return {
        **metadata,
        "segments": segments,
    }


def build_manifest(transcripts: list[dict]) -> dict:
    """Build the manifest.json index."""
    return {
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "totalVideos": len(transcripts),
        "videos": [
            {
                "videoId": t["videoId"],
                "title": t["title"],
                "publishedAt": t["publishedAt"],
                "segmentCount": len(t["segments"]),
            }
            for t in transcripts
        ],
    }


def main():
    parser = argparse.ArgumentParser(
        description="Convert VTT subtitle files to app TranscriptFile JSON format"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        default=DEFAULT_INPUT,
        help=f"Input directory with VTT files (default: {DEFAULT_INPUT})"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=DEFAULT_OUTPUT,
        help=f"Output directory for JSON files (default: {DEFAULT_OUTPUT})"
    )

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input directory '{args.input}' does not exist.", file=sys.stderr)
        print("Run download-transcripts.py first.", file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.output, exist_ok=True)

    vtt_files = sorted(Path(args.input).glob("*.vtt"))
    if not vtt_files:
        print(f"No VTT files found in {args.input}", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(vtt_files)} VTT files in {args.input}")

    transcripts = []
    for vtt_path in vtt_files:
        video_id = vtt_path.stem.split(".")[0]
        info_json = vtt_path.parent / f"{video_id}.info.json"

        print(f"  Normalizing: {video_id}")
        transcript = normalize_transcript(str(vtt_path), str(info_json))
        transcripts.append(transcript)

        output_path = os.path.join(args.output, f"{video_id}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(transcript, f, indent=2, ensure_ascii=False)

    # Build and write manifest
    manifest = build_manifest(transcripts)
    manifest_path = os.path.join(args.output, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\nNormalized {len(transcripts)} transcripts to {args.output}")
    print(f"Manifest written to {manifest_path}")
    print(f"Total segments: {sum(len(t['segments']) for t in transcripts)}")


if __name__ == "__main__":
    main()
