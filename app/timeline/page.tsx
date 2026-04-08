import { FiltersBar } from "@/components/FiltersBar";
import { SidePanel } from "@/components/SidePanel";
import { TimelineFeed } from "@/components/TimelineFeed";
import { getMergedPosts } from "@/lib/ingestion";

export default async function TimelinePage() {
  const initial = await getMergedPosts({ limit: 12, source: "all" });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-black text-parchment">Full Timeline</h1>
      <p className="mt-2 text-sm text-parchment/75">Strict reverse chronology. Latest first. Source provenance always visible.</p>

      <div className="mt-5">
        <FiltersBar />
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <TimelineFeed initial={initial} />
        <div className="hidden lg:block">
          <SidePanel posts={initial.posts} />
        </div>
      </section>
    </main>
  );
}
