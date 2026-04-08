import Link from "next/link";
import { notFound } from "next/navigation";
import { format, formatDistanceToNowStrict } from "date-fns";
import { getPostById } from "@/lib/ingestion";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Link href="/timeline" className="focus-ring text-xs uppercase tracking-wide text-[var(--accent)]">← Back to timeline</Link>
      <article className="card-surface mt-4 rounded-2xl p-6 hover:shadow-[var(--shadow-gold)]">
        <header className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="meta-pill rounded-full px-2.5 py-1">{post.sourceLabel}</span>
          <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "PPpp")}</time>
          <span>({formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })})</span>
        </header>
        <p className="whitespace-pre-wrap break-words text-[1.05rem] leading-8">{post.text}</p>
      </article>
    </main>
  );
}
