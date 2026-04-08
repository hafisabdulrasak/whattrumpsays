import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { FeedQuery, NormalizedPost } from "@/lib/types";

export function dedupePosts(posts: NormalizedPost[]) {
  const map = new Map<string, NormalizedPost>();
  for (const post of posts) {
    const key = `${post.text.trim().toLowerCase()}|${new Date(post.createdAt).toISOString()}`;
    if (!map.has(key)) map.set(key, post);
  }
  return [...map.values()];
}

export function parseCursor(cursor?: string) {
  if (!cursor) return null;
  const [iso, id] = cursor.split("__");
  return { iso, id };
}

export function buildCursor(post: NormalizedPost) {
  return `${post.createdAt}__${post.id}`;
}

export function quickRange(quick?: FeedQuery["quick"]) {
  const now = new Date();
  if (quick === "today") return { start: startOfDay(now), end: endOfDay(now) };
  if (quick === "week") return { start: startOfWeek(now), end: endOfWeek(now) };
  if (quick === "month") return { start: startOfMonth(now), end: endOfMonth(now) };
  if (quick === "archive") return { start: new Date("2015-01-01"), end: new Date("2021-12-31T23:59:59.999Z") };
  return null;
}
