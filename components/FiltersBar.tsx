"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTimelineStore } from "@/store/useTimelineStore";

const quickRanges = [
  ["today", "Today"],
  ["week", "This Week"],
  ["month", "This Month"],
  ["archive", "Archive Era"]
] as const;

export function FiltersBar() {
  const { q, start, end, quick, setQuery, resetDates } = useTimelineStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <section className="glass-panel rounded-2xl p-2.5 shadow-[var(--shadow-soft)] sm:p-4 md:p-5">
      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search posts</span>
            <input
              className="focus-ring min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 text-sm text-[var(--text-primary)] placeholder:text-muted"
              value={q}
              onChange={(e) => setQuery({ q: e.target.value })}
              placeholder="Search timeline"
              aria-label="Search posts"
            />
          </label>
          <button
            type="button"
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-[var(--text-secondary)]"
            onClick={() => setShowMobileFilters(true)}
            aria-label="Open filter controls"
          >
            <SlidersHorizontal size={18} aria-hidden />
          </button>
        </div>

        <div className="mt-2 -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickRanges.map(([value, label]) => (
            <button
              key={value}
              className={`focus-ring shrink-0 snap-start rounded-full border px-3 py-2 text-xs font-medium transition ${quick === value ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]" : "border-[var(--border)] text-muted hover:border-[var(--border-strong)]"}`}
              onClick={() => setQuery({ quick: value, start: undefined, end: undefined })}
            >
              {label}
            </button>
          ))}
        </div>

        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50" role="dialog" aria-modal="true" aria-label="Timeline filters">
            <div className="max-h-[82vh] w-full overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--bg)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">Filters</h3>
                <button
                  type="button"
                  className="focus-ring inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[var(--border)]"
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filter controls"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>

              <div className="grid gap-3">
<div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className="mb-1 block text-xs uppercase tracking-wider text-muted">From</span>
                    <input
                      className="focus-ring min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      type="date"
                      value={start ?? ""}
                      onChange={(e) => setQuery({ start: e.target.value || undefined, quick: undefined })}
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs uppercase tracking-wider text-muted">To</span>
                    <input
                      className="focus-ring min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
                      type="date"
                      value={end ?? ""}
                      onChange={(e) => setQuery({ end: e.target.value || undefined, quick: undefined })}
                    />
                  </label>
                </div>

                <button
                  className="focus-ring min-h-11 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-muted hover:border-[var(--border-strong)]"
                  onClick={() => {
                    resetDates();
                    setShowMobileFilters(false);
                  }}
                >
                  Clear dates
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden gap-3 md:grid md:grid-cols-5">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">Search</span>
          <input
            className="focus-ring min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-muted"
            value={q}
            onChange={(e) => setQuery({ q: e.target.value })}
            placeholder="Search post text"
            aria-label="Search posts"
          />
        </label>

<label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">From</span>
          <input className="focus-ring min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]" type="date" value={start ?? ""} onChange={(e) => setQuery({ start: e.target.value || undefined, quick: undefined })} />
        </label>

        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">To</span>
          <input className="focus-ring min-h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]" type="date" value={end ?? ""} onChange={(e) => setQuery({ end: e.target.value || undefined, quick: undefined })} />
        </label>
      </div>

      <div className="mt-3 hidden flex-wrap items-center gap-2 md:flex">
        {quickRanges.map(([value, label]) => (
          <button
            key={value}
            className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition ${quick === value ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]" : "border-[var(--border)] text-muted hover:border-[var(--border-strong)]"}`}
            onClick={() => setQuery({ quick: value, start: undefined, end: undefined })}
          >
            {label}
          </button>
        ))}
        <button className="focus-ring rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-muted hover:border-[var(--border-strong)]" onClick={resetDates}>
          Clear dates
        </button>
      </div>
    </section>
  );
}
