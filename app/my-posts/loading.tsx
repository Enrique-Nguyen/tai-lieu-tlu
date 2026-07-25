export default function MyPostsLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/60 rounded" />
        </div>
        <div className="h-10 w-36 bg-blue-100 dark:bg-blue-950/40 rounded-lg" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-5 w-8 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />

      {/* Post rows */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-6 w-28 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            <div className="ml-auto h-4 w-20 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
            <div className="flex gap-2">
              <div className="h-7 w-14 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
              <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
