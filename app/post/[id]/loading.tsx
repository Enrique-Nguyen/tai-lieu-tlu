/**
 * loading.tsx for /post/[id]
 * Skeleton matching the post detail page layout.
 */
export default function PostDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      {/* Back button */}
      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />

      {/* Post card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        {/* Author row */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
          <div className="ml-auto h-6 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        </div>

        {/* Subject tag */}
        <div className="h-7 w-44 bg-slate-100 dark:bg-slate-800/60 rounded-md" />

        {/* Title */}
        <div className="space-y-2.5">
          <div className="h-6 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-6 w-3/5 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="h-3.5 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="h-3.5 w-4/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
        </div>

        {/* File preview area */}
        <div className="h-48 w-full bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800" />

        {/* Actions row */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="h-8 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
          <div className="h-9 w-32 bg-blue-100 dark:bg-blue-950/40 rounded-lg" />
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
