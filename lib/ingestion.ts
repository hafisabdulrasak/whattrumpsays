import { unstable_cache } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { FeedQuery, NormalizedPost } from "@/lib/types";
import { parseCursor, quickRange } from "@/lib/utils";

const DATA_PATH = path.join(process.cwd(), "data", "posts.json");

const TAG_RULES: Record<string, string[]> = {
  Economy:          ["tariff","trade","tax","economy","jobs","inflation","market","stock","gdp","deficit","spending","budget","wall street","business"],
  Immigration:      ["border","immigration","immigrant","migrant","illegal","deportation","wall","ice","asylum","cartel"],
  Media:            ["fake news","media","cnn","msnbc","nbc","abc","cbs","press","journalist","newspaper","reporter","hoax"],
  "Foreign Policy": ["china","russia","ukraine","nato","israel","gaza","iran","north korea","saudi","nuclear","war","peace","deal"],
  Rally:            ["rally","maga","make america","crowd","supporters","thank you","thank u","great crowd"],
  Legal:            ["court","judge","witch hunt","indictment","trial","verdict","conviction","lawfare","prosecutor","guilty","innocent"],
  Election:         ["election","vote","ballot","rigged","fraud","stolen","democrat","republican","candidate","primary"],
};

function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.entries(TAG_RULES)
    .filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
    .map(([tag]) => tag);
}

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
        tags: detectTags(String(item.text ?? "")),
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
  if (query.tag) filtered = filtered.filter((post) => post.tags.includes(query.tag!));
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

    const limit = Math.min(query.limit ?? 20, 100);
    const pageNum = Math.max(query.page ?? 1, 1);
    const total = merged.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (pageNum - 1) * limit;
    const page = merged.slice(offset, offset + limit);
    const nextCursor = null;

    return {
      posts: page,
      nextCursor,
      page: pageNum,
      totalPages,
      total,
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
  const all = await readCachedPosts();
  return all.find((post) => post.id === id) ?? null;
}
