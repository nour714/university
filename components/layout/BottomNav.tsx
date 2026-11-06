'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Home, 
  ClipboardCheck, 
  KeyRound, 
  MoreHorizontal 
} from 'lucide-react';
import { MoreMenuSheet } from '@/components/layout/MoreMenuSheet';

export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isCoursesActive = pathname.startsWith('/courses');
  const isCodesActive = pathname.startsWith('/codes');
  const isExamsActive = pathname.startsWith('/exams');
  const isHomeActive = pathname === '/';

  return (
    <nav 
      aria-label="شريط التنقل السفلي للموبايل"
      className="fixed bottom-3.5 inset-x-3 max-w-md mx-auto z-40 lg:hidden"
    >
      {/* Floating Pill with Curved Sides - 5 Equal Grid Columns for Absolute Dead Center */}
      <div className="bg-[#172554]/95 backdrop-blur-xl border border-blue-900/80 rounded-full px-2 py-1.5 shadow-2xl shadow-blue-950/70 grid grid-cols-5 items-center">
        
        {/* 1. Courses Library Button */}
        <div className="flex items-center justify-center">
          <Link
            href="/courses"
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all shrink-0 ${
              isCoursesActive
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border border-blue-400/50'
                : 'text-slate-300 hover:text-white active:scale-95'
            }`}
            title="مكتبة المقررات"
          >
            <BookOpen className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-0.5 leading-none">المقررات</span>
          </Link>
        </div>

        {/* 2. Exams / Tests Icon (الاختبارات) */}
        <div className="flex items-center justify-center">
          <Link
            href="/exams"
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all shrink-0 ${
              isExamsActive
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border border-blue-400/50'
                : 'text-slate-300 hover:text-white active:scale-95'
            }`}
            title="الاختبارات"
          >
            <ClipboardCheck className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-0.5 leading-none">الاختبارات</span>
          </Link>
        </div>

        {/* 3. Center Navigation Button - Home (الرئيسية) Dead Center */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="relative -mt-3.5 shrink-0 flex items-center justify-center group"
            title="الرئيسية (لوحة التحكم)"
          >
            {/* Ambient Pulsing Radar Halo */}
            <span
              className="absolute inset-0 rounded-full bg-amber-400/40 animate-gold-wave pointer-events-none"
              aria-hidden="true"
            />

            {/* Golden Button with Rhythmic Pulse and Home Icon */}
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-200 text-[#172554] flex items-center justify-center shadow-lg transition-all shrink-0 cursor-pointer animate-gold-pulse ${
                isHomeActive
                  ? 'ring-4 ring-amber-300 shadow-amber-400/70 scale-105'
                  : 'ring-4 ring-[#172554] shadow-amber-500/35 active:scale-95'
              }`}
            >
              <Home className="w-6 h-6 stroke-[2.3] drop-shadow-2xs" />
            </div>
          </Link>
        </div>

        {/* 4. Key Icon (أكوادي) */}
        <div className="flex items-center justify-center">
          <Link
            href="/codes"
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all shrink-0 ${
              isCodesActive
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border border-blue-400/50'
                : 'text-slate-300 hover:text-white active:scale-95'
            }`}
            title="أكوادي الأكاديمية"
          >
            <KeyRound className="w-4.5 h-4.5 stroke-[2.2]" />
            <span className="text-[9px] font-bold mt-0.5 leading-none">أكوادي</span>
          </Link>
        </div>

        {/* 5. More Button (المزيد) */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-colors cursor-pointer group shrink-0 active:scale-95 ${
              isMoreOpen ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white'
            }`}
            title="المزيد من الخيارات"
            aria-expanded={isMoreOpen}
          >
            <MoreHorizontal className="w-4.5 h-4.5 group-hover:scale-105 transition-transform" />
            <span className="text-[9px] font-medium mt-0.5 leading-none text-slate-300">المزيد</span>
          </button>
        </div>

      </div>

      {/* Mobile More Options Sheet (Login & Change Password) */}
      <MoreMenuSheet 
        isOpen={isMoreOpen} 
        onClose={() => setIsMoreOpen(false)} 
      />
    </nav>
  );
}
