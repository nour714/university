import { Skeleton } from '@/components/ui/Skeleton';

export function CourseDetailSkeleton() {
  return (
    <div className="space-y-3.5 sm:space-y-4 animate-fadeIn">
      {/* 1. Top Blue Header Banner Skeleton */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:p-6 shadow-lg border border-blue-900/60 space-y-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <Skeleton variant="dark" className="h-8 w-32 rounded-xl" />
          <Skeleton variant="dark" className="h-6 w-20 rounded-lg" />
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <Skeleton variant="dark" className="h-7 sm:h-9 w-2/3 rounded-xl" />
          <Skeleton variant="dark" className="h-4 w-4/5 rounded-md" />
        </div>

        {/* Doctor & Metadata row */}
        <div className="pt-2 border-t border-blue-800/40 flex flex-wrap items-center gap-3">
          <Skeleton variant="dark" className="h-5 w-40 rounded-lg" />
          <Skeleton variant="dark" className="h-5 w-28 rounded-lg" />
          <Skeleton variant="dark" className="h-5 w-24 rounded-lg" />
        </div>
      </div>

      {/* 2. Content Filter Tabs Skeleton */}
      <div className="bg-white rounded-xl p-2 border border-slate-200/90 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg shrink-0" />
        ))}
      </div>

      {/* 3. Content Items List Skeleton */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48 sm:w-64 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton className="h-8 w-20 sm:w-24 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg hidden sm:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

