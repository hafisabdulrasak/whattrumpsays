export function LoadingSkeleton() {
  return (
    <div className="glass-panel animate-pulse rounded-2xl p-5">
      <div className="mb-3 h-4 w-40 rounded bg-white/10" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
        <div className="h-4 w-4/5 rounded bg-white/10" />
      </div>
    </div>
  );
}
