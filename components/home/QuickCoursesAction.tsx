import Link from 'next/link';
import { BookOpen, ArrowLeft, Sparkles, FileText, Video, ExternalLink } from 'lucide-react';

interface QuickCoursesActionProps {
  coursesCount: number;
}

export function QuickCoursesAction({ coursesCount }: QuickCoursesActionProps) {
  return (
    <section 
      aria-label="الانتقال إلى مكتبة المقررات"
      className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-gradient-to-br from-white via-blue-50/40 to-slate-50 p-6 sm:p-8 border border-blue-200/80 shadow-lg shadow-blue-900/5 hover:shadow-xl transition-all"
    >
      {/* Decorative ambient elements */}
      <div 
        className="absolute -top-16 -right-16 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-16 -left-16 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Text info */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>بوابة المقررات والمحتوى الأكاديمي</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#172554] tracking-tight">
            استعرض مقرراتك ومحاضراتك التعليمية
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            تصفح المحتوى الكامل لجميع مقرراتك المسجلة ({coursesCount} مقررات)، وحمّل مذكرات الـ PDF، وشاهد تسجيلات الفيديو التعليمية مع إمكانية الوصول السريع لمصادر التعلم.
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-semibold shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              مذكرات وملخصات PDF
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-semibold shadow-2xs">
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              تسجيلات ومحاضرات مرئية
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-semibold shadow-2xs">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
              روابط ومراجع داعمة
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="shrink-0 flex items-center">
          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer border border-blue-400/30"
          >
            <BookOpen className="w-5 h-5 text-amber-300 group-hover:rotate-6 transition-transform" />
            <span>فتح مكتبة المقررات</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
