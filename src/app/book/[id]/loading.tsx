export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl animate-pulse">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        {/* Cover skeleton */}
        <div className="w-full md:w-1/3 space-y-4">
          <div className="aspect-[2/3] bg-coffee-100 dark:bg-slate-800 rounded-2xl" />
          <div className="h-12 bg-coffee-100 dark:bg-slate-800 rounded-xl" />
        </div>
        {/* Details skeleton */}
        <div className="flex-1 space-y-6">
          <div className="h-4 w-16 bg-coffee-100 dark:bg-slate-800 rounded ml-auto" />
          <div className="h-10 w-4/5 bg-coffee-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-5 w-40 bg-coffee-50 dark:bg-slate-700 rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 bg-coffee-50 dark:bg-slate-700 rounded w-full" />
            <div className="h-3 bg-coffee-50 dark:bg-slate-700 rounded w-5/6" />
            <div className="h-3 bg-coffee-50 dark:bg-slate-700 rounded w-4/6" />
          </div>
          <div className="space-y-3 pt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-coffee-100 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
