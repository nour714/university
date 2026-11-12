'use client';

import { useState, useMemo } from 'react';
import { ListExam, ExamStatus } from '@/types/exam';
import { getExamStatus } from '@/lib/exams/status';
import { ExamCard } from '@/components/exams/ExamCard';
import { matchesSearch } from '@/lib/normalizeArabic';
import { 
  ClipboardCheck, 
  Search, 
  Clock, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface ExamsDashboardProps {
  initialExams: ListExam[];
}

type TabFilter = 'all' | ExamStatus;

export function ExamsDashboard({ initialExams }: ExamsDashboardProps) {
  const exams = initialExams;
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts per status computed dynamically
  const counts = useMemo(() => {
    return {
      all: exams.length,
      live: exams.filter((e) => getExamStatus(e) === 'live').length,
      upcoming: exams.filter((e) => getExamStatus(e) === 'upcoming').length,
      completed: exams.filter((e) => getExamStatus(e) === 'completed').length,
    };
  }, [exams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const status = getExamStatus(exam);

      // Tab filter
      if (activeTab !== 'all' && status !== activeTab) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const matchTitle = matchesSearch(exam.title, searchQuery);
        const matchCourse = matchesSearch(exam.courseTitle, searchQuery);
        const matchCode = matchesSearch(exam.courseCode, searchQuery);
        const matchDoctor = matchesSearch(exam.doctorName, searchQuery);
        if (!matchTitle && !matchCourse && !matchCode && !matchDoctor) {
          return false;
        }
      }

      return true;
    });
  }, [exams, activeTab, searchQuery]);

  return (
    <div className="space-y-3.5 sm:space-y-6">
      {/* 1. Academic Header Banner */}
      <div className="bg-gradient-to-l from-[#172554] via-blue-900 to-indigo-950 rounded-2xl p-4 sm:py-5 sm:px-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] sm:text-xs font-semibold mb-1.5 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>منصة الاختبارات والتقييمات الإلكترونية</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight mb-1">
            الاختبارات الأكاديمية
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            متابعة مواعيد الامتحانات الدورية، الدخول للاختبارات النشطة، والاطلاع على النتائج الأكاديمية الفورية.
          </p>
        </div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* 2. Search & Tab Filter Controller */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المادة، كود المقرر، عنوان الاختبار، أو اسم الدكتور..."
            className="w-full pr-10 pl-12 py-2.5 min-h-[42px] rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1.5 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
            >
              مسح
            </button>
          )}
        </div>

        {/* Tab Filters - Optimized with smooth horizontal touch scroll for mobile */}
        <div className="pt-2 border-t border-slate-100 -mx-1 px-1">
          <div role="tablist" aria-label="حالة الاختبارات الأكاديمية" className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x pb-1">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 sm:px-3.5 sm:py-2 min-h-[38px] rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <span>جميع الاختبارات</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'live'}
              onClick={() => setActiveTab('live')}
              className={`px-3 py-2 sm:px-3.5 sm:py-2 min-h-[38px] rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>جارية ومتاحة الآن</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'live' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts.live}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'upcoming'}
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-2 sm:px-3.5 sm:py-2 min-h-[38px] rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>قادمة قريباً</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'upcoming' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts.upcoming}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-2 sm:px-3.5 sm:py-2 min-h-[38px] rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>مكتملة ومصححة</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'completed' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {counts.completed}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Cards Grid List */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-6 sm:p-12 text-center border border-slate-200/90 shadow-xs max-w-md mx-auto">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100">
            <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">لا توجد اختبارات مطابقة</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            لم نتمكن من العثور على أي اختبارات تطابق الفلتر أو كلمة البحث المحددة.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className="px-4 py-2.5 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            عرض كافة الاختبارات
          </button>
        </div>
      )}

    </div>
  );
}

