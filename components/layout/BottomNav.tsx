'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  KeyRound, 
  MoreHorizontal 
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const isCoursesActive = pathname.startsWith('/courses');
  const isCodesActive = pathname.startsWith('/codes');
  const isHomeActive = pathname === '/';

  return (
    <nav 
      aria-label="شريط التنقل السفلي للموبايل"
      className="fixed bottom-3.5 inset-x-3 max-w-md mx-auto z-40 lg:hidden"
    >
      {/* Floating Pill with Curved Sides */}
      <div className="bg-[#172554]/95 backdrop-blur-xl border border-blue-900/80 rounded-full px-3 py-1.5 shadow-2xl shadow-blue-950/70 flex items-center justify-around gap-1">
        
        {/* 1. Courses Library Button */}
        <Link
          href="/courses"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            isCoursesActive
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border border-blue-400/50'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold mt-0.5">المقررات</span>
        </Link>

        {/* 2. Exams / Tests Icon (الاختبارات) */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center py-1.5 px-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          title="الاختبارات (قريباً)"
        >
          <ClipboardCheck className="w-5 h-5 group-hover:scale-105 transition-transform" />
          <span className="text-[10px] font-medium mt-0.5 text-slate-300">الاختبارات</span>
        </button>

        {/* 3. Center College Emblem Logo - Navigates to Home (الرئيسية) */}
        <Link
          href="/"
          className={`w-12 h-12 -mt-4 rounded-full bg-white border-2 border-blue-400 p-1 flex items-center justify-center shadow-xl transition-all shrink-0 overflow-hidden ${
            isHomeActive
              ? 'ring-4 ring-blue-400 shadow-blue-500/50 scale-105'
              : 'ring-4 ring-[#172554] shadow-blue-900/40 active:scale-95'
          }`}
          title="الرئيسية (لوحة التحكم)"
        >
          <Image
            src="/logo.png"
            alt="شعار كلية الذكاء الاصطناعي"
            width={44}
            height={44}
            className="w-full h-full object-contain"
            priority
          />
        </Link>

        {/* 4. Key Icon (أكوادي) */}
        <Link
          href="/codes"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
            isCodesActive
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40 border border-blue-400/50'
              : 'text-slate-300 hover:text-white'
          }`}
          title="أكوادي الأكاديمية"
        >
          <KeyRound className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold mt-0.5">أكوادي</span>
        </Link>

        {/* 5. More Icon (المزيد) */}
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center py-1.5 px-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          title="المزيد (قريباً)"
        >
          <MoreHorizontal className="w-5 h-5 group-hover:scale-105 transition-transform" />
          <span className="text-[10px] font-medium mt-0.5 text-slate-300">المزيد</span>
        </button>

      </div>
    </nav>
  );
}
