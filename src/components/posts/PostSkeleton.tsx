export default function PostSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-3 w-28 bg-white/[0.06] rounded" />
          <div className="h-2.5 w-20 bg-white/[0.06] rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-white/[0.06] rounded" />
        <div className="h-3 w-5/6 bg-white/[0.06] rounded" />
        <div className="h-3 w-4/6 bg-white/[0.06] rounded" />
      </div>
      <div className="flex gap-4 pt-3 border-t border-border-muted">
        <div className="h-4 w-12 bg-white/[0.06] rounded" />
        <div className="h-4 w-12 bg-white/[0.06] rounded" />
      </div>
    </div>
  );
}
