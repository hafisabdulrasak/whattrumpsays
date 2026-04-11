#!/usr/bin/env node
/**
 * Direct Truth Social API sync — no Python, no Playwright required.
 *
 * Calls the Mastodon-compatible REST API with a bearer token,
 * normalizes posts to the CachedPost shape used by lib/ingestion.ts,
 * and merges them into data/posts.json (new data wins, never shrinks).
 *
 * Usage:
 *   node scripts/fetch_api.mjs
 *   node scripts/fetch_api.mjs --since 2026-01-01   # deep-fetch
 *
 * Required env var: TRUTHSOCIAL_TOKEN
 */

import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "data");
const OUT_PATH = join(DATA_DIR, "posts.json");
const STATUS_PATH = join(DATA_DIR, "truthsocial-sync-status.json");

const TRUMP_ACCOUNT_ID = "107780257626128497";
const API_BASE = `https://truthsocial.com/api/v1/accounts/${TRUMP_ACCOUNT_ID}/statuses`;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";

// ── helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(`[api-sync] ${msg}\n`);
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toIso(value) {
  try {
    return new Date(value).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function normalize(post) {
  const rawText = post.content || post.text || post.status || "";
  const text = stripHtml(String(rawText));
  if (!text) return null;

  const id = String(post.id || "");
  if (!id) return null;

  const sourceUrl =
    post.url ||
    post.uri ||
    `https://truthsocial.com/@realDonaldTrump/${id}`;

  const media = (post.media_attachments || [])
    .filter(
      (att) =>
        att.url &&
        (att.type === "image" || att.type === "video" || att.type === "gifv")
    )
    .map((att) => ({
      type: att.type === "image" ? "image" : "video",
      url: att.url,
      alt: att.description || "",
    }));

  return {
    id,
    text,
    createdAt: toIso(post.created_at),
    source: "Truth Social",
    sourceUrl,
    authorName: "Donald J. Trump",
    authorHandle: "@realDonaldTrump",
    media,
    isReply: Boolean(post.in_reply_to_id),
    isRepost: Boolean(post.reblog),
    sharesCount: parseInt(post.reblogs_count || 0, 10),
    favouritesCount: parseInt(post.favourites_count || 0, 10),
  };
}

function atomicWrite(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  const tmp = join(tmpdir(), `posts-${randomBytes(6).toString("hex")}.json`);
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  renameSync(tmp, filePath);
}

function writeStatus(status, error = null, count = 0) {
  atomicWrite(STATUS_PATH, {
    status,
    error,
    count,
    updatedAt: new Date().toISOString(),
  });
}

// ── API fetch ─────────────────────────────────────────────────────────────────

async function fetchPage(token, params = {}) {
  const url = new URL(API_BASE);
  url.searchParams.set("limit", "40");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const token = process.env.TRUTHSOCIAL_TOKEN;
  if (!token) {
    process.stderr.write(
      "[api-sync] Error: TRUTHSOCIAL_TOKEN environment variable is required\n"
    );
    process.exit(1);
  }

  // Parse optional --since YYYY-MM-DD
  const sinceIdx = process.argv.indexOf("--since");
  const since = sinceIdx !== -1 ? process.argv[sinceIdx + 1] : null;
  const sinceMs = since ? new Date(since).getTime() : null;
  // Without --since, fetch only the 3 most-recent pages (≈120 posts) for speed.
  // With --since, walk all the way back to that date.
  const maxPages = sinceMs ? 100 : 3;

  log(`starting sync${since ? ` (since ${since})` : " (recent, ~120 posts)"}`);

  // Load existing cache
  let existing = [];
  try {
    const raw = readFileSync(OUT_PATH, "utf-8");
    existing = JSON.parse(raw);
    if (!Array.isArray(existing)) existing = [];
    log(`loaded ${existing.length} existing posts from cache`);
  } catch {
    log("no existing cache — starting fresh");
  }

  // Fetch pages
  const allRaw = [];
  let maxId = null;
  let page = 1;

  try {
    while (page <= maxPages) {
      const params = {};
      if (maxId) params.max_id = maxId;

      log(`fetching page ${page}${maxId ? ` (max_id=${maxId})` : ""}`);
      const data = await fetchPage(token, params);

      if (!Array.isArray(data) || data.length === 0) {
        log("API returned empty page — done");
        break;
      }

      let stop = false;
      for (const post of data) {
        if (sinceMs) {
          const postMs = new Date(post.created_at || 0).getTime();
          if (postMs < sinceMs) {
            stop = true;
            break;
          }
        }
        allRaw.push(post);
      }

      log(
        `page ${page}: +${data.length} raw | running total=${allRaw.length} | oldest=${(data[data.length - 1]?.created_at || "").slice(0, 10)}`
      );

      if (stop) {
        log(`reached --since ${since}, stopping`);
        break;
      }
      if (data.length < 40) {
        log("last page (< 40 results)");
        break;
      }

      maxId = data[data.length - 1].id;
      page++;
      // Brief pause to be polite to the API
      await new Promise((r) => setTimeout(r, 500));
    }
  } catch (err) {
    // Partial failure: still merge whatever we got before the error
    process.stderr.write(`[api-sync] Fetch error: ${err.message}\n`);
    if (allRaw.length === 0) {
      writeStatus("failed", String(err), existing.length);
      process.exit(1);
    }
    log(`partial fetch (${allRaw.length} posts before error) — merging what we have`);
  }

  log(`total raw posts fetched: ${allRaw.length}`);

  // Normalize
  const normalized = allRaw.map(normalize).filter(Boolean);
  log(`normalized: ${normalized.length} posts`);

  // Merge — new data wins (fresher engagement counts), never lose old posts
  const merged = Object.fromEntries(
    existing.filter((p) => p?.id).map((p) => [p.id, p])
  );
  let newCount = 0;
  for (const p of normalized) {
    if (!merged[p.id]) newCount++;
    merged[p.id] = p;
  }

  const mergedList = Object.values(merged).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  log(
    `merged: ${mergedList.length} total (${newCount} new, ${normalized.length - newCount} updated)`
  );
  if (mergedList.length > 0) {
    log(`latest: ${mergedList[0].createdAt}`);
    log(`oldest: ${mergedList[mergedList.length - 1].createdAt}`);
  }

  atomicWrite(OUT_PATH, mergedList);
  writeStatus("success", null, mergedList.length);

  const result = { success: true, count: mergedList.length, new: newCount };
  process.stdout.write(JSON.stringify(result) + "\n");
}

main().catch((err) => {
  process.stderr.write(`[api-sync] Fatal: ${err.stack || err.message}\n`);
  writeStatus("failed", String(err), 0);
  process.exit(1);
});
