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
      className="glass-panel rounded-2xl p-5 shadow-panel transition hover:shadow-glow"
    >
      <header className="mb-3 flex flex-wrap items-center gap-2 text-xs text-parchment/70">
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1">{post.sourceLabel}</span>
        {post.metadata.allCapsScore > 0.7 && <span className="rounded-full border border-crimson/50 bg-crimson/15 px-2 py-1 text-red-200">All Caps</span>}
        {post.metadata.rapidFireGroup && <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-1 text-gold">Rapid Fire</span>}
      </header>

      <p className="whitespace-pre-wrap text-base leading-relaxed text-parchment md:text-lg">{post.text}</p>

      <footer className="mt-4 flex flex-wrap items-center gap-3 text-xs text-parchment/65">
        <time dateTime={post.createdAt} title={format(new Date(post.createdAt), "PPPpp")}>{format(new Date(post.createdAt), "PPpp")}</time>
        <span>•</span>
        <span>{formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })}</span>
        <span>•</span>
        <Link href={`/post/${post.id}`} className="focus-ring underline-offset-4 hover:underline">Detail</Link>
        {post.sourceUrl && (
          <>
            <span>•</span>
            <a className="focus-ring underline-offset-4 hover:underline" href={post.sourceUrl} target="_blank" rel="noreferrer">
              Original
            </a>
          </>
        )}
      </footer>
    </motion.article>
  );
}
