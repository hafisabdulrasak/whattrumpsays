import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About & Methodology",
  description:
    "Learn how What Trump Says aggregates Donald Trump public posts, handles source provenance, and communicates caching and data availability.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <header>
        <h1 className="text-3xl font-black">About this archive</h1>
        <p className="mt-3 text-sm leading-6 text-secondary">
          What Trump Says is an editorial-style timeline that helps readers quickly track Donald Trump&apos;s public posts with clear source labeling and timestamp context.
        </p>
      </header>

      <section className="glass-panel mt-6 space-y-5 rounded-2xl p-6 text-sm leading-7 text-secondary" aria-label="Methodology details">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Methodology &amp; source transparency</h2>
        <p>
          This site aggregates publicly available posts. It does not author, rewrite, or alter post meaning. Each timeline entry includes source attribution and the original timestamp when available.
        </p>
        <p>
          Primary source target: Donald J. Trump&apos;s official Truth Social account (@realDonaldTrump). Historical context may include public archive datasets where labeled.
        </p>
        <p>
          Data is cached to keep the timeline fast and resilient. If a source is temporarily unavailable, the interface surfaces that status directly rather than implying missing data is current.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--border)] p-5 text-sm leading-6 text-secondary" aria-label="Editorial trust notes">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Trust notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Posts are presented in reverse chronological order by timestamp.</li>
          <li>Source labels are displayed directly on every post card and detail page.</li>
          <li>Availability messaging appears when providers are offline or limited.</li>
        </ul>
      </section>
    </main>
  );
}
