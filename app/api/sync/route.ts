import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SCRIPT_PATH = path.join(process.cwd(), "scripts", "fetch_truthsocial.py");
const DATA_PATH = path.join(process.cwd(), "data", "posts.json");

export async function POST() {
  try {
    await execFileAsync("python3", [SCRIPT_PATH]);

    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const posts = JSON.parse(raw);

    return NextResponse.json({ success: true, count: Array.isArray(posts) ? posts.length : 0 }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ success: false, count: 0, error: message }, { status: 500 });
  }
}
