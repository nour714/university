import { Skeleton } from '@/components/ui/Skeleton';

export function CodesSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-6">
      {/* 1. Header Banner Skeleton */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg space-y-2.5">
        <Skeleton variant="dark" className="h-5 w-40 rounded-full" />
        <Skeleton variant="dark" className="h-7 sm:h-8 w-60 rounded-xl" />
        <Skeleton variant="dark" className="h-4 w-4/5 rounded-md" />
      </div>

      {/* 2. Three Metric Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Activation Form Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <Skeleton className="h-4 w-40 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-11 flex-1 rounded-xl" />
            <Skeleton className="h-11 w-24 rounded-xl shrink-0" />
          </div>
          <Skeleton className="h-3 w-64 rounded-md" />
        </div>
      </div>

      {/* 4. Activated Codes Grid Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
