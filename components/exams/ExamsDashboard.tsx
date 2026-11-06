'use client';

import { useState, useMemo } from 'react';
import { Exam, ExamStatus } from '@/types/exam';
import { ExamCard } from '@/components/exams/ExamCard';
import { matchesSearch } from '@/lib/normalizeArabic';
import { 
  ClipboardCheck, 
  Search, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface ExamsDashboardProps {
  initialExams: Exam[];
}

type TabFilter = 'all' | ExamStatus;

export function ExamsDashboard({ initialExams }: ExamsDashboardProps) {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts per status
  const counts = useMemo(() => {
    return {
      all: exams.length,
      live: exams.filter((e) => e.status === 'live').length,
      upcoming: exams.filter((e) => e.status === 'upcoming').length,
      completed: exams.filter((e) => e.status === 'completed').length,
    };
  }, [exams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Tab filter
      if (activeTab !== 'all' && exam.status !== activeTab) {
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
    <div className="space-y-4 sm:space-y-6">
      
      {/* 1. Page Header & Key Academic Stats */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-blue-800/40">
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold mb-2">
              <ClipboardCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>منصة الامتحانات الإلكترونية المعتمدة</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mb-2">
              قسم الاختبارات والتقييمات الأكاديمية
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-xl leading-relaxed">
              تصفح الاختبارات المرفوعة من قِبل أعضاء هيئة التدريس، وتعرف على مواعيد البدء والانتهاء، وأدّ الاختبارات مباشرة في بيئة معزولة وآمنة.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[90px]">
              <p className="text-2xl font-black text-emerald-400">{counts.live}</p>
              <p className="text-[11px] font-semibold text-emerald-200 mt-0.5">جارية الآن</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[90px]">
              <p className="text-2xl font-black text-amber-300">{counts.upcoming}</p>
              <p className="text-[11px] font-semibold text-amber-200 mt-0.5">قادمة قريباً</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[90px]">
              <p className="text-2xl font-black text-blue-300">{counts.completed}</p>
              <p className="text-[11px] font-semibold text-blue-200 mt-0.5">مكتملة</p>
            </div>
          </div>
        </div>
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
            className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 text-xs sm:text-sm text-slate-900 transition-all outline-hidden font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <span>جميع الاختبارات</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>جارية ومتاحة الآن</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'live' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.live}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-amber-600 text-white shadow-xs shadow-amber-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>قادمة قريباً</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'upcoming' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مكتملة ومصححة</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${activeTab === 'completed' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.completed}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Cards Grid List */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-xs max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100">
            <ClipboardCheck className="w-7 h-7" />
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
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            عرض كافة الاختبارات
          </button>
        </div>
      )}

    </div>
  );
}
