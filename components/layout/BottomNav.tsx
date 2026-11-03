'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, GraduationCap } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const isCoursesActive = pathname.startsWith('/courses');

  return (
    <nav 
      aria-label="شريط التنقل السفلي للموبايل"
      className="fixed bottom-3.5 inset-x-4 max-w-[280px] mx-auto z-40 lg:hidden"
    >
      {/* Floating Pill with Curved Sides */}
      <div className="bg-[#172554]/95 backdrop-blur-xl border border-blue-900/80 rounded-full p-2 px-3.5 shadow-2xl shadow-blue-950/70 flex items-center justify-between gap-3">
        {/* 1. Distinctive University Crest Emblem */}
        <Link
          href="/courses"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border border-amber-200 text-[#172554] flex items-center justify-center shadow-md shadow-amber-500/35 shrink-0 active:scale-95 transition-transform"
          title="كلية الذكاء الاصطناعي"
        >
          <GraduationCap className="w-5 h-5 stroke-[2.4]" />
        </Link>

        {/* Subtle Divider */}
        <div className="h-5 w-px bg-blue-800/60 shrink-0" />

        {/* 2. Courses Library Button (Active Blue Pill) */}
        <Link
          href="/courses"
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full font-bold text-xs transition-all flex-1 active:scale-95 ${
            isCoursesActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400/50'
              : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.2]" />
          <span>مكتبة المقررات</span>
        </Link>
      </div>
    </nav>
  );
}
