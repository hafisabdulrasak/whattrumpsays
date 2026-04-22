"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTimelineStore } from "@/store/useTimelineStore";

const quickRanges = [
  ["today", "Today"],
  ["week", "This Week"],
  ["month", "This Month"],
  ["archive", "Archive Era"],
] as const;

const TAGS = ["Economy", "Immigration", "Media", "Foreign Policy", "Rally", "Legal", "Election"] as const;

export function FiltersBar() {
  const { q, tag, start, end, quick, setQuery, resetDates } = useTimelineStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const inputCls =
    "focus-ring min-h-11 w-full rounded border border-[rgba(45,42,166,0.2)] bg-white px-3 py-2 text-sm text-[#1F2937] placeholder:text-[#9CA3AF]";

  const labelCls = "mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#2D2AA6]/60";

  return (
    <section className="rounded-lg bg-white p-4 shadow-[0_2px_12px_rgba(45,42,166,0.10)] sm:p-5">

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden">
        <div className="flex items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search posts</span>
            <input
              className={inputCls}
              value={q}
              onChange={(e) => setQuery({ q: e.target.value })}
              placeholder="Search timeline…"
              aria-label="Search posts"
            />
          </label>
          <button
            type="button"
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-[rgba(45,42,166,0.2)] bg-white text-[#2D2AA6]"
            onClick={() => setShowMobileFilters(true)}
            aria-label="Open filter controls"
          >
            <SlidersHorizontal size={18} aria-hidden />
          </button>
        </div>

        {/* Quick range chips */}
        <div className="mt-2 -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickRanges.map(([value, label]) => (
            <button
              key={value}
              className={`focus-ring shrink-0 snap-start rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
                quick === value
                  ? "border-[#2D2AA6] bg-[#2D2AA6] text-[#F59E0B]"
                  : "border-[rgba(45,42,166,0.2)] text-[#2D2AA6] hover:border-[#2D2AA6]"
              }`}
              onClick={() => setQuery({ quick: value, start: undefined, end: undefined })}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tag chips */}
        <div className="mt-1.5 -mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TAGS.map((t) => (
            <button
              key={t}
              className={`focus-ring shrink-0 snap-start rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition ${
                tag === t
                  ? "bg-[#E11D48] text-white"
                  : "border border-[rgba(45,42,166,0.2)] text-[#2D2AA6] hover:border-[#2D2AA6]"
              }`}
              onClick={() => setQuery({ tag: tag === t ? undefined : t })}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Mobile filter sheet */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/50" role="dialog" aria-modal="true" aria-label="Timeline filters">
            <div className="max-h-[82vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[#2D2AA6]">Filters</h3>
                <button
                  type="button"
                  className="focus-ring inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[rgba(45,42,166,0.2)]"
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filter controls"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className={labelCls}>From</span>
                    <input className={inputCls} type="date" value={start ?? ""} onChange={(e) => setQuery({ start: e.target.value || undefined, quick: undefined })} />
                  </label>
                  <label>
                    <span className={labelCls}>To</span>
                    <input className={inputCls} type="date" value={end ?? ""} onChange={(e) => setQuery({ end: e.target.value || undefined, quick: undefined })} />
                  </label>
                </div>
                <button
                  className="focus-ring min-h-11 rounded border border-[rgba(45,42,166,0.2)] px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] text-[#2D2AA6] hover:bg-[#2D2AA6] hover:text-[#F59E0B]"
                  onClick={() => { resetDates(); setShowMobileFilters(false); }}
                >
                  Clear dates
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden gap-4 md:grid md:grid-cols-5">
        <label className="md:col-span-2">
          <span className={labelCls}>Search</span>
          <input className={inputCls} value={q} onChange={(e) => setQuery({ q: e.target.value })} placeholder="Search post text…" aria-label="Search posts" />
        </label>
        <label>
          <span className={labelCls}>From</span>
          <input className={inputCls} type="date" value={start ?? ""} onChange={(e) => setQuery({ start: e.target.value || undefined, quick: undefined })} />
        </label>
        <label>
          <span className={labelCls}>To</span>
          <input className={inputCls} type="date" value={end ?? ""} onChange={(e) => setQuery({ end: e.target.value || undefined, quick: undefined })} />
        </label>
        <div className="flex items-end">
          <button
            className="focus-ring min-h-11 w-full rounded border border-[rgba(45,42,166,0.2)] px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] text-[#2D2AA6] hover:bg-[#2D2AA6] hover:text-[#F59E0B] transition"
            onClick={resetDates}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Quick ranges — desktop */}
      <div className="mt-3 hidden flex-wrap items-center gap-2 md:flex">
        {quickRanges.map(([value, label]) => (
          <button
            key={value}
            className={`focus-ring rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] transition ${
              quick === value
                ? "border-[#2D2AA6] bg-[#2D2AA6] text-[#F59E0B]"
                : "border-[rgba(45,42,166,0.2)] text-[#2D2AA6] hover:border-[#2D2AA6]"
            }`}
            onClick={() => setQuery({ quick: value, start: undefined, end: undefined })}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tag chips — desktop */}
      <div className="mt-2 hidden flex-wrap items-center gap-1.5 md:flex">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#2D2AA6]/50">Topics:</span>
        {TAGS.map((t) => (
          <button
            key={t}
            className={`focus-ring rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition ${
              tag === t
                ? "bg-[#E11D48] text-white"
                : "border border-[rgba(45,42,166,0.2)] text-[#2D2AA6] hover:border-[#2D2AA6]"
            }`}
            onClick={() => setQuery({ tag: tag === t ? undefined : t })}
          >
            {t}
          </button>
        ))}
        {tag && (
          <button className="focus-ring text-[10px] font-semibold text-[#E11D48] underline-offset-2 hover:underline" onClick={() => setQuery({ tag: undefined })}>
            clear
          </button>
        )}
      </div>
    </section>
  );
}
