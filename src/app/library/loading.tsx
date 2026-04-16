import DelayedRender from "@/components/delayed-render";

export default function LibraryLoading() {
  return (
    <DelayedRender>
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl font-serif font-bold text-coffee-950">Library</h1>
        <p className="text-coffee-600 max-w-2xl">
          Browse through our collection of published stories. Grab a coffee and find your next favorite book.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-coffee-100 flex flex-col h-full animate-pulse">
            <div className="aspect-[2/3] w-full bg-coffee-200"></div>
            <div className="p-4 md:p-5 flex-col flex-1 flex justify-between space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-coffee-200 rounded w-3/4"></div>
                <div className="h-3 bg-coffee-200 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-coffee-200 rounded-full"></div>
                <div className="h-6 w-16 bg-coffee-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </DelayedRender>
  );
}
