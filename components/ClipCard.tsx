import type { ClipMatch } from "../lib/types";

interface ClipCardProps {
  clip: ClipMatch;
  index: number;
  isActive?: boolean;
  onClick?: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ClipCard({
  clip,
  index,
  isActive,
  onClick,
}: ClipCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isActive
          ? "bg-zinc-800 border-bbc-red shadow-lg shadow-red-900/20"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            isActive
              ? "bg-bbc-red text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-zinc-200 truncate">
            {clip.videoTitle}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {formatTime(clip.startTime)} – {formatTime(clip.endTime)} &middot;{" "}
            {clip.publishedAt}
          </p>
          <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
            &ldquo;{clip.text}&rdquo;
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-zinc-500">
              Score: {clip.score.toFixed(2)}
            </span>
            <div className="flex gap-1 flex-wrap">
              {clip.matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${clip.videoId}&t=${Math.floor(clip.startTime)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors mt-2 inline-flex items-center gap-1"
          >
            Watch full video &rarr;
          </a>
        </div>
      </div>
    </button>
  );
}
