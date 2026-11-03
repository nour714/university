'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Course } from '@/types/course';
import { CourseCard } from './CourseCard';
import { Search, X, FolderSearch } from 'lucide-react';
import { matchesSearch } from '@/lib/normalizeArabic';

interface CoursesCatalogProps {
  courses: Course[];
}

function CoursesCatalogInner({ courses }: CoursesCatalogProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Controlled search state initialized from URL query if present
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams?.get('q') || '';
  });

  // Sync searchQuery to browser URL without triggering Next.js server navigation or unmounting
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUrlQuery = searchParams?.get('q') || '';
      const trimmed = searchQuery.trim();
      if (trimmed === currentUrlQuery) return;

      const params = new URLSearchParams(searchParams?.toString() || '');
      if (trimmed) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, '', newUrl);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, searchParams]);

  // Filter courses with Arabic normalization and error tolerance
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    return courses.filter((course) => {
      return (
        matchesSearch(course.title, searchQuery) ||
        matchesSearch(course.code, searchQuery) ||
        matchesSearch(course.englishTitle, searchQuery) ||
        matchesSearch(course.doctorName, searchQuery) ||
        matchesSearch(course.department, searchQuery) ||
        matchesSearch(`المستوى ${course.level}`, searchQuery) ||
        matchesSearch(course.semester, searchQuery) ||
        matchesSearch(course.description, searchQuery)
      );
    });
  }, [courses, searchQuery]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Input Bar - Completely stable and optimized for mobile touch */}
      <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200/90 shadow-xs transition-all">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المادة (مثال: تعلم الآلة) أو كود المادة (مثل AI301)..."
            className="w-full pr-10 pl-10 py-2 sm:py-2.5 rounded-lg border border-slate-200/90 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all active:scale-95"
              title="مسح البحث"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto my-6 sm:my-8 animate-fadeIn">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <FolderSearch className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
            لم يتم العثور على مقررات مطابقة
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            لم نجد نتائج لكلمة &quot;{searchQuery}&quot;. يمكنك المحاولة بكود المادة أو اسم دكتور المقرر.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all min-h-[44px] active:scale-95 cursor-pointer"
          >
            عرض كافة المقررات
          </button>
        </div>
      )}
    </div>
  );
}

export function CoursesCatalog(props: CoursesCatalogProps) {
  return (
    <Suspense fallback={
      <div className="space-y-3 sm:space-y-4">
        <div className="h-12 bg-white rounded-xl border border-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <CoursesCatalogInner {...props} />
    </Suspense>
  );
}
