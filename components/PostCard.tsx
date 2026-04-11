"use client";

import Link from "next/link";
import { NormalizedPost } from "@/lib/types";

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
      className="post-enter card-surface group min-w-0 rounded-xl p-3.5 transition-all duration-200 hover:shadow-[var(--shadow-accent)] sm:p-5 md:p-6"
      style={{
        borderLeft: "3px solid var(--accent-dim)",
        animationDelay: `${Math.min(index * 0.04, 0.32)}s`,
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

        {/* Topic tags */}
        {post.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="rounded-sm border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
          >
            {t}
          </span>
        ))}

        {/* Post number — right-aligned */}
        <span
          className="ml-auto font-black tabular-nums"
          style={{ color: "var(--accent)", fontSize: "15px", letterSpacing: "0.05em" }}
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
          className="font-medium text-[var(--text-secondary)]"
        >
          {formatRelativeTime(post.createdAt)}
        </time>

        {/* Engagement counts */}
        {(post.metadata.sharesCount > 0 || post.metadata.favouritesCount > 0) && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-3">
              {post.metadata.sharesCount > 0 && (
                <span className="flex items-center gap-1 tabular-nums" title="ReTruths">
                  {/* retweet icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  <span style={{ color: "var(--accent)" }} className="font-semibold">
                    {post.metadata.sharesCount.toLocaleString()}
                  </span>
                </span>
              )}
              {post.metadata.favouritesCount > 0 && (
                <span className="flex items-center gap-1 tabular-nums" title="Likes">
                  {/* heart icon */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#e879a0" }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span style={{ color: "#e879a0" }} className="font-semibold">
                    {post.metadata.favouritesCount.toLocaleString()}
                  </span>
                </span>
              )}
            </span>
          </>
        )}

        <span aria-hidden>·</span>
        <Link
          href={`/post/${post.id}`}
          className="focus-ring inline-flex min-h-11 items-center rounded px-2 text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
        >
          Detail
        </Link>
        {post.sourceUrl && (
          <>
            <span aria-hidden>·</span>
            <a
              className="focus-ring inline-flex min-h-11 items-center rounded px-2 text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
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
