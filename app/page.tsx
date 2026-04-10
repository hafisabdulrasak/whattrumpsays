import Link from "next/link";
import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { TimelineFeed } from "@/components/TimelineFeed";
import { getMergedPosts } from "@/lib/ingestion";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Latest Trump Truth Social Posts & Archive Timeline",
  description:
    "Read Donald Trump's latest public Truth Social posts in a clean reverse-chronological timeline with source attribution, timestamps, and archived context.",
  path: "/"
});

export default async function HomePage() {
  const initial = await getMergedPosts({ limit: 8, source: "all" });
  const latest = initial.posts.slice(0, 3);

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

      <section className="glass-panel mt-4 rounded-2xl p-4 text-sm text-secondary sm:mt-5 sm:p-5" aria-labelledby="homepage-intro-heading">
        <h2 id="homepage-intro-heading" className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">What this site is</h2>
        <p className="mt-2 timeline-copy leading-6">
          What Trump Says is a readable archive of Donald Trump&apos;s public posts. We aggregate publicly available source data, keep the timeline in strict reverse chronology, and label each entry by origin.
        </p>
        <p className="mt-2 leading-6">Methodology, source handling, and caching notes are documented on the About page for transparency.</p>
        <nav className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm" aria-label="Key pages">
          <Link href="/timeline" className="focus-ring text-[var(--accent)] hover:underline">Browse full timeline</Link>
          <Link href="/about" className="focus-ring text-[var(--accent)] hover:underline">Read methodology</Link>
          {latest[0] && <Link href={`/post/${latest[0].id}`} className="focus-ring text-[var(--accent)] hover:underline">Open latest post</Link>}
        </nav>
      </section>

      <section className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <div className="min-w-0">
          <h2 className="mb-3 text-lg font-bold sm:text-xl">Latest Timeline</h2>
          <TimelineFeed initial={initial} />
        </div>
        <aside className="glass-panel order-last rounded-2xl p-4 text-sm text-secondary sm:p-5 lg:order-none" aria-labelledby="trust-heading">
          <h3 id="trust-heading" className="font-semibold uppercase tracking-wider text-[var(--accent)]">Trust &amp; Provenance</h3>
          <p className="mt-2 timeline-copy text-sm leading-6">
            Entries are source-labeled, timestamped, and rendered as archival records. If a provider is unavailable, status is shown directly above the timeline so freshness is never overstated.
          </p>
        </aside>
      </section>
    </main>
  );
}
