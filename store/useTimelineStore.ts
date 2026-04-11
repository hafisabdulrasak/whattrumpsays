"use client";

import { create } from "zustand";
import { FeedQuery } from "@/lib/types";

type TimelineState = {
  q: string;
  source: FeedQuery["source"];
  tag?: string;
  start?: string;
  end?: string;
  quick?: FeedQuery["quick"];
  setQuery: (next: Partial<Pick<TimelineState, "q" | "source" | "tag" | "start" | "end" | "quick">>) => void;
  resetDates: () => void;
};

export const useTimelineStore = create<TimelineState>((set) => ({
  q: "",
  source: "all",
  tag: undefined,
  quick: undefined,
  setQuery: (next) => set(next),
  resetDates: () => set({ start: undefined, end: undefined, quick: undefined })
}));
