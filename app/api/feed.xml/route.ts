import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const DATA_PATH = path.join(process.cwd(), "data", "posts.json");

function esc(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc2822(iso: string) {
  return new Date(iso).toUTCString();
}

export async function GET() {
  let posts: Array<{ id: string; text: string; createdAt: string }> = [];
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      posts = parsed
        .filter((p) => p?.id && p?.text && p?.createdAt)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 50);
    }
  } catch {
    posts = [];
  }

  const items = posts
    .map((p) => {
      const link = absoluteUrl(`/post/${p.id}`);
      const title = esc(p.text.slice(0, 100) + (p.text.length > 100 ? "…" : ""));
      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc2822(p.createdAt)}</pubDate>
      <description><![CDATA[${p.text}]]></description>
    </item>`;
    })
    .join("");

  const lastBuild = posts[0] ? toRfc2822(posts[0].createdAt) : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(siteConfig.name)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${esc(siteConfig.description)}</description>
    <language>en-us</language>
    <ttl>300</ttl>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${absoluteUrl("/api/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
