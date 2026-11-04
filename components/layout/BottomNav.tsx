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
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all w-full ${
              isCoursesActive
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border border-blue-400/50'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-0.5">المقررات</span>
          </Link>
        </div>

        {/* 2. Exams / Tests Icon (الاختبارات) */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center py-1.5 px-2 text-slate-400 hover:text-white transition-colors cursor-pointer group w-full"
            title="الاختبارات (قريباً)"
          >
            <ClipboardCheck className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-medium mt-0.5 text-slate-300">الاختبارات</span>
          </button>
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
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all w-full ${
              isCodesActive
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border border-blue-400/50'
                : 'text-slate-300 hover:text-white'
            }`}
            title="أكوادي الأكاديمية"
          >
            <KeyRound className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-0.5">أكوادي</span>
          </Link>
        </div>

        {/* 5. More Button (المزيد) */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 transition-colors cursor-pointer group w-full ${
              isMoreOpen ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="المزيد من الخيارات"
            aria-expanded={isMoreOpen}
          >
            <MoreHorizontal className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-medium mt-0.5 text-slate-300">المزيد</span>
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
