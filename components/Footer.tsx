import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-16 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-500">
            <p>
              Narrative Assembly is an educational tool for media literacy.
            </p>
            <p className="mt-1">
              Not affiliated with the BBC. All content belongs to its respective
              owners.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link
              href="/about"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              How it works
            </Link>
            <a
              href="https://github.com/sebastiandoyle/narrative-assembly"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
