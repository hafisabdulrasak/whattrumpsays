import Link from "next/link";

export function Hero() {
  return (
    <section className="rounded-2xl border border-white/10 bg-hero-gradient p-8 shadow-panel md:p-12">
      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gold">Live Archive Interface</p>
      <h1 className="text-4xl font-black leading-tight text-parchment md:text-6xl">What Trump Says</h1>
      <p className="mt-4 max-w-2xl text-lg text-parchment/85">
        A reverse-chronological archive of Donald Trump’s public posts.
      </p>
      <p className="mt-5 max-w-3xl text-sm text-parchment/70">
        This interface aggregates official and public archival sources, preserves source provenance, and labels every entry by origin.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/timeline" className="focus-ring rounded-md bg-gold px-5 py-2 text-sm font-semibold text-obsidian transition hover:brightness-110">
          Start Reading
        </Link>
        <div className="flex items-center gap-2 text-xs text-parchment/70">
          <span className="h-2 w-2 animate-pulse rounded-full bg-crimson" aria-hidden />
          Newest posts auto-prioritized
        </div>
      </div>
    </section>
  );
}
