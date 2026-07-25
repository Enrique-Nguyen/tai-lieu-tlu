/**
 * Root loading.tsx — Next.js Suspense fallback for the entire app.
 * Shown immediately when navigating to any route that takes >0ms to render.
 * Matches the layout of the home page (list of post cards with filters).
 */
export default function RootLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {[80, 100, 120, 90, 110].map((w, i) => (
          <div
            key={i}
            className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Post card skeletons */}
      {[1, 2, 3].map((i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      {/* Author + badge row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="h-6 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
      </div>

      {/* Subject tag */}
      <div className="h-6 w-36 bg-slate-100 dark:bg-slate-800/60 rounded-md" />

      {/* Title */}
      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="h-7 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        <div className="flex gap-2">
          <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
          <div className="h-7 w-20 bg-blue-100 dark:bg-blue-950/40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
