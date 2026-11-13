'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { Course } from '@/types/course';
import { CourseCard } from './CourseCard';
import { Search, X, FolderSearch, KeyRound, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { matchesSearch } from '@/lib/normalizeArabic';
import { KeyActivationModal } from '@/components/codes/KeyActivationModal';

interface CoursesCatalogProps {
  courses: Course[];
  studentLevel?: number;
  studentLevelName?: string;
}

type CatalogTab = 'enrolled' | 'all';

function CoursesCatalogInner({ courses, studentLevel, studentLevelName }: CoursesCatalogProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Controlled tab state initialized from URL or default to 'enrolled'
  const [activeTab, setActiveTab] = useState<CatalogTab>(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'all' || tabParam === 'enrolled') {
      return tabParam;
    }
    return 'enrolled';
  });

  // Controlled search state initialized from URL query if present
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams?.get('q') || '';
  });

  // Key activation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  // Sync searchQuery and activeTab to browser URL without re-rendering server components
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUrlQuery = searchParams?.get('q') || '';
      const currentUrlTab = searchParams?.get('tab') || 'enrolled';
      const trimmed = searchQuery.trim();

      if (trimmed === currentUrlQuery && activeTab === currentUrlTab) return;

      const params = new URLSearchParams(searchParams?.toString() || '');
      if (trimmed) {
        params.set('q', trimmed);
      } else {
        params.delete('q');
      }

      if (activeTab === 'all') {
        params.set('tab', 'all');
      } else {
        params.delete('tab');
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, '', newUrl);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, pathname, searchParams]);

  // Separate enrolled and locked courses
  const enrolledCourses = useMemo(() => {
    return courses.filter((c) => c.enrolled === true || c.locked === false);
  }, [courses]);

  // Filter courses based on active tab and search query with Arabic normalization
  const displayedCourses = useMemo(() => {
    const baseList = activeTab === 'enrolled' ? enrolledCourses : courses;

    if (!searchQuery.trim()) return baseList;

    return baseList.filter((course) => {
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
  }, [courses, enrolledCourses, activeTab, searchQuery]);

  const handleOpenActivationModal = (course?: Course) => {
    setSelectedCourseForModal(course || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* 1. Controller Bar: Tabs, Quick Activation CTA & Search */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs space-y-3">
        {/* Top Row: Tabs and Key Activation Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="تبويبات المقررات الدراسية"
            className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'enrolled'}
              onClick={() => setActiveTab('enrolled')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
                activeTab === 'enrolled'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>مقرراتي المفعلة</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === 'enrolled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {enrolledCourses.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all min-h-[38px] cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>{studentLevelName ? `مقررات ${studentLevelName}` : 'دليل المقررات الأكاديمية'}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {courses.length}
              </span>
            </button>
          </div>

          {/* Direct Key Activation CTA */}
          <button
            type="button"
            onClick={() => handleOpenActivationModal()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all min-h-[40px] cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>تفعيل كود مقرر جديد</span>
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
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
            placeholder={
              activeTab === 'enrolled'
                ? 'ابحث في مقرراتك المفعلة باسم المادة أو كود المقرر...'
                : studentLevelName
                ? `ابحث في مقررات ${studentLevelName} (مثال: تعلم الآلة، AI301، اسم الدكتور)...`
                : 'ابحث في دليل المقررات (مثال: تعلم الآلة، AI301، اسم الدكتور)...'
            }
            className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-hidden font-medium min-h-[42px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
              title="مسح البحث"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Content Display */}
      {displayedCourses.length > 0 ? (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          {displayedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onOpenActivationModal={handleOpenActivationModal}
            />
          ))}
        </div>
      ) : activeTab === 'enrolled' && enrolledCourses.length === 0 ? (
        /* Empty State for Enrolled Tab when no courses have been activated yet */
        <div className="bg-white rounded-3xl p-6 sm:p-10 text-center border border-slate-200/90 shadow-sm max-w-lg mx-auto my-6 animate-fadeIn" dir="rtl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/90 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <KeyRound className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2">
            لا توجد مقررات مفعلة في حسابك حالياً
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 max-w-sm mx-auto">
            المقررات الدراسية والمحاضرات والاختبارات تتطلب إدخال مفتاح المادة الخاص بإيصال الاشتراك. أدخل الكود الآن لفتح كامل الصلاحيات فوراً.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenActivationModal()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all min-h-[44px] active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>تفعيل مفتاح مقرر الآن</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all min-h-[44px] cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>استعراض دليل المقررات المتاحة</span>
            </button>
          </div>
        </div>
      ) : (
        /* Search Empty State */
        <div className="bg-white rounded-3xl p-6 sm:p-10 text-center border border-slate-200/90 shadow-xs max-w-md mx-auto my-6 animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100">
            <FolderSearch className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            لم يتم العثور على مقررات مطابقة
          </h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            لم نجد نتائج لكلمة &quot;{searchQuery}&quot;. يمكنك المحاولة بكود المادة أو اسم دكتور المقرر.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all min-h-[42px] active:scale-95 cursor-pointer"
          >
            عرض كافة المقررات
          </button>
        </div>
      )}

      {/* 3. Key Activation Dialog */}
      <KeyActivationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourseForModal(null);
        }}
        targetCourse={selectedCourseForModal}
      />
    </div>
  );
}

export function CoursesCatalog(props: CoursesCatalogProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 sm:space-y-4">
          <div className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <CoursesCatalogInner {...props} />
    </Suspense>
  );
}
