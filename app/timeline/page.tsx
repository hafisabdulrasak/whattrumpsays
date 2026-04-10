import { FiltersBar } from "@/components/FiltersBar";
import { SidePanel } from "@/components/SidePanel";
import { TimelineFeed } from "@/components/TimelineFeed";
import { getMergedPosts } from "@/lib/ingestion";

export default async function TimelinePage() {
  const initial = await getMergedPosts({ limit: 12, source: "all" });

  return (
    <main className="page-shell">
      <h1 className="text-2xl font-black leading-tight text-[var(--text-primary)] sm:text-3xl">Full Timeline</h1>
      <p className="timeline-copy mt-2 text-sm leading-6 text-secondary">Strict reverse chronology. Latest first. Source provenance always visible.</p>

      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 mt-4 sm:mt-5">
        <FiltersBar />
      </div>

      <section className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:mt-6 md:gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <TimelineFeed initial={initial} />
        <div className="order-last xl:order-none xl:block">
          <SidePanel posts={initial.posts} />
        </div>
      </section>
    </main>
  );
}
