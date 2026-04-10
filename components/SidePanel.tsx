"use client";

import Link from "next/link";
import { format } from "date-fns";
import { NormalizedPost } from "@/lib/types";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function MiniPostCard({ post, badge }: { post: NormalizedPost; badge?: React.ReactNode }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group block rounded-lg p-3 transition-all duration-150 hover:shadow-[var(--shadow-accent)]"
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--accent-dim)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderLeftColor = "var(--accent-dim)";
      }}
    >
      {badge && <div className="mb-1.5">{badge}</div>}
      <p className="line-clamp-3 text-xs leading-5 text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">
        {post.text}
      </p>
      <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
        {relativeTime(post.createdAt)}
        <span className="ml-2 text-[var(--text-muted)]/60">{post.metadata.characterCount} chars</span>
      </p>
    </Link>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="mb-2.5 text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--accent)" }}>
      {label}
    </h3>
  );
}

export function SidePanel({ posts }: { posts: NormalizedPost[] }) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todaysPosts = posts.filter((p) => p.createdAt.startsWith(todayKey));
  const mostShared = [...posts]
    .filter((p) => p.metadata.sharesCount > 0)
    .sort((a, b) => b.metadata.sharesCount - a.metadata.sharesCount)
    .slice(0, 3);
  const longestPost = [...posts].sort((a, b) => b.metadata.characterCount - a.metadata.characterCount)[0];

  // Daily activity for last 7 days
  const days7: { key: string; label: string; count: number }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { key: format(d, "yyyy-MM-dd"), label: format(d, "EEE"), count: 0 };
  });
  posts.forEach((p) => {
    const key = p.createdAt.slice(0, 10);
    const slot = days7.find((d) => d.key === key);
    if (slot) slot.count++;
  });
  const maxDayCount = Math.max(...days7.map((d) => d.count), 1);

  const avgChars =
    todaysPosts.length > 0
      ? Math.round(todaysPosts.reduce((sum, p) => sum + p.metadata.characterCount, 0) / todaysPosts.length)
      : 0;

  return (
    <aside className="space-y-4">

      {/* 1 — Today at a Glance */}
      <section className="glass-panel rounded-xl p-4">
        <SectionHeader label="Today at a Glance" />
        <div className="flex items-end gap-4">
          <div>
            <p className="font-display text-4xl font-black tabular-nums leading-none" style={{ color: "var(--accent-yellow)" }}>
              {todaysPosts.length}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">posts today</p>
          </div>
          {avgChars > 0 && (
            <div className="mb-0.5">
              <p className="text-lg font-black tabular-nums leading-none text-[var(--text-primary)]">{avgChars}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">avg chars</p>
            </div>
          )}
        </div>
      </section>

      {/* 2 — Activity Last Week */}
      <section className="glass-panel rounded-xl p-4">
        <SectionHeader label="Activity Last Week" />
        <div className="flex h-16 gap-1">
          {days7.map((day) => (
            <div key={day.key} className="flex h-full flex-1 flex-col justify-end">
              <div
                title={`${day.label} — ${day.count} post${day.count !== 1 ? "s" : ""}`}
                className="w-full rounded-sm transition-all"
                style={{
                  height: day.count > 0 ? `${Math.max(12, Math.round((day.count / maxDayCount) * 100))}%` : "3px",
                  background: day.key === todayKey ? "var(--accent-yellow)" : day.count > 0 ? "var(--accent)" : "var(--border)",
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between">
          {days7.map((day) => (
            <span
              key={day.key}
              className="flex-1 text-center text-[9px] font-medium"
              style={{ color: day.key === todayKey ? "var(--accent-yellow)" : "var(--text-muted)" }}
            >
              {day.label}
            </span>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[9px] text-[var(--text-muted)]">
          {days7.map((day) => (
            <span key={day.key} className="flex-1 text-center tabular-nums" style={{ color: day.count > 0 ? "var(--text-secondary)" : "var(--text-muted)" }}>
              {day.count}
            </span>
          ))}
        </div>
      </section>

      {/* 3 — Most Shared */}
      <section className="glass-panel rounded-xl p-4">
        <SectionHeader label="Most Shared" />
        <div className="space-y-2">
          {mostShared.length > 0 ? (
            mostShared.map((post) => (
              <MiniPostCard
                key={post.id}
                post={post}
                badge={
                  <span
                    className="inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                    style={{ background: "var(--accent-yellow)", color: "#141414" }}
                  >
                    ↻ {post.metadata.sharesCount.toLocaleString()} shares
                  </span>
                }
              />
            ))
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No reposts in current data.</p>
          )}
        </div>
      </section>

      {/* 4 — Highlights */}
      {longestPost && (
        <section className="glass-panel rounded-xl p-4">
          <SectionHeader label="Highlights" />
          <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Longest Post</p>
          <MiniPostCard
            post={longestPost}
            badge={
              <span
                className="inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-black tabular-nums uppercase tracking-wider"
                style={{ background: "var(--accent-yellow)", color: "#141414" }}
              >
                {longestPost.metadata.characterCount} chars
              </span>
            }
          />
        </section>
      )}

    </aside>
  );
}
