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

export function TimelineFeed({ initial }: { initial: FeedResponse }) {
  const [posts, setPosts] = useState(initial.posts);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState(initial.sourceStatuses);
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
        setStatuses(data.sourceStatuses);
      } catch {
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [queryString]
  );

  useEffect(() => {
    load(undefined, true);
  }, [load]);

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
          You are offline. Cached pages are available, but live timeline updates require reconnecting.
        </div>
      )}
      <div className="glass-panel rounded-xl p-3 text-xs text-muted sm:p-3.5">
        {statuses.map((status) => (
          <p key={status.source} className="break-words leading-5">
            <span className="font-semibold text-[var(--text-primary)]">{status.source}</span>: {status.available ? "Available" : "Unavailable"} — {status.detail}
          </p>
        ))}
      </div>

      {posts.length === 0 && !loading ? <EmptyState /> : posts.map((post, index) => <PostCard key={post.id} post={post} index={index} />)}
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
