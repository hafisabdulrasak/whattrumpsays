export function LoadingSkeleton() {
  return (
    <div className="glass-panel animate-pulse rounded-2xl p-3.5 sm:p-5">
      <div className="mb-3 h-4 w-36 rounded bg-[var(--surface-elevated)] sm:w-40" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-[var(--surface-elevated)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--surface-elevated)]" />
        <div className="h-4 w-4/5 rounded bg-[var(--surface-elevated)]" />
      </div>
    </div>
  );
}
