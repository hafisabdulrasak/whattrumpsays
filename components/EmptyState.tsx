export function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-[0_2px_12px_rgba(45,42,166,0.08)] sm:p-10" role="status" aria-live="polite">
      <p className="text-base font-semibold text-[#2D2AA6] sm:text-lg">No posts match this filter set yet.</p>
      <p className="mt-2 text-sm leading-6 text-[#6B7280]">
        Try widening the date range, switching sources, or clearing search terms to continue exploring the archive.
      </p>
    </div>
  );
}
