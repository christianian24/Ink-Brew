export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl animate-pulse space-y-8">
      <div className="h-8 w-48 bg-coffee-100 dark:bg-slate-800 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[2/3] bg-coffee-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 bg-coffee-100 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-coffee-50 dark:bg-slate-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
