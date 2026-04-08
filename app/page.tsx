import { Hero } from "@/components/Hero";
import { TimelineFeed } from "@/components/TimelineFeed";
import { getMergedPosts } from "@/lib/ingestion";

export default async function HomePage() {
  const initial = await getMergedPosts({ limit: 8, source: "all" });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Hero />
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-3 text-xl font-bold">Latest Timeline</h2>
          <TimelineFeed initial={initial} />
        </div>
        <aside className="glass-panel rounded-2xl p-5 text-sm text-secondary">
          <h3 className="font-semibold uppercase tracking-wider text-[var(--accent)]">Trust & Method</h3>
          <p className="mt-2">Entries are source-labeled, timestamped, and rendered as archival records. If a provider is unavailable, status is shown directly above the timeline.</p>
        </aside>
      </section>
    </main>
  );
}
