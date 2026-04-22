"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { PostCard } from "@/components/PostCard";
import { NormalizedPost } from "@/lib/types";
import { useTimelineStore } from "@/store/useTimelineStore";

const PAGE_SIZE = 20;

type FeedResponse = {
  posts: NormalizedPost[];
  nextCursor: string | null;
  page: number;
  totalPages: number;
  total: number;
  sourceStatuses: Array<{ source: string; available: boolean; detail: string; checkedAt: string }>;
};

// ── helpers ────────────────────────────────────────────────────────────────

function sameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const postStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((todayStart - postStart) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (date.getFullYear() === now.getFullYear())
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function hoursBetween(newerIso: string, olderIso: string): number {
  return (new Date(newerIso).getTime() - new Date(olderIso).getTime()) / 3_600_000;
}

function formatGap(hours: number): string {
  if (hours >= 48) return `${Math.round(hours / 24)}d gap`;
  if (hours >= 1) return `${Math.round(hours)}h gap`;
  return `${Math.round(hours * 60)}m gap`;
}

// ── sub-components ─────────────────────────────────────────────────────────

function DateMarker({ label }: { label: string }) {
  return (
    <>
      {/* Mobile */}
      <div className="flex items-center gap-3 py-1 sm:hidden">
        <div className="h-px flex-1 bg-[rgba(45,42,166,0.2)]" />
        <span className="rounded bg-[#2D2AA6] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#F59E0B]">
          {label}
        </span>
        <div className="h-px flex-1 bg-[rgba(45,42,166,0.2)]" />
      </div>

      {/* Desktop */}
      <div className="relative hidden py-1 pl-9 sm:flex sm:items-center">
        <div className="absolute left-[6px] h-3 w-3 rotate-45 border-2 border-[#2D2AA6] bg-[#F59E0B]" />
        <span className="rounded bg-[#2D2AA6] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-[#F59E0B]">
          {label}
        </span>
      </div>
    </>
  );
}

function TimeGapMarker({ hours }: { hours: number }) {
  return (
    <div className="relative hidden h-7 pl-9 sm:block">
      <div className="absolute left-[11px] top-0 h-full w-px bg-[rgba(45,42,166,0.2)]" />
      <span className="flex h-full items-center text-[9px] tabular-nums text-[#1F2937]/40">
        {formatGap(hours)}
      </span>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  loading,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page number list with ellipsis
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#1F2937]/50">
        Page <span className="text-[#2D2AA6]">{page}</span> of{" "}
        <span className="text-[#2D2AA6]">{totalPages}</span>
        <span className="mx-2 opacity-40">·</span>
        <span className="tabular-nums text-[#E11D48]">{total.toLocaleString()}</span> posts
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          className="focus-ring inline-flex min-h-[44px] items-center gap-1 rounded px-4 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-30 bg-[#E11D48] text-white hover:bg-[#2D2AA6]"
          disabled={page === 1 || loading}
          onClick={() => onChange(page - 1)}
        >
          ← Prev
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-[#1F2937]/40">…</span>
          ) : (
            <button
              key={p}
              className="focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-xs font-black tabular-nums transition-all"
              style={
                p === page
                  ? { background: "#2D2AA6", color: "#F59E0B" }
                  : { background: "#fff", color: "#1F2937", border: "1px solid rgba(45,42,166,0.2)" }
              }
              disabled={loading}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="focus-ring inline-flex min-h-[44px] items-center gap-1 rounded px-4 text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-30 bg-[#E11D48] text-white hover:bg-[#2D2AA6]"
          disabled={page === totalPages || loading}
          onClick={() => onChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function TimelineFeed({ initial }: { initial: FeedResponse }) {
  const [posts, setPosts] = useState(initial.posts);
  const [page, setPage] = useState(initial.page ?? 1);
  const [totalPages, setTotalPages] = useState(initial.totalPages ?? 1);
  const [total, setTotal] = useState(initial.total ?? initial.posts.length);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);
  const latestPostId = useRef(initial.posts[0]?.id ?? null);
  const { q, source, tag, start, end, quick } = useTimelineStore();

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (tag) p.set("tag", tag);
    if (source && source !== "all") p.set("source", source);
    if (start) p.set("start", start);
    if (end) p.set("end", end);
    if (quick) p.set("quick", quick);
    p.set("limit", String(PAGE_SIZE));
    return p.toString();
  }, [q, tag, source, start, end, quick]);

  const loadPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const p = new URLSearchParams(queryString);
        p.set("page", String(pageNum));
        const res = await fetch(`/api/posts?${p.toString()}`);
        if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
        const data = (await res.json()) as FeedResponse;
        setPosts(data.posts);
        setPage(data.page ?? pageNum);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? data.posts.length);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        // keep current state
      } finally {
        setLoading(false);
      }
    },
    [queryString]
  );

  // Reset to page 1 when filters change
  useEffect(() => { void loadPage(1); }, [loadPage]);

  useEffect(() => {
    const updateStatus = () => setOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // Poll for new posts every 5 minutes
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/posts?limit=1");
        if (!res.ok) return;
        const data = await res.json();
        const newestId = data.posts?.[0]?.id;
        if (newestId && newestId !== latestPostId.current) {
          setNewPostsAvailable(true);
        }
      } catch { /* ignore */ }
    }, 5 * 60 * 1000);
    return () => clearInterval(poll);
  }, []);

  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      {newPostsAvailable && (
        <button
          className="w-full rounded-xl py-3 text-sm font-black uppercase tracking-widest transition-opacity animate-pulse"
          style={{ background: "var(--accent)", color: "var(--bg)" }}
          onClick={() => {
            setNewPostsAvailable(false);
            void loadPage(1).then(() => {
              latestPostId.current = posts[0]?.id ?? null;
            });
          }}
        >
          ↑ New posts available — tap to refresh
        </button>
      )}

      {offline && (
        <div className="rounded-xl border border-[var(--warning)]/60 bg-[var(--accent-soft)] px-3 py-2.5 text-xs leading-5 text-secondary sm:px-4">
          You are offline. Cached timeline entries are still readable, but new sync updates will resume after reconnecting.
        </div>
      )}

      {posts.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <div className="relative">
          {/* Continuous vertical line — desktop only */}
          <div
            className="pointer-events-none absolute bottom-0 left-[11px] top-0 hidden w-px sm:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--accent-dim) 60px, var(--accent-dim) calc(100% - 60px), transparent)",
            }}
          />

          <div className={`space-y-3 sm:space-y-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            {posts.flatMap((post, index) => {
              const prev = index > 0 ? posts[index - 1] : null;
              const newDay = !prev || !sameDay(post.createdAt, prev.createdAt);
              const gap = prev ? hoursBetween(prev.createdAt, post.createdAt) : 0;
              const showGap = !newDay && gap >= 4;

              const items: React.ReactNode[] = [];

              if (newDay) {
                items.push(<DateMarker key={`date-${post.id}`} label={formatDayLabel(post.createdAt)} />);
              } else if (showGap) {
                items.push(<TimeGapMarker key={`gap-${post.id}`} hours={gap} />);
              }

              const timeLabel = new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(post.createdAt));

              // Global post number accounting for page offset
              const globalIndex = (page - 1) * PAGE_SIZE + index;

              items.push(
                <div key={post.id} className="relative">
                  {/* Dot + time row — desktop only */}
                  <div className="relative mb-1 hidden h-6 items-center sm:flex">
                    {/* Pulse ring on latest post */}
                    {globalIndex === 0 && (
                      <span
                        className="absolute left-[6px] h-[10px] w-[10px] animate-ping rounded-full opacity-50"
                        style={{ background: "var(--accent)" }}
                      />
                    )}
                    <div
                      className="absolute left-[6px] h-[10px] w-[10px] rounded-full border-2"
                      style={{ borderColor: "var(--accent)", backgroundColor: "var(--bg)" }}
                    />
                    <span
                      className="pl-[26px] tabular-nums"
                      style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em" }}
                    >
                      {timeLabel}
                    </span>
                  </div>
                  {/* Card */}
                  <div className="sm:pl-9">
                    <PostCard post={post} index={globalIndex} />
                  </div>
                </div>
              );

              return items;
            })}
          </div>
        </div>
      )}

      {loading && (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        loading={loading}
        onChange={loadPage}
      />
    </div>
  );
}
