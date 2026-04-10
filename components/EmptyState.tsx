export function EmptyState() {
  return (
    <div className="glass-panel rounded-2xl p-5 text-center sm:p-10" role="status" aria-live="polite">
      <p className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">No posts match this filter set yet.</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Try widening the date range, switching sources, or clearing search terms to continue exploring the archive.
      </p>
    </div>
  );
}
