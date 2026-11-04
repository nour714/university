'use client';

import { useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface CourseFiltersProps {
  value?: string;
  onChange?: (query: string) => void;
}

export function CourseFilters({ value, onChange }: CourseFiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams?.get('q') || '';
  const [internalQuery, setInternalQuery] = useState(value !== undefined ? value : urlSearch);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== undefined && value !== prevValue) {
    setPrevValue(value);
    setInternalQuery(value);
  }

  const handleChange = (newVal: string) => {
    setInternalQuery(newVal);
    if (onChange) {
      onChange(newVal);
    } else {
      const params = new URLSearchParams(searchParams?.toString() || '');
      if (!newVal.trim()) {
        params.delete('q');
      } else {
        params.set('q', newVal);
      }
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handleClear = () => {
    handleChange('');
  };

  return (
    <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-xs mb-3 transition-all">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={internalQuery}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="ابحث باسم المادة (مثال: تعلم الآلة) أو كود المادة (مثل AI301)..."
          className="w-full pr-10 pl-10 py-2 sm:py-2.5 rounded-lg border border-slate-200/90 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-hidden"
        />
        {internalQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all active:scale-95"
            title="مسح البحث"
            aria-label="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
