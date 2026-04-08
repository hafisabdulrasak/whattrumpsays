import { NextRequest, NextResponse } from "next/server";
import { getMergedPosts } from "@/lib/ingestion";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;

  const payload = await getMergedPosts({
    cursor: search.get("cursor") ?? undefined,
    limit: search.get("limit") ? Number(search.get("limit")) : 12,
    source: (search.get("source") as "all" | "truth_social" | "twitter_archive" | null) ?? "all",
    q: search.get("q") ?? undefined,
    start: search.get("start") ?? undefined,
    end: search.get("end") ?? undefined,
    quick: (search.get("quick") as "today" | "week" | "month" | "archive" | null) ?? undefined
  });

  return NextResponse.json(payload, { status: 200 });
}
