"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { PostCard } from "@/components/PostCard";
import { NormalizedPost } from "@/lib/types";
import { useTimelineStore } from "@/store/useTimelineStore";

type FeedResponse = {
  posts: NormalizedPost[];
  nextCursor: string | null;
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
      {/* Mobile: horizontal rule with date centred */}
      <div className="flex items-center gap-3 py-1 sm:hidden">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          {label}
        </span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* Desktop: diamond marker on the line + date label */}
      <div className="relative hidden py-1 pl-9 sm:flex sm:items-center">
        <div
          className="absolute left-[6px] h-3 w-3 rotate-45 border-2"
          style={{ borderColor: "var(--accent)", backgroundColor: "var(--bg)" }}
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          {label}
        </span>
      </div>
    </>
  );
}

function TimeGapMarker({ hours }: { hours: number }) {
  return (
    <div className="relative hidden h-7 pl-9 sm:block">
      <div
        className="absolute left-[11px] top-0 h-full w-px"
        style={{ background: "var(--accent-dim)" }}
      />
      <span className="flex h-full items-center text-[9px] tabular-nums text-muted/50">
        {formatGap(hours)}
      </span>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export function TimelineFeed({ initial }: { initial: FeedResponse }) {
  const [posts, setPosts] = useState(initial.posts);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { q, source, start, end, quick } = useTimelineStore();

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (source && source !== "all") p.set("source", source);
    if (start) p.set("start", start);
    if (end) p.set("end", end);
    if (quick) p.set("quick", quick);
    p.set("limit", "10");
    return p.toString();
  }, [q, source, start, end, quick]);

  const load = useCallback(
    async (cursor?: string, reset?: boolean) => {
      setLoading(true);
      try {
        const p = new URLSearchParams(queryString);
        if (cursor) p.set("cursor", cursor);
        const res = await fetch(`/api/posts?${p.toString()}`);
        if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
        const data = (await res.json()) as FeedResponse;
        setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
        setNextCursor(data.nextCursor);
      } catch {
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [queryString]
  );

  useEffect(() => { load(undefined, true); }, [load]);

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

  useEffect(() => {
    if (!sentinelRef.current || !nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading) void load(nextCursor);
        });
      },
      { rootMargin: "300px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [load, loading, nextCursor]);

  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
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

          <div className="space-y-3 sm:space-y-4">
            {posts.flatMap((post, index) => {
              const prev = index > 0 ? posts[index - 1] : null;
              const newDay = !prev || !sameDay(post.createdAt, prev.createdAt);
              // gap between this post and the one before it (prev is newer, post is older)
              const gap = prev ? hoursBetween(prev.createdAt, post.createdAt) : 0;
              const showGap = !newDay && gap >= 4;

              const items: React.ReactNode[] = [];

              if (newDay) {
                items.push(<DateMarker key={`date-${post.id}`} label={formatDayLabel(post.createdAt)} />);
              } else if (showGap) {
                items.push(<TimeGapMarker key={`gap-${post.id}`} hours={gap} />);
              }

              items.push(
                <div key={post.id} className="relative sm:pl-9">
                  {/* Dot on the line */}
                  <div
                    className="absolute left-1.5 top-[22px] hidden h-[10px] w-[10px] rounded-full border-2 sm:block"
                    style={{ borderColor: "var(--accent-dim)", backgroundColor: "var(--bg)" }}
                  />
                  <PostCard post={post} index={index} />
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
      <div ref={sentinelRef} />
    </div>
  );
}
