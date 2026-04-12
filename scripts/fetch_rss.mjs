#!/usr/bin/env node
/**
 * Fetches Truth Social posts via the public RSS feed.
 *
 * Why RSS works when the API/Playwright don't:
 *   - RSS is public, no authentication needed
 *   - Cloudflare whitelists RSS crawlers as "good bots"
 *   - Simple HTTP GET — no browser fingerprint to detect
 *   - Works from any IP including GitHub Actions / Vercel
 *
 * Limitation: RSS only returns ~20 most recent posts per fetch,
 * but running every 2 hours is more than enough to stay current.
 */

import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, "..");
const DATA_DIR   = join(ROOT, "data");
const OUT_PATH   = join(DATA_DIR, "posts.json");
const STATUS_PATH = join(DATA_DIR, "truthsocial-sync-status.json");

const RSS_URL   = "https://truthsocial.com/@realDonaldTrump.rss";
const USER_AGENT = "Feedbot/1.0 RSS reader (+https://whattrumpsays.vercel.app/)";

// ── helpers ───────────────────────────────────────────────────────────────────

function log(msg) { process.stdout.write(`[rss-sync] ${msg}\n`); }

/** Extract the text content of an XML tag, handling CDATA. */
function tag(xml, name) {
  const cdata = xml.match(new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`, "i"));
  if (cdata) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return plain ? plain[1].trim() : "";
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseRSS(xml) {
  const posts = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;

  while ((m = itemRe.exec(xml)) !== null) {
    const item = m[1];

    // Prefer <link>, fall back to <guid>
    const link = tag(item, "link") || tag(item, "guid");
    const pubDate = tag(item, "pubDate");
    const description = tag(item, "description");

    if (!link || !pubDate) continue;

    // ID is the numeric suffix of the URL
    const id = link.split("/").filter(Boolean).pop();
    if (!id || !/^\d+$/.test(id)) continue;

    const text = stripHtml(description);
    if (!text) continue;

    // Images may come as <enclosure> or <media:content>
    const media = [];
    const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image[^"]*"/i)
                   || item.match(/<media:content[^>]+url="([^"]+)"[^>]+medium="image"/i);
    if (enclosure) media.push({ type: "image", url: enclosure[1], alt: "" });

    let createdAt;
    try { createdAt = new Date(pubDate).toISOString(); }
    catch { continue; }

    posts.push({
      id,
      text,
      createdAt,
      source: "Truth Social",
      sourceUrl: link,
      authorName: "Donald J. Trump",
      authorHandle: "@realDonaldTrump",
      media,
      isReply: false,
      isRepost: false,
      sharesCount: 0,      // RSS doesn't expose engagement counts
      favouritesCount: 0,
    });
  }

  return posts;
}

function atomicWrite(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  const tmp = join(tmpdir(), `posts-${randomBytes(6).toString("hex")}.json`);
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  renameSync(tmp, filePath);
}

function writeStatus(status, error = null, count = 0) {
  atomicWrite(STATUS_PATH, { status, error, count, updatedAt: new Date().toISOString() });
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  log(`fetching ${RSS_URL}`);

  // Load existing cache
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(OUT_PATH, "utf-8"));
    if (!Array.isArray(existing)) existing = [];
    log(`loaded ${existing.length} existing posts from cache`);
  } catch { log("no existing cache — starting fresh"); }

  // Fetch RSS feed
  let xml;
  try {
    const res = await fetch(RSS_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
    }
    xml = await res.text();
    log(`received ${xml.length} bytes`);
  } catch (err) {
    writeStatus("failed", String(err), existing.length);
    process.stderr.write(`[rss-sync] Error: ${err.message}\n`);
    process.exit(1);
  }

  // Parse
  const fetched = parseRSS(xml);
  log(`parsed ${fetched.length} posts from RSS`);

  if (fetched.length === 0) {
    log("RSS returned 0 posts — feed may be empty or blocked");
    writeStatus("success", null, existing.length);
    process.stdout.write(JSON.stringify({ success: true, count: existing.length, new: 0 }) + "\n");
    return;
  }

  // Merge — never drop old posts, preserve existing engagement counts
  const merged = Object.fromEntries(existing.filter(p => p?.id).map(p => [p.id, p]));
  let newCount = 0;
  for (const p of fetched) {
    if (!merged[p.id]) {
      newCount++;
      merged[p.id] = p;
    } else {
      // Keep existing engagement counts; update text/media in case of edits
      merged[p.id] = {
        ...merged[p.id],
        text: p.text,
        media: p.media.length ? p.media : merged[p.id].media,
      };
    }
  }

  const mergedList = Object.values(merged).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  log(`merged: ${mergedList.length} total (${newCount} new)`);
  if (mergedList.length > 0) log(`latest: ${mergedList[0].createdAt}`);

  atomicWrite(OUT_PATH, mergedList);
  writeStatus("success", null, mergedList.length);
  process.stdout.write(JSON.stringify({ success: true, count: mergedList.length, new: newCount }) + "\n");
}

main().catch(err => {
  writeStatus("failed", String(err), 0);
  process.stderr.write(`[rss-sync] Fatal: ${err.stack || err.message}\n`);
  process.exit(1);
});
