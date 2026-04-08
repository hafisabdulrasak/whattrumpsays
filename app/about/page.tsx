export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-black">About this archive</h1>
      <div className="glass-panel mt-6 space-y-5 rounded-2xl p-6 text-sm leading-7 text-secondary">
        <p>
          What Trump Says is an aggregation interface. It does not author or alter post text. It displays posts from provider adapters and labels every record by source.
        </p>
        <p>
          Primary source target: Donald J. Trump’s official Truth Social account (@realDonaldTrump). Historical source target: public Twitter archive datasets (2015–2021).
        </p>
        <p>
          Each post card preserves the original timestamp when available. If source systems fail, the UI displays provider status and avoids suggesting false freshness.
        </p>
      </div>
    </main>
  );
}
