"use client";

import Link from "next/link";
import { NormalizedPost } from "@/lib/types";

function formatAbsoluteDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

function formatRelativeTime(isoDate: string) {
  const target = new Date(isoDate).getTime();
  const now = Date.now();
  const diffSeconds = Math.round((target - now) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const thresholds: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1]
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, unitSeconds] of thresholds) {
    if (absSeconds >= unitSeconds || unit === "second") {
      return rtf.format(Math.round(diffSeconds / unitSeconds), unit);
    }
  }

  return "just now";
}

export function PostCard({ post, index }: { post: NormalizedPost; index: number }) {
  return (
    <article
      className="card-surface group min-w-0 rounded-xl p-3.5 transition-all duration-200 hover:shadow-[var(--shadow-accent)] sm:p-5 md:p-6"
      style={{
        borderLeft: "3px solid var(--accent-dim)",
        animationDelay: `${Math.min(index * 0.015, 0.14)}s`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--accent-dim)";
      }}
    >
      <header className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted sm:mb-4 sm:gap-2 sm:text-xs">
        {post.metadata.allCapsScore > 0.7 && (
          <span className="rounded-sm border border-[color:var(--error)]/50 bg-[color:var(--error)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[color:var(--error)]">
            All Caps
          </span>
        )}
        {post.metadata.rapidFireGroup && (
          <span
            className="rounded-sm px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
            style={{ background: "var(--accent-yellow)", color: "#141414" }}
          >
            Rapid Fire
          </span>
        )}

        {/* Post number — right-aligned */}
        <span
          className="ml-auto font-black tabular-nums"
          style={{ color: "var(--accent)", fontSize: "11px", letterSpacing: "0.05em" }}
        >
          #{index + 1}
        </span>
      </header>

      <p className="whitespace-pre-wrap break-words text-[1.05rem] leading-7 text-[var(--text-primary)] sm:text-[1.12rem] sm:leading-8 md:text-[1.18rem] md:leading-8">
        {post.text}
      </p>

      <footer className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-muted sm:mt-5 sm:gap-x-2.5 sm:gap-y-2 sm:text-xs">
        <time
          dateTime={post.createdAt}
          title={formatAbsoluteDate(post.createdAt)}
          className="font-medium text-[var(--text-secondary)]"
        >
          {formatAbsoluteDate(post.createdAt)}
        </time>
        <span aria-hidden>·</span>
        <span>{formatRelativeTime(post.createdAt)}</span>
        <span aria-hidden>·</span>
        <Link
          href={`/post/${post.id}`}
          className="focus-ring inline-flex min-h-9 items-center rounded px-2 text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
        >
          Detail
        </Link>
        {post.sourceUrl && (
          <>
            <span aria-hidden>·</span>
            <a
              className="focus-ring inline-flex min-h-9 items-center rounded px-2 text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
              href={post.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Original ↗
            </a>
          </>
        )}
      </footer>
    </article>
  );
}
