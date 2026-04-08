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
      const p = new URLSearchParams(queryString);
      if (cursor) p.set("cursor", cursor);
      const res = await fetch(`/api/posts?${p.toString()}`);
      const data = (await res.json()) as FeedResponse;
      setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
      setNextCursor(data.nextCursor);
      setStatuses(data.sourceStatuses);
      setLoading(false);
    },
    [queryString]
  );

  useEffect(() => {
    load(undefined, true);
  }, [load]);

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
    <div className="space-y-4">
      <div className="glass-panel rounded-xl p-3 text-xs text-parchment/70">
        {statuses.map((status) => (
          <p key={status.source}>
            <span className="font-semibold text-parchment">{status.source}</span>: {status.available ? "Available" : "Unavailable"} — {status.detail}
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
