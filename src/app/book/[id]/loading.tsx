import DelayedRender from "@/components/delayed-render";

export default function BookDetailsLoading() {
  return (
    <DelayedRender>
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl animate-pulse">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        
        {/* Left Column: Cover & Actions */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="aspect-[2/3] bg-coffee-200 rounded-2xl shadow-md w-full"></div>
          <div className="space-y-3">
            <div className="h-12 w-full bg-coffee-200 rounded-md"></div>
            <div className="flex gap-3">
              <div className="h-10 flex-1 bg-coffee-200 rounded-md"></div>
              <div className="h-10 flex-1 bg-coffee-200 rounded-md"></div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Chapters */}
        <div className="flex-1 space-y-8 mt-4 md:mt-0">
          <div className="space-y-4">
            <div className="h-14 w-3/4 bg-coffee-200 rounded-lg"></div>
            <div className="h-6 w-1/4 bg-coffee-200 rounded"></div>

            <div className="flex items-center gap-4 text-sm border-y border-coffee-200 py-4 mt-6">
              <div className="h-4 w-20 bg-coffee-200 rounded"></div>
              <div className="h-4 w-24 bg-coffee-200 rounded"></div>
              <div className="h-4 w-16 bg-coffee-200 rounded"></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-full bg-coffee-200 rounded"></div>
            <div className="h-4 w-full bg-coffee-200 rounded"></div>
            <div className="h-4 w-5/6 bg-coffee-200 rounded"></div>
            <div className="h-4 w-4/6 bg-coffee-200 rounded"></div>
          </div>

          <div className="pt-8 border-t border-coffee-200 space-y-6 flex flex-col gap-3">
            <div className="h-8 w-48 bg-coffee-200 rounded-lg mb-2"></div>
            
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-coffee-200 rounded-xl border border-coffee-100"></div>
            ))}
          </div>
        </div>

      </div>
    </div>
    </DelayedRender>
  );
}
