import { Hero } from "@/components/Hero";
import { TimelineFeed } from "@/components/TimelineFeed";
import { getMergedPosts } from "@/lib/ingestion";

export default async function HomePage() {
  const initial = await getMergedPosts({ limit: 8, source: "all" });

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
      <Hero />
      <section className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <div className="min-w-0">
          <h2 className="mb-3 text-lg font-bold sm:text-xl">Latest Timeline</h2>
          <TimelineFeed initial={initial} />
        </div>
        <aside className="glass-panel order-last rounded-2xl p-4 text-sm text-secondary sm:p-5 lg:order-none">
          <h3 className="font-semibold uppercase tracking-wider text-[var(--accent)]">Trust & Method</h3>
          <p className="mt-2 text-sm leading-6">
            Entries are source-labeled, timestamped, and rendered as archival records. If a provider is unavailable, status is shown directly above the timeline.
          </p>
        </aside>
      </section>
    </main>
  );
}
