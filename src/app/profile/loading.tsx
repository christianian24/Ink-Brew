export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl animate-pulse space-y-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-coffee-100 dark:border-slate-800 flex gap-6 items-center">
        <div className="w-24 h-24 rounded-full bg-coffee-100 dark:bg-slate-800" />
        <div className="space-y-3 flex-1">
          <div className="h-6 w-40 bg-coffee-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-56 bg-coffee-50 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-coffee-100 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
