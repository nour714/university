'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter, RotateCcw, ArrowUpDown, Check, X } from 'lucide-react';

interface CourseFiltersProps {
  departments: string[];
  levels: number[];
  semesters: string[];
  totalResults: number;
}

export function CourseFilters({
  departments,
  levels,
  semesters,
  totalResults,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('q') || '';
  const currentDept = searchParams.get('dept') || '';
  const currentLevel = searchParams.get('level') || '';
  const currentSemester = searchParams.get('semester') || '';
  const currentSort = searchParams.get('sort') || 'default';

  // Helper to update URL query params smoothly
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all' || value === 'default') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters = Boolean(
    currentSearch || currentDept || currentLevel || currentSemester || (currentSort && currentSort !== 'default')
  );

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-8 transition-all">
      {/* Top Bar: Search Input & Sort Selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pb-4 border-b border-slate-100">
        {/* Search Field */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={(e) => updateParams({ q: e.target.value })}
            placeholder="ابحث باسم المادة (مثال: تعلم الآلة) أو كود المادة (مثل AI301)..."
            className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-hidden"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={() => updateParams({ q: null })}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={currentSort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="default">الترتيب: الافتراضي</option>
              <option value="alpha">الترتيب: أبجدياً (أ - ي)</option>
              <option value="latest">الترتيب: الأكثر محتوى</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
              title="إعادة تعيين الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Level, Department, Semester */}
      <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Department Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            القسم العلمي
          </label>
          <select
            value={currentDept}
            onChange={(e) => updateParams({ dept: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:border-blue-600 text-xs text-slate-700 font-medium outline-hidden cursor-pointer"
          >
            <option value="">جميع الأقسام العلمية</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            المستوى الدراسي
          </label>
          <select
            value={currentLevel}
            onChange={(e) => updateParams({ level: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:border-blue-600 text-xs text-slate-700 font-medium outline-hidden cursor-pointer"
          >
            <option value="">جميع المستويات الدراسية</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl.toString()}>
                المستوى {lvl === 1 ? 'الأول' : lvl === 2 ? 'الثاني' : lvl === 3 ? 'الثالث' : 'الرابع'}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            الفصل الدراسي
          </label>
          <select
            value={currentSemester}
            onChange={(e) => updateParams({ semester: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:border-blue-600 text-xs text-slate-700 font-medium outline-hidden cursor-pointer"
          >
            <option value="">جميع الفصول الدراسية</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count & Loading State */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>يتم عرض:</span>
          <span className="font-bold text-[#172554] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
            {totalResults} مقرّر دراسي
          </span>
          {isPending && (
            <span className="text-blue-600 font-medium animate-pulse text-[11px]">
              جاري التحديث...
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <span className="text-[11px] text-slate-400">
            تم تطبيق فلاتر تصفية
          </span>
        )}
      </div>
    </div>
  );
}

