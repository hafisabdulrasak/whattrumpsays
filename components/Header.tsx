"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { InstallButton } from "@/components/InstallButton";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#2D2AA6] shadow-[0_2px_12px_rgba(45,42,166,0.3)] supports-[padding:max(0px)]:pt-[max(env(safe-area-inset-top),0px)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-0 sm:px-6 md:px-8">

        {/* Logo */}
        <Link href="/" className="focus-ring flex flex-col py-3 leading-none">
          <span
            className="font-display text-sm font-normal uppercase tracking-[0.10em] text-[#F59E0B] sm:text-base"
            style={{ fontFamily: "var(--font-display, Anton, sans-serif)" }}
          >
            What Trump Says
          </span>
          <span className="text-[9px] italic tracking-[0.08em] text-[rgba(245,158,11,0.65)]">
            Unfiltered. Raw. Real
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile install + hamburger */}
          <div className="md:hidden">
            <InstallButton compact />
          </div>

          <button
            type="button"
            className="focus-ring inline-flex min-h-10 min-w-10 items-center justify-center rounded text-white md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            <InstallButton />
            {[
              { href: "/timeline", label: "Timeline" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`focus-ring rounded px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                  isActive(href)
                    ? "text-[#F59E0B]"
                    : "text-white/80 hover:text-[#F59E0B]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-[#1e1c8a] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        >
          <nav className="grid gap-1" aria-label="Mobile">
            {[
              { href: "/timeline", label: "Timeline" },
              { href: "/about", label: "About" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`focus-ring rounded px-3 py-3 text-sm font-bold uppercase tracking-[0.1em] ${
                  isActive(href)
                    ? "text-[#F59E0B]"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
