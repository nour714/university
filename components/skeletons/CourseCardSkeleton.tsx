import { Skeleton } from '@/components/ui/Skeleton';

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 flex flex-col justify-between overflow-hidden shadow-2xs">
      <div>
        {/* Card Header */}
        <div className="p-3 sm:p-4 pb-2.5 sm:pb-3 border-b border-slate-100 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-14 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 space-y-2.5">
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3 sm:p-4 pt-2.5 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full rounded-lg sm:rounded-xl" />
      </div>
    </div>
  );
}
