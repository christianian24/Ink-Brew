import DelayedRender from "@/components/delayed-render";

export default function WriteLoading() {
  return (
    <DelayedRender>
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl animate-pulse">
      <div className="space-y-4 mb-12 animate-pulse">
        <div className="h-10 w-64 bg-coffee-200 dark:bg-slate-800 rounded-md"></div>
        <div className="h-5 w-96 bg-coffee-200 dark:bg-slate-800 rounded-md max-w-full"></div>
      </div>

      <div className="space-y-8 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-2xl border border-coffee-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="h-5 w-24 bg-coffee-200 dark:bg-slate-800 rounded"></div>
            <div className="aspect-[2/3] w-full bg-coffee-200 dark:bg-slate-800 rounded-xl border-2 border-dashed border-coffee-300 dark:border-slate-700"></div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="h-5 w-24 bg-coffee-200 dark:bg-slate-800 rounded"></div>
              <div className="h-12 w-full bg-coffee-200 dark:bg-slate-800 rounded-md"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-48 bg-coffee-200 dark:bg-slate-800 rounded"></div>
              <div className="h-24 w-full bg-coffee-200 dark:bg-slate-800 rounded-md"></div>
            </div>

            <div className="space-y-2">
              <div className="h-5 w-64 bg-coffee-200 dark:bg-slate-800 rounded"></div>
              <div className="h-12 w-full bg-coffee-200 dark:bg-slate-800 rounded-md"></div>
            </div>
          </div>
        </div>

        <div className="border-t border-coffee-200 dark:border-slate-800 pt-8 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-coffee-200 dark:bg-slate-800 rounded"></div>
            <div className="h-12 w-full bg-coffee-200 dark:bg-slate-800 rounded-md"></div>
          </div>

          <div className="space-y-2">
            <div className="h-5 w-36 bg-coffee-200 dark:bg-slate-800 rounded"></div>
            <div className="h-[400px] w-full bg-coffee-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <div className="h-12 w-48 bg-coffee-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    </div>
    </DelayedRender>
  );
}
