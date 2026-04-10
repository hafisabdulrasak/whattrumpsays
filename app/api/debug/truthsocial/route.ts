import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const POSTS_PATH = path.join(ROOT, "data", "posts.json");
const STATUS_PATH = path.join(ROOT, "data", "truthsocial-sync-status.json");
const PYTHON_CMD = process.platform === "win32" ? "python" : "python3";

export async function GET() {
  const token = process.env.TRUTHSOCIAL_TOKEN?.trim() ?? "";
  const username = process.env.TRUTHSOCIAL_USERNAME?.trim() ?? "";
  const password = process.env.TRUTHSOCIAL_PASSWORD?.trim() ?? "";

  const postsStats = await fs.stat(POSTS_PATH).catch(() => null);
  const postsRaw = postsStats ? await fs.readFile(POSTS_PATH, "utf-8").catch(() => "") : "";
  let parsedPostCount = 0;
  if (postsRaw) {
    try {
      const parsed = JSON.parse(postsRaw);
      parsedPostCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      parsedPostCount = 0;
    }
  }

  const statusRaw = await fs.readFile(STATUS_PATH, "utf-8").catch(() => "");
  let lastSyncStatus: "success" | "failed" | "never" = "never";
  let lastSyncError: string | null = null;
  if (statusRaw) {
    try {
      const status = JSON.parse(statusRaw) as { status?: "success" | "failed"; error?: string };
      if (status.status === "success" || status.status === "failed") {
        lastSyncStatus = status.status;
        lastSyncError = status.error ?? null;
      }
    } catch {
      lastSyncStatus = "failed";
      lastSyncError = "Unable to parse sync status file.";
    }
  }

  const truthbrushInstalled = await execFileAsync(PYTHON_CMD, ["-c", "import shutil; print(bool(shutil.which('truthbrush'))) "]).then(({ stdout }) => stdout.trim() === "True").catch(() => false);
  const pythonVersion = await execFileAsync(PYTHON_CMD, ["--version"]).then(({ stdout, stderr }) => (stdout || stderr).trim()).catch(() => "unknown");

  return NextResponse.json({
    truthbrushInstalled,
    pythonVersion,
    credentialsPresent: Boolean(token) || (Boolean(username) && Boolean(password)),
    usingToken: Boolean(token),
    postsFileExists: Boolean(postsStats),
    postsFileSize: postsStats?.size ?? 0,
    parsedPostCount,
    lastModified: postsStats?.mtime.toISOString() ?? null,
    lastSyncStatus,
    lastSyncError
  });
}
