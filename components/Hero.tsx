import Link from "next/link";
import { promises as fs } from "node:fs";
import path from "node:path";

const STATUS_PATH = path.join(process.cwd(), "data", "truthsocial-sync-status.json");
const DATA_PATH = path.join(process.cwd(), "data", "posts.json");

async function getHeroStats() {
  try {
    const [statusRaw, postsRaw] = await Promise.all([
      fs.readFile(STATUS_PATH, "utf-8").catch(() => ""),
      fs.readFile(DATA_PATH, "utf-8").catch(() => "[]"),
    ]);
    const posts = JSON.parse(postsRaw);
    const count = Array.isArray(posts) ? posts.length : 0;
    let syncedAt: string | null = null;
    if (statusRaw) {
      const status = JSON.parse(statusRaw);
      if (status.updatedAt) syncedAt = status.updatedAt;
    }
    return { count, syncedAt };
  } catch {
    return { count: 0, syncedAt: null };
  }
}

function formatSyncTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export async function Hero() {
  const { count, syncedAt } = await getHeroStats();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] shadow-[var(--shadow-soft)]">
      {/* Background */}
      <div
        className="absolute inset-0 poster-stripes"
        style={{ backgroundImage: "var(--hero-overlay), linear-gradient(160deg, var(--bg-muted) 0%, var(--surface) 100%)" }}
      />

      {/* Red top bar */}
      <div className="relative z-10 bg-[var(--accent)] px-4 py-2 sm:px-7 md:px-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bg)] sm:text-[11px]">
          ★ Live Archive Interface ★
        </p>
      </div>

      {/* 3-column on desktop, stacked on mobile */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto_1fr_auto]">

        {/* COL 1 — Title */}
        <div className="p-4 sm:p-7 md:p-10">
          <h1 className="font-display text-[2.2rem] font-black uppercase leading-[0.95] tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl lg:text-7xl">
            What
            <br />
            <span style={{ color: "var(--accent)" }}>Trump</span>
            <br />
            Says
          </h1>
        </div>

        {/* COL 2 — Description + CTA (fills the empty space) */}
        <div
          className="flex flex-col justify-center border-[var(--border)] p-4 sm:p-7 md:border-l md:border-r md:p-10"
        >
          <div className="h-1 w-14 rounded-full" style={{ background: "var(--accent-yellow)" }} />

          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            A reverse-chronological archive of Donald Trump&apos;s public posts.
          </p>

          {count > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span
                className="rounded-sm px-2.5 py-1 font-black tabular-nums tracking-wide"
                style={{ background: "var(--accent-yellow)", color: "#141414" }}
              >
                {count.toLocaleString()} POSTS
              </span>
              {syncedAt && (
                <span className="text-[var(--text-muted)]">synced {formatSyncTime(syncedAt)}</span>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/timeline"
              className="focus-ring button-gold inline-flex min-h-11 items-center justify-center rounded-sm px-6 py-2.5 text-sm tracking-widest transition"
            >
              READ THE RECORD
            </Link>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
              Newest posts first
            </div>
          </div>
        </div>

        {/* COL 3 — Stats panel */}
        <div
          className="hidden md:flex md:flex-col md:items-center md:justify-center md:gap-6 md:px-10 md:py-10"
          style={{ minWidth: "200px" }}
        >
          <div className="text-center">
            <p
              className="font-display font-black leading-none tabular-nums"
              style={{ fontSize: "5rem", color: "var(--accent)", lineHeight: 1 }}
            >
              {count > 0 ? count : "—"}
            </p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Posts Archived
            </p>
          </div>

          <div className="h-px w-16" style={{ background: "var(--accent-yellow)" }} />

          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)]">Source</p>
            <p className="mt-1 text-[13px] font-black uppercase tracking-widest text-[var(--text-primary)]">
              Truth Social
            </p>
          </div>

          <p className="font-black tracking-[0.4em] text-[var(--accent)]" style={{ fontSize: "18px" }}>
            ★ ★ ★
          </p>
        </div>

      </div>
    </section>
  );
}
