import { format } from "date-fns";
import { NormalizedPost } from "@/lib/types";

export function SidePanel({ posts }: { posts: NormalizedPost[] }) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todaysPosts = posts.filter((p) => p.createdAt.startsWith(todayKey));
  const longestToday = todaysPosts.sort((a, b) => b.text.length - a.text.length)[0];
  const onThisDay = posts.filter((p) => p.isArchive && format(new Date(p.createdAt), "MM-dd") === format(new Date(), "MM-dd")).slice(0, 3);

  return (
    <aside className="space-y-4">
      <section className="glass-panel rounded-xl p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Volume Meter</h3>
        <p className="mt-2 text-3xl font-black text-parchment">{todaysPosts.length}</p>
        <p className="text-xs text-parchment/70">posts detected today</p>
      </section>
      <section className="glass-panel rounded-xl p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">Longest Post Today</h3>
        <p className="mt-2 line-clamp-4 text-sm text-parchment/85">{longestToday?.text ?? "No posts available in current feed window."}</p>
      </section>
      <section className="glass-panel rounded-xl p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">On This Day</h3>
        <ul className="mt-2 space-y-2 text-xs text-parchment/80">
          {onThisDay.length ? onThisDay.map((p) => <li key={p.id}>• {p.text.slice(0, 90)}...</li>) : <li>Archive entries for this date will appear here.</li>}
        </ul>
      </section>
    </aside>
  );
}
