import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { format, formatDistanceToNowStrict } from "date-fns";
import { getMergedPosts, getPostById } from "@/lib/ingestion";
import { absoluteUrl, buildMetadata, jsonLd } from "@/lib/seo";

type Params = { params: Promise<{ id: string }> };

function excerpt(text: string, max = 140) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return buildMetadata({
      title: "Post not found",
      description: "This post could not be found in the archive.",
      path: `/post/${id}`
    });
  }

  return buildMetadata({
    title: `${format(new Date(post.createdAt), "PPP")}: ${excerpt(post.text, 58)}`,
    description: `${excerpt(post.text, 150)} Source: ${post.sourceLabel}.`,
    path: `/post/${post.id}`,
    type: "article",
    ogImage: `/post/${post.id}/opengraph-image`,
  });
}

export default async function PostPage({ params }: Params) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  const relatedFeed = await getMergedPosts({ limit: 8, source: "all" });
  const related = relatedFeed.posts.filter((candidate) => candidate.id !== post.id).slice(0, 3);

  const postSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: excerpt(post.text, 110),
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    articleBody: post.text,
    mainEntityOfPage: absoluteUrl(`/post/${post.id}`),
    author: {
      "@type": "Person",
      name: post.authorName
    },
    publisher: {
      "@type": "Organization",
      name: "What Trump Says"
    },
    isPartOf: absoluteUrl("/timeline")
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(postSchema)} />

      <nav className="text-xs text-secondary" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="focus-ring hover:text-[var(--accent)]">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/timeline" className="focus-ring hover:text-[var(--accent)]">Timeline</Link></li>
          <li aria-hidden>/</li>
          <li className="text-[var(--text-primary)]">Post</li>
        </ol>
      </nav>

      <article className="card-surface mt-4 rounded-2xl p-6 hover:shadow-[var(--shadow-gold)]">
        <header className="mb-4">
          <h1 className="text-2xl font-black leading-tight">Trump post archive entry</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="meta-pill rounded-full px-2.5 py-1">{post.sourceLabel}</span>
            <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "PPpp")}</time>
            <span>({formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })})</span>
          </div>
          <p className="mt-2 text-sm text-secondary">Source attribution is preserved. This page reflects the public post text as captured by the archive.</p>
        </header>

        <p className="whitespace-pre-wrap break-words text-[1.05rem] leading-8">{post.text}</p>

        {post.sourceUrl && (
          <p className="mt-4 text-sm text-secondary">
            Original source: <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="focus-ring text-[var(--accent)] hover:underline">View on source platform</a>
          </p>
        )}
      </article>

      {related.length > 0 && (
        <section className="mt-6 rounded-2xl border border-[var(--border)] p-5" aria-labelledby="related-posts-heading">
          <h2 id="related-posts-heading" className="text-lg font-semibold">Related recent posts</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/post/${item.id}`} className="focus-ring text-[var(--accent)] hover:underline">
                  {format(new Date(item.createdAt), "PPP p")} — {excerpt(item.text, 88)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
