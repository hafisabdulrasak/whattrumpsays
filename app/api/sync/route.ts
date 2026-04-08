import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts", "fetch_truthsocial.py");
const DATA_PATH = path.join(ROOT, "data", "posts.json");

function runSyncScript() {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn("python3", [SCRIPT_PATH], {
      cwd: ROOT,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

export async function POST() {
  const previousRaw = await fs.readFile(DATA_PATH, "utf-8").catch(() => "[]");
  const previousPosts = JSON.parse(previousRaw);
  const previousCount = Array.isArray(previousPosts) ? previousPosts.length : 0;

  try {
    const result = await runSyncScript();

    if (result.code !== 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Truth Social sync failed. Cached posts were preserved.",
          count: previousCount,
          stdout: result.stdout,
          stderr: result.stderr,
          outputPath: DATA_PATH
        },
        { status: 500 }
      );
    }

    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const posts = JSON.parse(raw);

    return NextResponse.json(
      {
        success: true,
        message: "Truth Social sync completed successfully.",
        count: Array.isArray(posts) ? posts.length : 0,
        stdout: result.stdout,
        stderr: result.stderr,
        outputPath: DATA_PATH
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json(
      {
        success: false,
        message: `Truth Social sync execution error: ${message}`,
        count: previousCount,
        stdout: "",
        stderr: message,
        outputPath: DATA_PATH
      },
      { status: 500 }
    );
  }
}
