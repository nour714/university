'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function CourseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('q') || '';

  const updateSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!query.trim()) {
      params.delete('q');
    } else {
      params.set('q', query);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-xs mb-3 transition-all">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          defaultValue={currentSearch}
          onChange={(e) => updateSearch(e.target.value)}
          placeholder="ابحث باسم المادة (مثال: تعلم الآلة) أو كود المادة (مثل AI301)..."
          className="w-full pr-10 pl-9 py-2 sm:py-2.5 rounded-lg border border-slate-200/90 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-hidden"
        />
        {currentSearch && (
          <button
            type="button"
            onClick={() => updateSearch('')}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
            title="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isPending && (
          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[11px] text-blue-600 font-medium animate-pulse">
            جاري البحث...
          </span>
        )}
      </div>
    </div>
  );
}
