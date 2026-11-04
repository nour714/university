import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-4">
      {/* 1. Student Hero Profile Banner Skeleton */}
      <section 
        className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#0b1329] via-[#172554] to-[#1e1b4b] p-6 sm:p-8 lg:p-10 text-white shadow-2xl border border-blue-800/40"
      >
        <div className="relative z-10 space-y-4">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Skeleton variant="dark" className="h-6 w-36 sm:w-44 rounded-full" />
            <Skeleton variant="dark" className="h-6 w-24 rounded-full" />
          </div>

          {/* Student Welcome & Full Name */}
          <div className="space-y-2">
            <Skeleton variant="dark" className="h-4 w-48 rounded-md" />
            <Skeleton variant="dark" className="h-8 sm:h-10 w-64 sm:w-80 rounded-xl" />
          </div>

          {/* Department & Date Info */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Skeleton variant="dark" className="h-4 w-36 rounded-md" />
            <Skeleton variant="dark" className="h-4 w-48 rounded-md" />
          </div>
        </div>
      </section>

      {/* 2. Four Bento KPI Stat Cards Skeleton */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded-md" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-8 w-20 rounded-lg" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </div>
        ))}
      </section>

      {/* 3. Quick Action Access Card Skeleton */}
      <section className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-full sm:w-36 rounded-xl shrink-0" />
      </section>
    </div>
  );
}
