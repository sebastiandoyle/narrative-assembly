import Link from "next/link";
import Footer from "../../../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="pt-16 pb-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &larr; Back to search
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mt-4">
            How <span className="text-bbc-red">Narrative Assembly</span> Works
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 pb-16">
        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <p className="text-lg text-zinc-300 leading-relaxed">
              Narrative Assembly is an educational tool that reveals how a major
              news organisation covers different topics. It does this by
              searching through real BBC News YouTube transcripts and assembling
              relevant clips into a playable narrative thread.
            </p>
          </section>

          {/* Step-by-step */}
          <section className="space-y-8">
            <h2 className="text-xl font-semibold text-zinc-200">
              The Assembly Pipeline
            </h2>

            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bbc-red flex items-center justify-center font-bold text-white">
                1
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200 mb-1">
                  Transcript Collection
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  We download auto-generated subtitles from BBC News YouTube
                  videos using yt-dlp. Each transcript is stored with its video
                  metadata: title, publish date, and timing information for every
                  spoken segment.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bbc-red flex items-center justify-center font-bold text-white">
                2
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200 mb-1">
                  Keyword Expansion
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your search query is expanded beyond exact matches. We
                  generate morphological variants (e.g. &ldquo;climate&rdquo;
                  &rarr; &ldquo;climatic&rdquo;), find synonyms (e.g.
                  &ldquo;immigration&rdquo; &rarr; &ldquo;migration&rdquo;), and
                  discover co-occurring terms that appear alongside your topic in
                  BBC coverage. Each expansion category has a different search
                  weight to keep primary matches most prominent.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bbc-red flex items-center justify-center font-bold text-white">
                3
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200 mb-1">
                  Weighted Search
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Every transcript segment is scored against all expanded
                  keywords. Primary keywords contribute a weight of 1.0,
                  morphological variants 0.7, synonyms 0.5, and co-occurring
                  terms 0.3. Segments with multiple keyword matches receive
                  higher scores, surfacing the most relevant moments.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bbc-red flex items-center justify-center font-bold text-white">
                4
              </div>
              <div>
                <h3 className="font-semibold text-zinc-200 mb-1">
                  Narrative Assembly
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  The top-scoring clips are assembled into a playable sequence.
                  You can watch them as a continuous narrative thread, seeing how
                  the BBC frames a topic across different videos, reporters, and
                  timeframes. Each clip links directly to the original YouTube
                  video at the exact timestamp.
                </p>
              </div>
            </div>
          </section>

          {/* Educational purpose */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-200 mb-3">
              Why This Matters
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Understanding how news organisations cover topics is a key part of
              media literacy. By making the search and assembly process
              transparent &mdash; showing you the keyword expansions, search
              weights, and matching scores &mdash; Narrative Assembly helps you
              see the mechanics behind media coverage patterns rather than just
              consuming the output.
            </p>
          </section>

          {/* Technical details */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-200 mb-3">
              Technical Details
            </h2>
            <ul className="space-y-2 text-zinc-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-bbc-red mt-1">&#x2022;</span>
                <span>
                  Built with Next.js, TypeScript, and Tailwind CSS
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bbc-red mt-1">&#x2022;</span>
                <span>
                  Natural language processing via compromise.js for keyword
                  expansion
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bbc-red mt-1">&#x2022;</span>
                <span>
                  Transcript data from BBC News YouTube via yt-dlp
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bbc-red mt-1">&#x2022;</span>
                <span>
                  No external APIs or AI models &mdash; all search logic is
                  deterministic and runs locally
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-bbc-red mt-1">&#x2022;</span>
                <span>
                  Reddit integration for trending UK news topics
                </span>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
