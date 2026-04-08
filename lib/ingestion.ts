import { unstable_cache } from "next/cache";
import { FeedQuery, NormalizedPost } from "@/lib/types";
import { TruthSocialProvider } from "@/lib/providers/truthSocialProvider";
import { TwitterArchiveProvider } from "@/lib/providers/twitterArchiveProvider";
import { buildCursor, dedupePosts, parseCursor, quickRange } from "@/lib/utils";

const truth = new TruthSocialProvider();
const archive = new TwitterArchiveProvider();

export const getMergedPosts = unstable_cache(
  async (query: FeedQuery) => {
    const providers = query.source === "truth_social" ? [truth] : query.source === "twitter_archive" ? [archive] : [truth, archive];
    const results = await Promise.all(providers.map((provider) => provider.fetchPosts(query)));
    let merged = dedupePosts(results.flatMap((result) => result.posts));

    const range = quickRange(query.quick);
    if (range) {
      merged = merged.filter((post) => +new Date(post.createdAt) >= +range.start && +new Date(post.createdAt) <= +range.end);
    }

    merged.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    const cursor = parseCursor(query.cursor);
    if (cursor) {
      merged = merged.filter((post) => {
        const newerThanCursor = +new Date(post.createdAt) > +new Date(cursor.iso);
        if (newerThanCursor) return false;
        if (post.createdAt === cursor.iso && post.id >= cursor.id) return false;
        return true;
      });
    }

    const limit = Math.min(query.limit ?? 12, 50);
    const page = merged.slice(0, limit);
    const nextCursor = merged.length > limit ? buildCursor(page[page.length - 1]) : null;

    return {
      posts: page,
      nextCursor,
      sourceStatuses: results.map((r) => r.sourceStatus)
    };
  },
  ["merged-posts"],
  { revalidate: 60 }
);

export async function getPostById(id: string): Promise<NormalizedPost | null> {
  const merged = await getMergedPosts({ source: "all", limit: 200 });
  return merged.posts.find((post) => post.id === id) ?? null;
}
