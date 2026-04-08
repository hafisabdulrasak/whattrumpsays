"use client";

import { useTimelineStore } from "@/store/useTimelineStore";

export function FiltersBar() {
  const { q, source, start, end, quick, setQuery, resetDates } = useTimelineStore();

  return (
    <section className="glass-panel rounded-xl p-4 shadow-panel">
      <div className="grid gap-3 md:grid-cols-5">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-parchment/70">Search</span>
          <input
            className="focus-ring w-full rounded bg-navy px-3 py-2 text-sm"
            value={q}
            onChange={(e) => setQuery({ q: e.target.value })}
            placeholder="Search post text"
            aria-label="Search posts"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-parchment/70">Source</span>
          <select
            className="focus-ring w-full rounded bg-navy px-3 py-2 text-sm"
            value={source}
            onChange={(e) => setQuery({ source: e.target.value as "all" | "truth_social" | "twitter_archive" })}
            aria-label="Filter source"
          >
            <option value="all">All</option>
            <option value="truth_social">Truth Social</option>
            <option value="twitter_archive">Twitter Archive</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-parchment/70">From</span>
          <input className="focus-ring w-full rounded bg-navy px-3 py-2 text-sm" type="date" value={start ?? ""} onChange={(e) => setQuery({ start: e.target.value || undefined, quick: undefined })} />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-parchment/70">To</span>
          <input className="focus-ring w-full rounded bg-navy px-3 py-2 text-sm" type="date" value={end ?? ""} onChange={(e) => setQuery({ end: e.target.value || undefined, quick: undefined })} />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {[
          ["today", "Today"],
          ["week", "This Week"],
          ["month", "This Month"],
          ["archive", "Archive Era"]
        ].map(([value, label]) => (
          <button
            key={value}
            className={`focus-ring rounded-full border px-3 py-1 text-xs transition ${quick === value ? "border-gold bg-gold/20 text-parchment" : "border-white/15 text-parchment/70 hover:border-white/40"}`}
            onClick={() => setQuery({ quick: value as "today" | "week" | "month" | "archive", start: undefined, end: undefined })}
          >
            {label}
          </button>
        ))}
        <button className="focus-ring rounded-full border border-white/20 px-3 py-1 text-xs text-parchment/70" onClick={resetDates}>
          Clear dates
        </button>
      </div>
    </section>
  );
}
