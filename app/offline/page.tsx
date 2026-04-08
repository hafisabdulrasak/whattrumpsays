import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12 md:px-6">
      <section className="card-surface w-full rounded-3xl p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Offline</p>
        <h1 className="mt-3 text-3xl font-black text-[var(--text-primary)]">You are currently offline</h1>
        <p className="mt-4 text-secondary">
          The app shell is available, but timeline data requires a live connection. Reconnect and refresh to fetch the latest posts.
        </p>
        <Link href="/" className="focus-ring button-gold mt-7 inline-flex rounded-md px-5 py-2 text-sm font-semibold">
          Return Home
        </Link>
      </section>
    </main>
  );
}
