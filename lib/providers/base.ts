import { FeedQuery, ProviderResult } from "@/lib/types";

export interface PostProvider {
  key: string;
  label: string;
  fetchPosts(query: FeedQuery): Promise<ProviderResult>;
}
