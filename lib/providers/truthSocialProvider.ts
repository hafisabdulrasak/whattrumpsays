import { truthSocialMock } from "@/lib/data/mockPosts";
import { FeedQuery, NormalizedPost, ProviderResult } from "@/lib/types";
import { PostProvider } from "@/lib/providers/base";

const sortDesc = (posts: NormalizedPost[]) => posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

export class TruthSocialProvider implements PostProvider {
  key = "truth_social";
  label = "Truth Social";

  async fetchPosts(query: FeedQuery): Promise<ProviderResult> {
    const posts = sortDesc([...truthSocialMock]);
    const filtered = applyFilters(posts, query);
    return {
      posts: filtered,
      nextCursor: null,
      sourceStatus: {
        source: "truth_social",
        available: true,
        detail: "Using development adapter with mock payload. Wire REAL_TRUTHSOCIAL_API_URL for live ingestion.",
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
