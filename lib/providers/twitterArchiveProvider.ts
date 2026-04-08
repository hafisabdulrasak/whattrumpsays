import { twitterArchiveMock } from "@/lib/data/mockPosts";
import { FeedQuery, NormalizedPost, ProviderResult } from "@/lib/types";
import { PostProvider } from "@/lib/providers/base";

const sortDesc = (posts: NormalizedPost[]) => posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

export class TwitterArchiveProvider implements PostProvider {
  key = "twitter_archive";
  label = "Twitter Archive";

  async fetchPosts(query: FeedQuery): Promise<ProviderResult> {
    const posts = sortDesc([...twitterArchiveMock]);
    const filtered = applyFilters(posts, query);

    return {
      posts: filtered,
      nextCursor: null,
      sourceStatus: {
        source: "twitter_archive",
        available: true,
        detail: "Using archival adapter mock data. Integrate archive CSV/JSON ingest for production history sync.",
        checkedAt: new Date().toISOString()
      }
    };
  }
}

function applyFilters(posts: NormalizedPost[], query: FeedQuery) {
  return posts.filter((post) => {
    if (query.q && !post.text.toLowerCase().includes(query.q.toLowerCase())) return false;
    if (query.start && +new Date(post.createdAt) < +new Date(query.start)) return false;
    if (query.end && +new Date(post.createdAt) > +new Date(query.end)) return false;
    return true;
  });
}
