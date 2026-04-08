import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallButton } from "@/components/InstallButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_90%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="focus-ring text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            What Trump Says
          </Link>
        </div>
        <nav className="flex items-center gap-2 text-sm text-secondary">
          <InstallButton />
          <Link href="/timeline" className="focus-ring rounded-md px-2 py-1.5 hover:bg-[var(--surface)]">Timeline</Link>
          <Link href="/about" className="focus-ring rounded-md px-2 py-1.5 hover:bg-[var(--surface)]">About</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
