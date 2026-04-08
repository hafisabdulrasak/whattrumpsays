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
      <Link href="/timeline" className="focus-ring text-xs uppercase tracking-wide text-gold">← Back to timeline</Link>
      <article className="glass-panel mt-4 rounded-2xl p-6 shadow-glow">
        <header className="mb-4 flex items-center gap-2 text-xs text-parchment/70">
          <span className="rounded-full border border-white/20 px-2 py-1">{post.sourceLabel}</span>
          <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "PPpp")}</time>
          <span>({formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })})</span>
        </header>
        <p className="whitespace-pre-wrap text-lg leading-relaxed">{post.text}</p>
      </article>
    </main>
  );
}
