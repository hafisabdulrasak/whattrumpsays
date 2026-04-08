import Link from "next/link";

export function Hero() {
  return (
    <section style={{ backgroundImage: "var(--hero-overlay), linear-gradient(180deg, var(--bg-muted) 0%, var(--surface) 100%)" }} className="rounded-3xl border border-[var(--border)] p-8 shadow-[var(--shadow-soft)] md:p-12">
      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Live Archive Interface</p>
      <h1 className="text-4xl font-black leading-tight text-[var(--text-primary)] md:text-6xl">What Trump Says</h1>
      <p className="mt-4 max-w-2xl text-lg text-secondary">
        A reverse-chronological archive of Donald Trump’s public posts.
      </p>
      <p className="mt-5 max-w-3xl text-sm text-muted">
        This interface aggregates official and public archival sources, preserves source provenance, and labels every entry by origin.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link href="/timeline" className="focus-ring button-gold rounded-md px-5 py-2 text-sm font-semibold transition">
          Start Reading
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--error)]" aria-hidden />
          Newest posts auto-prioritized
        </div>
      </div>
    </section>
  );
}
