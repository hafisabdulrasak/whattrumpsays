import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--bg-muted)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-secondary sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <p>What Trump Says aggregates publicly available posts with source labels and timestamps.</p>
          <p className="text-xs text-[var(--text-muted)]">
            Built by{" "}
            <a
              href="https://github.com/hafisabdulrasak"
              target="_blank"
              rel="noreferrer"
              className="focus-ring font-semibold text-[var(--accent)] hover:underline underline-offset-2"
            >
              Hafis Abdul Rasak
            </a>
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-3">
          <Link href="/timeline" className="focus-ring hover:text-[var(--accent)]">Timeline</Link>
          <Link href="/about" className="focus-ring hover:text-[var(--accent)]">Methodology</Link>
          <Link href="/offline" className="focus-ring hover:text-[var(--accent)]">Offline</Link>
          <a
            href="https://buymeacoffee.com/hafisabdulrasak"
            target="_blank"
            rel="noreferrer"
            className="focus-ring font-semibold text-[var(--accent)] hover:underline underline-offset-2"
          >
            ☕ Buy Me a Coffee
          </a>
        </nav>
      </div>
    </footer>
  );
}
