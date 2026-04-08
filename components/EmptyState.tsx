export function EmptyState() {
  return (
    <div className="glass-panel rounded-2xl p-10 text-center">
      <p className="text-lg font-semibold text-[var(--text-primary)]">No posts match this filter set.</p>
      <p className="mt-2 text-sm text-muted">Try widening the date range or switching sources.</p>
    </div>
  );
}
