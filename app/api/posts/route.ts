import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { buildCursor, parseCursor, quickRange } from "@/lib/utils";
import { NormalizedPost } from "@/lib/types";

const DATA_PATH = path.join(process.cwd(), "data", "posts.json");
const STATUS_PATH = path.join(process.cwd(), "data", "truthsocial-sync-status.json");

type CachedPost = {
  id: string;
  text: string;
  createdAt: string;
  source?: string;
  sourceUrl?: string;
  authorName?: string;
  authorHandle?: string;
  media?: Array<{ type: "image" | "video"; url: string; alt?: string }>;
  sharesCount?: number;
  favouritesCount?: number;
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  Economy: ["economy","jobs","gdp","inflation","market","stock","trade","tariff","tax","budget","deficit","debt","unemployment","recession","business","growth","finance","dollar","interest rates","wall street","fed ","federal reserve"],
  Immigration: ["immigration","immigrant","border","illegal","migrant","deportation","deport","asylum","ice","customs","mexico","cartel","wall","sanctuary","visa","citizenship"],
  Media: ["fake news","media","cnn","nbc","abc","msnbc","fox news","press","reporter","journalist","newspaper","lamestream","mainstream","anchor","pundit"],
  "Foreign Policy": ["china","russia","ukraine","nato","iran","israel","pakistan","india","europe","saudi","japan","korea","taiwan","diplomacy","treaty","sanctions","foreign","middle east","allies"],
  Rally: ["rally","maga","crowd","speech","join us","come to","see you in","tremendous crowd","save america"],
  Legal: ["court","judge","trial","verdict","law","legal","case","indictment","charges","witch hunt","prosecution","attorney","appeal","supreme court","lawsuit","constitution","rights","justice"],
  Election: ["election","vote","voter","ballot","fraud","rigged","results","polls","campaign","democrat","republican","electoral","primary","candidate","2024","2028"],
};

function deriveTags(text: string): string[] {
  const lower = text.toLowerCase();
  return Object.entries(TOPIC_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
    .map(([topic]) => topic);
}

function allCapsScore(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 2 && /[A-Z]/.test(w));
  if (words.length === 0) return 0;
  const caps = words.filter((w) => w === w.toUpperCase());
  return caps.length / words.length;
}

function toNormalizedPost(item: CachedPost): NormalizedPost {
  const text = String(item.text ?? "");
  return {
    id: String(item.id),
    text,
    createdAt: new Date(item.createdAt).toISOString(),
    source: "truth_social",
    sourceLabel: "Truth Social",
    sourceUrl: item.sourceUrl,
    authorName: item.authorName ?? "Donald J. Trump",
    authorHandle: item.authorHandle ?? "@realDonaldTrump",
    media: Array.isArray(item.media) ? item.media : [],
    tags: deriveTags(text),
    isArchive: false,
    metadata: {
      allCapsScore: allCapsScore(text),
      characterCount: text.length,
      sharesCount: item.sharesCount ?? 0,
      favouritesCount: item.favouritesCount ?? 0,
    }
  };
}

async function readSyncWarning() {
  const raw = await fs.readFile(STATUS_PATH, "utf-8").catch(() => "");
  if (!raw) return "No recent sync status available.";

  try {
    const parsed = JSON.parse(raw) as { status?: string; error?: string; updatedAt?: string };
    if (parsed.status === "failed") {
      return `Last sync failed${parsed.updatedAt ? ` at ${parsed.updatedAt}` : ""}${parsed.error ? `: ${parsed.error}` : "."}`;
    }
    return "Data source: Truth Social (cached).";
  } catch {
    return "Data source: Truth Social (cached).";
  }
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(search.get("limit") ?? "20") || 20, 1), 100);
  const pageParam = Math.max(Number(search.get("page") ?? "1") || 1, 1);
  const cursor = parseCursor(search.get("cursor") ?? undefined);
  const q = search.get("q")?.trim().toLowerCase() ?? "";
  const tag = search.get("tag") ?? "";
  const source = search.get("source") ?? "all";
  const startParam = search.get("start") ?? "";
  const endParam = search.get("end") ?? "";
  const quick = search.get("quick") as Parameters<typeof quickRange>[0];

  const raw = await fs.readFile(DATA_PATH, "utf-8").catch(() => "");
  if (!raw) {
    return NextResponse.json(
      {
        posts: [],
        nextCursor: null,
        meta: {
          source: "Truth Social",
          cached: false,
          count: 0
        },
        sourceStatuses: [
          {
            source: "truth_social",
            available: false,
            detail: "No cached Truth Social posts available yet.",
            checkedAt: new Date().toISOString()
          }
        ]
      },
      { status: 200 }
    );
  }

  let parsed: CachedPost[] = [];
  try {
    const json = JSON.parse(raw);
    parsed = Array.isArray(json) ? (json as CachedPost[]) : [];
  } catch {
    parsed = [];
  }

  let posts = parsed
    .filter((item) => item && item.id && item.createdAt)
    .map(toNormalizedPost)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  // Text search
  if (q) {
    posts = posts.filter((post) => post.text.toLowerCase().includes(q));
  }

  // Tag filter
  if (tag) {
    posts = posts.filter((post) => post.tags.includes(tag));
  }

  // Source filter
  if (source && source !== "all") {
    posts = posts.filter((post) => post.source === source);
  }

  // Date range — quick presets take precedence over manual start/end
  const range = quickRange(quick) ?? (
    startParam || endParam
      ? { start: startParam ? new Date(startParam) : null, end: endParam ? new Date(endParam) : null }
      : null
  );
  if (range) {
    posts = posts.filter((post) => {
      const t = +new Date(post.createdAt);
      if (range.start && t < +range.start) return false;
      if (range.end && t > +range.end) return false;
      return true;
    });
  }

  const total = posts.length;

  // Page-based pagination (when no cursor supplied)
  if (!cursor) {
    const offset = (pageParam - 1) * limit;
    const page = posts.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);
    const warningDetail = await readSyncWarning();

    return NextResponse.json(
      {
        posts: page,
        nextCursor: null,
        page: pageParam,
        totalPages,
        total,
        meta: { source: "Truth Social", cached: true, count: parsed.length },
        sourceStatuses: [
          {
            source: "truth_social",
            available: page.length > 0,
            detail: warningDetail,
            checkedAt: new Date().toISOString(),
          },
        ],
      },
      { status: 200 }
    );
  }

  // Legacy cursor mode (used internally for sidebar fetches)
  posts = posts.filter((post) => {
    const newerThanCursor = +new Date(post.createdAt) > +new Date(cursor.iso);
    if (newerThanCursor) return false;
    if (post.createdAt === cursor.iso && post.id >= cursor.id) return false;
    return true;
  });

  const cursorPage = posts.slice(0, limit);
  const nextCursor = posts.length > limit && cursorPage.length > 0 ? buildCursor(cursorPage[cursorPage.length - 1]) : null;
  const warningDetail = await readSyncWarning();

  return NextResponse.json(
    {
      posts: cursorPage,
      nextCursor,
      page: 1,
      totalPages: 1,
      total,
      meta: { source: "Truth Social", cached: true, count: parsed.length },
      sourceStatuses: [
        {
          source: "truth_social",
          available: cursorPage.length > 0,
          detail: warningDetail,
          checkedAt: new Date().toISOString(),
        },
      ],
    },
    { status: 200 }
  );
}
