"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallButton } from "@/components/InstallButton";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLink = (href: string, label: string, mobile = false) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={mobile ? () => setMenuOpen(false) : undefined}
        className={`focus-ring relative transition-colors ${
          mobile
            ? `block rounded-xl px-3 py-3 text-sm ${active ? "text-[var(--accent)]" : "text-secondary hover:bg-[var(--surface)]"}`
            : `rounded-lg px-3 py-2 text-sm ${active ? "text-[var(--accent)]" : "text-secondary hover:bg-[var(--surface)]"}`
        }`}
      >
        {label}
        {active && !mobile && (
          <span
            className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
            style={{ background: "var(--accent)" }}
          />
        )}
      </Link>
    );
  };

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_95%,transparent)] backdrop-blur supports-[padding:max(0px)]:pt-[max(env(safe-area-inset-top),0px)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-4 md:px-6 md:py-3">
        <Link
          href="/"
          className="focus-ring max-w-[58vw] truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)] sm:max-w-none sm:text-xs md:text-sm"
        >
          What Trump Says
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="md:hidden">
            <InstallButton compact />
          </div>
          <ThemeToggle />

          <button
            type="button"
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>

          <nav className="hidden items-center gap-2 text-sm text-secondary md:flex" aria-label="Primary">
            <InstallButton />
            {navLink("/timeline", "Timeline")}
            {navLink("/about", "About")}
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--bg-muted)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
          <nav className="grid gap-1.5 text-sm text-secondary" aria-label="Mobile">
            {navLink("/timeline", "Timeline", true)}
            {navLink("/about", "About", true)}
          </nav>
        </div>
      )}
    </header>
  );
}
