import { Skeleton } from '@/components/ui/Skeleton';
import { CourseCardSkeleton } from '@/components/skeletons/CourseCardSkeleton';

export default function CoursesLoading() {
  return (
    <div className="space-y-3 sm:space-y-4 animate-fadeIn">
      {/* Hero Header Skeleton */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg space-y-2.5">
        <Skeleton variant="dark" className="h-5 w-48 rounded-full" />
        <Skeleton variant="dark" className="h-7 sm:h-8 w-64 rounded-xl" />
        <Skeleton variant="dark" className="h-4 w-4/5 rounded-md" />
      </div>

      {/* Search and Filters Bar Skeleton */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs space-y-2.5">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg shrink-0" />
          ))}
        </div>
      </div>

      {/* Courses Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
