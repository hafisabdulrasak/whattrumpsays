export function EmptyState() {
  return (
    <div className="glass-panel rounded-2xl p-6 text-center sm:p-10">
      <p className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">No posts match this filter set.</p>
      <p className="mt-2 text-sm leading-6 text-muted">Try widening the date range or switching sources.</p>
    </div>
  );
}
