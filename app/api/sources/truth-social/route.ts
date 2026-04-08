import { NextResponse } from "next/server";
import { TruthSocialProvider } from "@/lib/providers/truthSocialProvider";

export async function GET() {
  const provider = new TruthSocialProvider();
  const data = await provider.fetchPosts({ limit: 10, source: "truth_social" });
  return NextResponse.json(data, { status: 200 });
}
