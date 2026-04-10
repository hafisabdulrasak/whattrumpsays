import { unstable_cache } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { FeedQuery, NormalizedPost } from "@/lib/types";
import { buildCursor, parseCursor, quickRange } from "@/lib/utils";

const DATA_PATH = path.join(process.cwd(), "data", "posts.json");

type CachedPost = {
  id: string;
  text: string;
  createdAt: string;
  source: string;
  sourceUrl?: string;
  authorName: string;
  authorHandle: string;
  media?: Array<{ type: "image" | "video"; url: string; alt?: string }>;
  isReply?: boolean;
  isRepost?: boolean;
  sharesCount?: number;
  favouritesCount?: number;
};

async function readCachedPosts(): Promise<NormalizedPost[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is CachedPost => Boolean(item && typeof item === "object" && item.id && item.createdAt))
      .map((item) => ({
        id: String(item.id),
        text: String(item.text ?? ""),
        createdAt: new Date(item.createdAt).toISOString(),
        source: "truth_social" as const,
        sourceLabel: "Truth Social" as const,
        sourceUrl: item.sourceUrl,
        authorName: item.authorName ?? "Donald J. Trump",
        authorHandle: item.authorHandle ?? "@realDonaldTrump",
        media: Array.isArray(item.media) ? item.media : [],
        tags: [],
        isArchive: false,
        metadata: {
          allCapsScore: 0,
          characterCount: String(item.text ?? "").length,
          sharesCount: item.sharesCount ?? 0,
          favouritesCount: item.favouritesCount ?? 0,
        }
      }))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } catch {
    return [];
  }
}

function applyFilters(posts: NormalizedPost[], query: FeedQuery) {
  let filtered = posts;

  if (query.q) filtered = filtered.filter((post) => post.text.toLowerCase().includes(query.q!.toLowerCase()));
  if (query.start) filtered = filtered.filter((post) => +new Date(post.createdAt) >= +new Date(query.start!));
  if (query.end) filtered = filtered.filter((post) => +new Date(post.createdAt) <= +new Date(query.end!));

  const range = quickRange(query.quick);
  if (range) {
    filtered = filtered.filter((post) => +new Date(post.createdAt) >= +range.start && +new Date(post.createdAt) <= +range.end);
  }

  return filtered;
}

export const getMergedPosts = unstable_cache(
  async (query: FeedQuery) => {
    let merged = applyFilters(await readCachedPosts(), query);

    const cursor = parseCursor(query.cursor);
    if (cursor) {
      merged = merged.filter((post) => {
        const newerThanCursor = +new Date(post.createdAt) > +new Date(cursor.iso);
        if (newerThanCursor) return false;
        if (post.createdAt === cursor.iso && post.id >= cursor.id) return false;
        return true;
      });
    }

    const limit = Math.min(query.limit ?? 12, 100);
    const page = merged.slice(0, limit);
    const nextCursor = merged.length > limit ? buildCursor(page[page.length - 1]) : null;

    return {
      posts: page,
      nextCursor,
      sourceStatuses: [
        {
          source: "truth_social",
          available: page.length > 0,
          detail: page.length > 0 ? "Data source: Truth Social (cached)." : "No cached Truth Social posts available yet.",
          checkedAt: new Date().toISOString()
        }
      ]
    };
  },
  ["merged-posts"],
  { revalidate: 30 }
);

export async function getPostById(id: string): Promise<NormalizedPost | null> {
  const merged = await getMergedPosts({ source: "all", limit: 200 });
  return merged.posts.find((post) => post.id === id) ?? null;
}
