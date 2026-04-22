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
    <section className="relative overflow-hidden poster-stripes">

      {/* Section label — Zohran-style divider */}
      <div className="flex items-center justify-center gap-3 px-4 pt-8 pb-0">
        <div className="h-[2px] w-16 bg-[#E11D48]" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E11D48]">
          The Archive
        </p>
        <div className="h-[2px] w-16 bg-[#E11D48]" />
      </div>

      {/* 3-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto]">

        {/* COL 1 — Title */}
        <div className="p-6 sm:p-8 md:p-10">
          <h1
            className="uppercase leading-[0.92] tracking-[0.02em] text-[#2D2AA6]"
            style={{
              fontFamily: "var(--font-display, Anton, Impact, sans-serif)",
              fontSize: "clamp(3rem, 8vw, 6rem)",
            }}
          >
            What
            <br />
            <span className="text-[#E11D48]">Trump</span>
            <br />
            Says.
          </h1>
        </div>

        {/* COL 2 — Description + CTA */}
        <div className="flex flex-col justify-center border-[rgba(45,42,166,0.2)] p-6 sm:p-8 md:border-l md:border-r md:p-10">

          {/* Yellow bar accent */}
          <div className="mb-4 h-1 w-12 rounded-full bg-[#2D2AA6]" />

          <p
            className="leading-tight text-[#1F2937]"
            style={{
              fontFamily: "var(--font-display, Anton, sans-serif)",
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              letterSpacing: "0.01em",
            }}
          >
            See what Trump actually said.
          </p>

          <p className="mt-3 text-base font-medium leading-7 text-[#1F2937]/70 sm:text-lg">
            Not headlines. Not opinions. Just the original posts.
          </p>

          {count > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded bg-[#2D2AA6] px-3 py-1.5 font-black tabular-nums tracking-wide text-[#F59E0B]">
                {count.toLocaleString()} POSTS
              </span>
              {syncedAt && (
                <span className="text-[#1F2937]/60">synced {formatSyncTime(syncedAt)}</span>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/timeline"
              className="focus-ring button-gold inline-flex min-h-11 items-center justify-center px-6 py-2.5 text-sm tracking-[0.12em]"
            >
              See today&apos;s posts
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-[#1F2937]/45">
            Live feed from Truth Social&nbsp;•&nbsp;No spin&nbsp;•&nbsp;Share anything instantly
          </p>
        </div>

        {/* COL 3 — Stats panel (desktop) */}
        <div
          className="hidden bg-[#2D2AA6] md:flex md:flex-col md:items-center md:justify-center md:gap-6 md:px-10 md:py-10"
          style={{ minWidth: "200px" }}
        >
          <div className="text-center">
            <p
              className="tabular-nums leading-none text-[#F59E0B]"
              style={{
                fontFamily: "var(--font-display, Anton, sans-serif)",
                fontSize: "5rem",
                lineHeight: 1,
              }}
            >
              {count > 0 ? count : "—"}
            </p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
              Posts Archived
            </p>
          </div>

          <div className="h-px w-12 bg-[rgba(245,158,11,0.4)]" />

          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50">Source</p>
            <p className="mt-1 text-[13px] font-black uppercase tracking-widest text-white">
              Truth Social
            </p>
          </div>

          <p className="tracking-[0.4em] text-[#F59E0B]" style={{ fontSize: "18px" }}>
            ★ ★ ★
          </p>
        </div>

      </div>
    </section>
  );
}
