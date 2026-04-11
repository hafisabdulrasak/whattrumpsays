export function LoadingSkeleton() {
  return (
    <div className="glass-panel rounded-2xl p-3.5 sm:p-5">
      <div className="mb-3 h-4 w-36 rounded skeleton-shimmer sm:w-40" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded skeleton-shimmer" />
        <div className="h-4 w-5/6 rounded skeleton-shimmer" style={{ animationDelay: "0.1s" }} />
        <div className="h-4 w-4/5 rounded skeleton-shimmer" style={{ animationDelay: "0.2s" }} />
      </div>
    </div>
  );
}
