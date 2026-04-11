import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_PATH = path.join(process.cwd(), "data", "posts.json");

export async function POST() {
  // Sync requires running a local Python script and is not available
  // on serverless deployments (Vercel). Run `npm run sync` locally
  // and redeploy to update posts.
  const raw = await fs.readFile(DATA_PATH, "utf-8").catch(() => "[]");
  const posts = JSON.parse(raw);
  const count = Array.isArray(posts) ? posts.length : 0;

  return NextResponse.json(
    {
      success: false,
      message:
        "Sync is not available on serverless deployments. Run `npm run sync` locally and push data/posts.json to update the archive.",
      count,
    },
    { status: 503 }
  );
}
