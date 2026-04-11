import type { Metadata } from "next";
import { FiltersBar } from "@/components/FiltersBar";
import { SidePanel } from "@/components/SidePanel";
import { TimelineFeed } from "@/components/TimelineFeed";
import { getMergedPosts } from "@/lib/ingestion";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Donald Trump Timeline | Latest Truth Social Posts",
  description:
    "Explore a full reverse-chronological timeline of Donald Trump's public posts with source labels, filtering tools, and visible timestamps.",
  path: "/timeline"
});

export default async function TimelinePage() {
  const [initial, sidebar] = await Promise.all([
    getMergedPosts({ limit: 12, source: "all" }),
    getMergedPosts({ limit: 100, source: "all" }),
  ]);

  const timelineSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Donald Trump public post timeline",
    url: absoluteUrl("/timeline"),
    description: "Searchable reverse-chronological timeline of Donald Trump public posts.",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Timeline", item: absoluteUrl("/timeline") }
      ]
    }
  };

  return (
    <main className="page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(timelineSchema)} />
      <header>
        <h1 className="text-2xl font-black leading-tight text-[var(--text-primary)] sm:text-3xl">Donald Trump Post Timeline</h1>
        <p className="timeline-copy mt-2 text-sm leading-6 text-secondary">
          Browse the latest public posts in strict reverse chronology. Use filters to narrow by timeframe while keeping source provenance and timestamps visible.
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span>Source:</span>
          <span
            className="rounded-sm px-2 py-0.5 font-bold uppercase tracking-widest"
            style={{ background: "var(--accent)", color: "var(--bg)", fontSize: "9px" }}
          >
            Truth Social
          </span>
        </p>
      </header>

      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 mt-4 sm:mt-5" aria-label="Timeline filters">
        <FiltersBar />
      </div>

      <section className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:mt-6 md:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]" aria-label="Timeline content and context">
        <TimelineFeed initial={initial} />
        <aside className="order-last lg:order-none">
          <SidePanel posts={sidebar.posts} />
        </aside>
      </section>
    </main>
  );
}
