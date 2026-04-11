import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { TimelineFeed } from "@/components/TimelineFeed";
import { SidePanel } from "@/components/SidePanel";
import { getMergedPosts } from "@/lib/ingestion";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Latest Trump Truth Social Posts & Archive Timeline",
  description:
    "Read Donald Trump's latest public Truth Social posts in a clean reverse-chronological timeline with source attribution, timestamps, and archived context.",
  path: "/"
});

export default async function HomePage() {
  const [initial, sidebar] = await Promise.all([
    getMergedPosts({ limit: 8, source: "all" }),
    getMergedPosts({ limit: 100, source: "all" }),
  ]);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "What Trump Says homepage",
    url: absoluteUrl("/"),
    description: "Homepage for browsing and discovering Donald Trump public posts and timeline pages.",
    isPartOf: { "@type": "WebSite", name: "What Trump Says", url: absoluteUrl("/") }
  };

  return (
    <main className="page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(collectionSchema)} />
      <Hero />

<section className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <div className="min-w-0">
          <div className="mb-3">
            <h2 className="text-lg font-bold sm:text-xl">Latest Timeline</h2>
          </div>
          <TimelineFeed initial={initial} />
        </div>
        <aside className="order-last lg:order-none">
          <SidePanel posts={sidebar.posts} />
        </aside>
      </section>
    </main>
  );
}
