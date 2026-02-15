import type { ExpandedKeyword } from "../lib/types";

const categoryColors: Record<string, string> = {
  primary: "bg-red-900/50 text-red-300 border-red-700",
  morphological: "bg-amber-900/50 text-amber-300 border-amber-700",
  synonym: "bg-blue-900/50 text-blue-300 border-blue-700",
  "co-occurring": "bg-emerald-900/50 text-emerald-300 border-emerald-700",
};

const categoryLabels: Record<string, string> = {
  primary: "Primary",
  morphological: "Morphological",
  synonym: "Synonym",
  "co-occurring": "Co-occurring",
};

interface KeywordBadgeProps {
  keyword: ExpandedKeyword;
}

export default function KeywordBadge({ keyword }: KeywordBadgeProps) {
  const colorClass = categoryColors[keyword.category] || categoryColors.primary;
  const label = categoryLabels[keyword.category] || keyword.category;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${colorClass}`}
      title={`Source: "${keyword.source}" | Weight: ${keyword.weight}`}
    >
      <span className="font-medium">{keyword.term}</span>
      <span className="opacity-60">{label}</span>
    </span>
  );
}
