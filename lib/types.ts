export type PostSource = "truth_social" | "twitter_archive";

export type NormalizedPost = {
  id: string;
  text: string;
  createdAt: string;
  source: PostSource;
  sourceLabel: "Truth Social" | "Twitter Archive";
  sourceUrl?: string;
  authorName: string;
  authorHandle: string;
  media: Array<{ type: "image" | "video"; url: string; alt?: string }>;
  tags: string[];
  isArchive: boolean;
  metadata: {
    allCapsScore: number;
    rapidFireGroup?: string;
    characterCount: number;
  };
};

export type ProviderResult = {
  posts: NormalizedPost[];
  nextCursor: string | null;
  sourceStatus: {
    source: PostSource;
    available: boolean;
    detail: string;
    checkedAt: string;
  };
};

export type FeedQuery = {
  cursor?: string;
  limit?: number;
  source?: "all" | PostSource;
  q?: string;
  start?: string;
  end?: string;
  quick?: "today" | "week" | "month" | "archive";
};
