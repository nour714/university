'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  GraduationCap,
  LogOut,
  ChevronRight,
  Sparkles,
  HelpCircle,
  ClipboardCheck,
  KeyRound,
  MoreHorizontal
} from 'lucide-react';

export const NAVIGATION_LINKS = [
  { name: 'مكتبة المقررات', href: '/courses', icon: 'BookOpen', active: true },
];

export function Sidebar({ currentPath = '/courses' }: { currentPath?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCoursesActive = currentPath.startsWith('/courses');

  return (
    <aside className="hidden lg:flex flex-col items-start p-3.5 shrink-0 sticky top-0 h-screen select-none z-40">
      {/* Pill Capsule / Expandable Container */}
      <div 
        className={`h-full bg-[#172554] rounded-[38px] flex flex-col justify-between py-5 shadow-2xl border border-blue-900/60 relative overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64 px-5' : 'w-[76px] px-2 items-center'
        }`}
      >
        {/* Top Section: Distinctive University Emblem Logo */}
        <div className={`w-full shrink-0 pb-4 border-b border-blue-900/60 ${isExpanded ? '' : 'flex justify-center'}`}>
          <div className="flex items-center justify-between gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`group flex items-center gap-3.5 outline-hidden transition-all ${
                isExpanded ? 'w-full text-right' : 'justify-center mx-auto'
              }`}
              title={isExpanded ? 'طي القائمة الجانبية' : 'اضغط لفتح القائمة الجانبية'}
            >
              {/* Distinctive University Crest (Gold/Amber Emblem with Royal Navy Trim) */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-200 text-[#172554] flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/35 ring-2 ring-amber-400/40 ring-offset-2 ring-offset-[#172554] group-hover:scale-110 group-hover:shadow-amber-400/60 transition-all duration-300 cursor-pointer">
                <GraduationCap className="w-6 h-6 stroke-[2.4] drop-shadow-2xs" />
              </div>

              {/* Text shown ONLY when expanded */}
              {isExpanded && (
                <div className="min-w-0 flex-1 animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white tracking-tight truncate">
                      كلية الذكاء الاصطناعي
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-blue-200 truncate">المنصة الأكاديمية</p>
                </div>
              )}
            </button>

            {/* Collapse toggle button when expanded */}
            {isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
                title="طي القائمة"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Middle Section: Navigation Items */}
        <div className="flex-1 my-4 flex flex-col justify-start gap-2.5 w-full">
          {/* Header Title when expanded */}
          {isExpanded && (
            <p className="text-[10px] font-bold text-blue-300/80 uppercase px-2 mb-1 tracking-wider animate-fadeIn">
              القائمة الأكاديمية
            </p>
          )}

          {/* 1. مكتبة المقررات */}
          <div className="relative group w-full">
            <Link
              href="/courses"
              className={`flex items-center gap-3.5 rounded-2xl transition-all duration-200 ${
                isExpanded 
                  ? 'px-4 py-3 w-full' 
                  : 'w-12 h-12 justify-center mx-auto'
              } ${
                isCoursesActive
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/40 border border-blue-400/60'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
              }`}
              aria-label="مكتبة المقررات"
            >
              <BookOpen className="w-5 h-5 shrink-0 stroke-[2.2]" />

              {isExpanded && (
                <div className="flex-1 flex items-center justify-between animate-fadeIn">
                  <span className="text-sm font-bold">مكتبة المقررات</span>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </Link>

            {!isExpanded && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="bg-[#172554] text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                  مكتبة المقررات الأكاديمية
                </div>
              </div>
            )}
          </div>

          {/* 2. الاختبارات (Exams) */}
          <div className="relative group w-full">
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className={`flex items-center gap-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-blue-900/40 transition-all duration-200 cursor-pointer ${
                isExpanded 
                  ? 'px-4 py-2.5 w-full text-right' 
                  : 'w-12 h-12 justify-center mx-auto'
              }`}
              title="الاختبارات"
            >
              <ClipboardCheck className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {isExpanded && (
                <span className="text-sm font-medium animate-fadeIn">الاختبارات</span>
              )}
            </button>

            {!isExpanded && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="bg-[#172554] text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                  الاختبارات والتقييمات
                </div>
              </div>
            )}
          </div>

          {/* 3. المفتاح (Key) */}
          <div className="relative group w-full">
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className={`flex items-center gap-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-blue-900/40 transition-all duration-200 cursor-pointer ${
                isExpanded 
                  ? 'px-4 py-2.5 w-full text-right' 
                  : 'w-12 h-12 justify-center mx-auto'
              }`}
              title="المفتاح"
            >
              <KeyRound className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {isExpanded && (
                <span className="text-sm font-medium animate-fadeIn">المفتاح</span>
              )}
            </button>

            {!isExpanded && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="bg-[#172554] text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                  المفتاح والصلاحيات
                </div>
              </div>
            )}
          </div>

          {/* 4. المزيد (More) */}
          <div className="relative group w-full">
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className={`flex items-center gap-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-blue-900/40 transition-all duration-200 cursor-pointer ${
                isExpanded 
                  ? 'px-4 py-2.5 w-full text-right' 
                  : 'w-12 h-12 justify-center mx-auto'
              }`}
              title="المزيد"
            >
              <MoreHorizontal className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              {isExpanded && (
                <span className="text-sm font-medium animate-fadeIn">المزيد</span>
              )}
            </button>

            {!isExpanded && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="bg-[#172554] text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                  المزيد من الخيارات
                </div>
              </div>
            )}
          </div>

          {/* Academic Help Info Box when expanded */}
          {isExpanded && (
            <div className="mt-auto bg-blue-950/60 rounded-2xl p-3.5 border border-blue-800/40 animate-fadeIn">
              <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-white">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>الدعم الأكاديمي</span>
              </div>
              <p className="text-[11px] text-blue-200/80 leading-relaxed">
                تصفح المقررات وحمّل الملفات وسلايدات الشرح بسهولة.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Section: Logout / Student Status */}
        <div className={`w-full shrink-0 pt-3 border-t border-blue-900/60 flex items-center ${
          isExpanded ? 'justify-between px-1' : 'justify-center'
        }`}>
          {isExpanded ? (
            <div className="flex items-center justify-between w-full animate-fadeIn">
              <div className="text-right">
                <p className="text-xs font-bold text-white">عبد الرحمن خالد</p>
                <p className="text-[10px] text-blue-300">طالب • ذكاء اصطناعي</p>
              </div>

              <button
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4 -scale-x-100" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors group relative"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5 -scale-x-100" />
              <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
                <div className="bg-[#172554] text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-900 shadow-xl whitespace-nowrap">
                  تسجيل الخروج
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </aside>
  );
}
