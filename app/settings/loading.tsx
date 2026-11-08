import { Skeleton } from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Settings Header Banner Skeleton */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:p-6 text-white shadow-lg space-y-2.5">
        <Skeleton variant="dark" className="h-5 w-40 rounded-full" />
        <Skeleton variant="dark" className="h-7 sm:h-8 w-56 rounded-xl" />
        <Skeleton variant="dark" className="h-4 w-2/3 rounded-md" />
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>

      {/* Form Content Skeleton */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <div className="space-y-3 pt-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="pt-3">
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
