import Link from "next/link";

export function Hero() {
  return (
    <section
      style={{ backgroundImage: "var(--hero-overlay), linear-gradient(180deg, var(--bg-muted) 0%, var(--surface) 100%)" }}
      className="rounded-3xl border border-[var(--border)] p-4 shadow-[var(--shadow-soft)] sm:p-7 md:p-10"
    >
      <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[var(--accent)] sm:text-xs">Live Archive Interface</p>
      <h1 className="text-[1.9rem] font-black leading-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl lg:text-6xl">What Trump Says</h1>
      <p className="timeline-copy mt-3 text-base leading-7 text-secondary sm:mt-4 sm:text-lg">
        A reverse-chronological archive of Donald Trump’s public posts.
      </p>
      <p className="timeline-copy mt-4 text-sm leading-6 text-muted sm:mt-5">
        This interface aggregates official and public archival sources, preserves source provenance, and labels every entry by origin.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
        <Link href="/timeline" className="focus-ring button-gold inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2 text-sm font-semibold transition">
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
