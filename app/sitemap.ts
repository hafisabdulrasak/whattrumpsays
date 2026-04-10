import type { MetadataRoute } from "next";
import { getMergedPosts } from "@/lib/ingestion";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const feed = await getMergedPosts({ source: "all", limit: 5000 });

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/timeline"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/offline"), changeFrequency: "monthly", priority: 0.3 }
  ];

  const postPages: MetadataRoute.Sitemap = feed.posts.map((post) => ({
    url: absoluteUrl(`/post/${post.id}`),
    lastModified: new Date(post.createdAt),
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [...staticPages, ...postPages];
}
