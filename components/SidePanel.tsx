import { format } from "date-fns";
import { NormalizedPost } from "@/lib/types";

export function SidePanel({ posts }: { posts: NormalizedPost[] }) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todaysPosts = posts.filter((p) => p.createdAt.startsWith(todayKey));
  const longestToday = todaysPosts.sort((a, b) => b.text.length - a.text.length)[0];
  const onThisDay = posts.filter((p) => p.isArchive && format(new Date(p.createdAt), "MM-dd") === format(new Date(), "MM-dd")).slice(0, 3);

  return (
    <aside className="space-y-3 sm:space-y-4">
      <section className="glass-panel rounded-xl p-3.5 sm:p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] sm:text-sm">Volume Meter</h3>
        <p className="mt-2 text-2xl font-black text-[var(--text-primary)] sm:text-3xl">{todaysPosts.length}</p>
        <p className="text-xs text-muted">posts detected today</p>
      </section>
      <section className="glass-panel rounded-xl p-3.5 sm:p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] sm:text-sm">Longest Post Today</h3>
        <p className="mt-2 line-clamp-4 text-sm leading-6 text-secondary">{longestToday?.text ?? "No posts available in current feed window."}</p>
      </section>
      <section className="glass-panel rounded-xl p-3.5 sm:p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] sm:text-sm">On This Day</h3>
        <ul className="mt-2 space-y-2 text-xs leading-5 text-secondary">
          {onThisDay.length ? onThisDay.map((p) => <li key={p.id}>• {p.text.slice(0, 90)}...</li>) : <li>Archive entries for this date will appear here.</li>}
        </ul>
      </section>
    </aside>
  );
}
