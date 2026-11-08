import { Skeleton } from '@/components/ui/Skeleton';

export default function ExamsLoading() {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Hero Header Skeleton */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg space-y-2.5">
        <Skeleton variant="dark" className="h-5 w-44 rounded-full" />
        <Skeleton variant="dark" className="h-7 sm:h-8 w-60 rounded-xl" />
        <Skeleton variant="dark" className="h-4 w-3/4 rounded-md" />
      </div>

      {/* Search and Filters Bar Skeleton */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg shrink-0" />
          ))}
        </div>
      </div>

      {/* Exams Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-md" />
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
