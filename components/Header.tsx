import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-obsidian/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="focus-ring text-sm font-semibold uppercase tracking-[0.2em] text-gold">
          What Trump Says
        </Link>
        <nav className="flex items-center gap-3 text-sm text-parchment/90">
          <Link href="/timeline" className="focus-ring rounded px-2 py-1 hover:bg-white/5">Timeline</Link>
          <Link href="/about" className="focus-ring rounded px-2 py-1 hover:bg-white/5">About</Link>
        </nav>
      </div>
    </header>
  );
}
