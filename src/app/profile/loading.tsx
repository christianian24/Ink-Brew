import DelayedRender from "@/components/delayed-render";

export default function ProfileLoading() {
  return (
    <DelayedRender>
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl space-y-16 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-coffee-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-coffee-200 rounded-full flex-shrink-0"></div>
          <div className="space-y-3 w-48 text-center md:text-left">
            <div className="h-8 bg-coffee-200 rounded-md w-full"></div>
            <div className="h-4 bg-coffee-200 rounded-md w-5/6 mx-auto md:mx-0"></div>
          </div>
        </div>
        <div className="h-10 w-28 bg-coffee-200 rounded-md"></div>
      </div>

      {/* Authored Books Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-coffee-200 pb-4">
          <div className="w-6 h-6 bg-coffee-200 rounded-full"></div>
          <div className="h-8 w-40 bg-coffee-200 rounded-md"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-coffee-100 flex flex-col h-full">
              <div className="aspect-[2/3] w-full bg-coffee-200"></div>
              <div className="p-4 md:p-5 flex-col flex-1 flex space-y-3">
                <div className="h-4 bg-coffee-200 rounded w-3/4"></div>
                <div className="h-3 bg-coffee-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bookmarks Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-coffee-200 pb-4">
          <div className="w-6 h-6 bg-coffee-200 rounded-full"></div>
          <div className="h-8 w-48 bg-coffee-200 rounded-md"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="group relative rounded-2xl overflow-hidden bg-white shadow-sm border border-coffee-100 flex flex-col h-full">
              <div className="aspect-[2/3] w-full bg-coffee-200"></div>
              <div className="p-4 md:p-5 flex-col flex-1 flex space-y-3">
                <div className="h-4 bg-coffee-200 rounded w-3/4"></div>
                <div className="h-3 bg-coffee-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </DelayedRender>
  );
}
