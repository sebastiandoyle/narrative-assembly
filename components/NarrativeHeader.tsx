interface NarrativeHeaderProps {
  topic: string;
  clipCount: number;
  searchTimeMs: number;
}

export default function NarrativeHeader({
  topic,
  clipCount,
  searchTimeMs,
}: NarrativeHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-100">
        What is the BBC saying about{" "}
        <span className="text-bbc-red">{topic}</span>?
      </h2>
      <p className="text-sm text-zinc-500 mt-2">
        {clipCount} clip{clipCount !== 1 ? "s" : ""} assembled in{" "}
        {searchTimeMs}ms
      </p>
    </div>
  );
}
