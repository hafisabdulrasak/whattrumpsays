import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 bg-[#2D2AA6]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">

        {/* Left — branding + disclaimer */}
        <div className="flex flex-col gap-1.5">
          <span
            className="text-sm font-normal uppercase tracking-[0.10em] text-[#F59E0B]"
            style={{ fontFamily: "var(--font-display, Anton, sans-serif)" }}
          >
            What Trump Says
          </span>
          <p className="text-xs text-white/60">
            Aggregates publicly available posts with source labels and timestamps.
          </p>
          <p className="text-xs text-white/40">
            Built by{" "}
            <a
              href="https://github.com/hafisabdulrasak"
              target="_blank"
              rel="noreferrer"
              className="focus-ring font-semibold text-[#F59E0B] hover:underline underline-offset-2"
            >
              Hafis Abdul Rasak
            </a>
          </p>
        </div>

        {/* Right — nav links */}
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
          {[
            { href: "/timeline", label: "Timeline", internal: true },
            { href: "/about", label: "Methodology", internal: true },
            { href: "/offline", label: "Offline", internal: true },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="focus-ring text-xs font-bold uppercase tracking-[0.1em] text-white/70 transition hover:text-[#F59E0B]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
