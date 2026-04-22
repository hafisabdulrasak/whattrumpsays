"use client";

import Link from "next/link";
import { useState } from "react";
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
    ["second", 1],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, unitSeconds] of thresholds) {
    if (absSeconds >= unitSeconds || unit === "second") {
      return rtf.format(Math.round(diffSeconds / unitSeconds), unit);
    }
  }
  return "just now";
}

function excerpt(text: string, max = 120) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export function PostCard({ post, index }: { post: NormalizedPost; index: number }) {
  const [copied, setCopied] = useState(false);

  const postUrl = typeof window !== "undefined"
    ? `${window.location.origin}/post/${post.id}`
    : `/post/${post.id}`;

  const shareText = `Trump just said THIS 👇\n\n"${excerpt(post.text, 120)}"\n\n${postUrl}`;

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function handleTweet(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    const text = `Trump just said THIS 👇\n\n"${excerpt(post.text, 120)}"\n\n${url}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    if (typeof navigator.share === "function") {
      navigator.share({
        title: "What Trump Says",
        text: shareText,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }

  return (
    <article
      className="post-enter group relative min-w-0 rounded-lg bg-white p-4 shadow-[0_2px_12px_rgba(45,42,166,0.08)] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(45,42,166,0.16)] hover:[border-left-color:#E11D48] sm:p-5 md:p-6"
      style={{
        borderLeft: "4px solid #F59E0B",
        animationDelay: `${Math.min(index * 0.04, 0.32)}s`,
      }}
    >
      {/* Stretched link covers the whole card */}
      <Link
        href={`/post/${post.id}`}
        className="absolute inset-0 rounded-lg focus-ring"
        aria-label={`View post from ${formatRelativeTime(post.createdAt)}`}
      />

      {/* Header row */}
      <header className="relative mb-3 flex flex-wrap items-center gap-1.5 text-[11px] sm:mb-4 sm:gap-2 sm:text-xs">
        {post.metadata.allCapsScore > 0.7 && (
          <span className="rounded bg-[#E11D48]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#E11D48] ring-1 ring-[#E11D48]/30">
            All Caps
          </span>
        )}
        {post.metadata.rapidFireGroup && (
          <span className="rounded bg-[#F59E0B] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#1F2937]">
            Rapid Fire
          </span>
        )}
        {post.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="rounded border border-[#2D2AA6]/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#2D2AA6]/60"
          >
            {t}
          </span>
        ))}
        <span
          className="ml-auto font-black tabular-nums text-[#2D2AA6]/40"
          style={{ fontFamily: "var(--font-display, Anton, sans-serif)", fontSize: "15px" }}
        >
          #{index + 1}
        </span>
      </header>

      {/* Post text */}
      <p className="relative whitespace-pre-wrap break-words text-[1.05rem] leading-7 text-[#1F2937] sm:text-[1.12rem] sm:leading-8 md:text-[1.18rem] md:leading-8">
        {post.text}
      </p>

      {/* Footer row */}
      <footer className="relative mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-[#6B7280] sm:mt-5 sm:gap-x-2.5 sm:gap-y-2 sm:text-xs">
        <time dateTime={post.createdAt} className="font-semibold text-[#2D2AA6]">
          {formatRelativeTime(post.createdAt)}
        </time>

        {(post.metadata.sharesCount > 0 || post.metadata.favouritesCount > 0) && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-3">
              {post.metadata.sharesCount > 0 && (
                <span className="flex items-center gap-1 tabular-nums" title="ReTruths">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  <span className="font-semibold text-[#E11D48]">{post.metadata.sharesCount.toLocaleString()}</span>
                </span>
              )}
              {post.metadata.favouritesCount > 0 && (
                <span className="flex items-center gap-1 tabular-nums" title="Likes">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#e879a0">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="font-semibold text-[#e879a0]">{post.metadata.favouritesCount.toLocaleString()}</span>
                </span>
              )}
            </span>
          </>
        )}

        {/* Share row — always visible */}
        <span aria-hidden className="hidden sm:inline">·</span>
        <span className="flex items-center gap-1.5 sm:gap-2">
          {/* Share / Web Share API */}
          <button
            onClick={handleShare}
            className="relative z-10 focus-ring inline-flex min-h-8 items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-[#2D2AA6] transition hover:bg-[#2D2AA6]/8 hover:text-[#2D2AA6] active:scale-95 sm:text-[11px]"
            title="Share this post"
            aria-label="Share this post"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="relative z-10 focus-ring inline-flex min-h-8 items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold transition active:scale-95 sm:text-[11px]"
            style={{ color: copied ? "#16a34a" : "#6B7280" }}
            title="Copy link"
            aria-label="Copy link"
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>

          {/* Tweet this */}
          <button
            onClick={handleTweet}
            className="relative z-10 focus-ring inline-flex min-h-8 items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold text-[#1DA1F2] transition hover:bg-[#1DA1F2]/10 active:scale-95 sm:text-[11px]"
            title="Tweet this"
            aria-label="Tweet this"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Tweet
          </button>
        </span>

        {post.sourceUrl && (
          <>
            <span aria-hidden>·</span>
            <a
              className="relative z-10 focus-ring inline-flex min-h-11 items-center rounded px-2 text-[#2D2AA6] underline-offset-4 hover:text-[#E11D48] hover:underline"
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
