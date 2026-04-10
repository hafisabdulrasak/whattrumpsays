import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--bg-muted)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-secondary sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>What Trump Says aggregates publicly available posts with source labels and timestamps.</p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-3">
          <Link href="/timeline" className="focus-ring hover:text-[var(--accent)]">Timeline</Link>
          <Link href="/about" className="focus-ring hover:text-[var(--accent)]">Methodology</Link>
          <Link href="/offline" className="focus-ring hover:text-[var(--accent)]">Offline</Link>
        </nav>
      </div>
    </footer>
  );
}
