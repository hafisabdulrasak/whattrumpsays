"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { format, formatDistanceToNowStrict } from "date-fns";
import { NormalizedPost } from "@/lib/types";

export function PostCard({ post, index }: { post: NormalizedPost; index: number }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.02, 0.18) }}
      className="card-surface rounded-2xl p-6 transition hover:shadow-[var(--shadow-gold)]"
    >
      <header className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="meta-pill rounded-full px-2.5 py-1">{post.sourceLabel}</span>
        {post.metadata.allCapsScore > 0.7 && <span className="rounded-full border border-[color:var(--error)]/50 bg-[color:var(--error)]/10 px-2.5 py-1 text-[color:var(--error)]">All Caps</span>}
        {post.metadata.rapidFireGroup && <span className="rounded-full border border-[var(--accent)]/50 bg-[var(--accent-soft)] px-2.5 py-1 text-[var(--accent)]">Rapid Fire</span>}
      </header>

      <p className="whitespace-pre-wrap break-words text-[1.02rem] leading-8 text-[var(--text-primary)] md:text-[1.1rem]">{post.text}</p>

      <footer className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted">
        <time dateTime={post.createdAt} title={format(new Date(post.createdAt), "PPPpp")}>{format(new Date(post.createdAt), "PPpp")}</time>
        <span>•</span>
        <span>{formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}</span>
        <span>•</span>
        <Link href={`/post/${post.id}`} className="focus-ring rounded-sm text-secondary underline-offset-4 hover:text-[var(--accent)] hover:underline">Detail</Link>
        {post.sourceUrl && (
          <>
            <span>•</span>
            <a className="focus-ring rounded-sm text-secondary underline-offset-4 hover:text-[var(--accent)] hover:underline" href={post.sourceUrl} target="_blank" rel="noreferrer">
              Original
            </a>
          </>
        )}
      </footer>
    </motion.article>
  );
}
