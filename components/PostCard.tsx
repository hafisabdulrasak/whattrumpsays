"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.015, 0.14) }}
      className="card-surface min-w-0 rounded-2xl p-3.5 transition hover:shadow-[var(--shadow-gold)] sm:p-5 md:p-6"
    >
      <header className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] text-muted sm:mb-4 sm:gap-2 sm:text-xs">
        <span className="meta-pill rounded-full px-2.5 py-1">{post.sourceLabel}</span>
        {post.metadata.allCapsScore > 0.7 && <span className="rounded-full border border-[color:var(--error)]/50 bg-[color:var(--error)]/10 px-2.5 py-1 text-[color:var(--error)]">All Caps</span>}
        {post.metadata.rapidFireGroup && <span className="rounded-full border border-[var(--accent)]/50 bg-[var(--accent-soft)] px-2.5 py-1 text-[var(--accent)]">Rapid Fire</span>}
      </header>

      <p className="timeline-copy whitespace-pre-wrap break-words text-[0.99rem] leading-7 text-[var(--text-primary)] sm:text-[1.06rem] sm:leading-8 md:text-[1.1rem] md:leading-8">{post.text}</p>

      <footer className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-muted sm:mt-5 sm:gap-x-2.5 sm:gap-y-2 sm:text-xs">
        <time dateTime={post.createdAt} title={formatAbsoluteDate(post.createdAt)} className="font-medium text-secondary">
          {formatAbsoluteDate(post.createdAt)}
        </time>
        <span aria-hidden>•</span>
        <span>{formatRelativeTime(post.createdAt)}</span>
        <span aria-hidden>•</span>
        <Link href={`/post/${post.id}`} className="focus-ring inline-flex min-h-9 items-center rounded-md px-2 text-secondary underline-offset-4 hover:text-[var(--accent)] hover:underline">
          Detail
        </Link>
        {post.sourceUrl && (
          <>
            <span aria-hidden>•</span>
            <a
              className="focus-ring inline-flex min-h-9 items-center rounded-md px-2 text-secondary underline-offset-4 hover:text-[var(--accent)] hover:underline"
              href={post.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Original
            </a>
          </>
        )}
      </footer>
    </motion.article>
  );
}
