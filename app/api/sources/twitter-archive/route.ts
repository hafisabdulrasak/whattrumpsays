import { NextResponse } from "next/server";
import { TwitterArchiveProvider } from "@/lib/providers/twitterArchiveProvider";

export async function GET() {
  const provider = new TwitterArchiveProvider();
  const data = await provider.fetchPosts({ limit: 10, source: "twitter_archive" });
  return NextResponse.json(data, { status: 200 });
}
