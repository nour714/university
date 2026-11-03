import Link from 'next/link';
import { GraduationCap, User, Sparkles } from 'lucide-react';
import { CURRENT_STUDENT } from '@/data/student';

export function Header() {
  return (
    <header className="sticky top-2 sm:top-3.5 z-30 mx-2 sm:mx-6 lg:mx-8 mb-2 transition-all">
      {/* Floating Pill Container with Curved Sides */}
      <div className="bg-white/95 backdrop-blur-md rounded-[22px] sm:rounded-[26px] border border-slate-200/90 shadow-md shadow-slate-200/40 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Right side: Academic Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                العام الأكاديمي 2026/2027
              </span>
              <span className="text-xs text-slate-500 hidden md:inline font-medium">• الفصل الدراسي الأول</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-[#172554] tracking-tight truncate">
                كلية الذكاء الاصطناعي
              </h1>
              <span className="text-xs text-slate-500 hidden sm:inline font-semibold">| بوابة المقررات</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600 hidden lg:block shrink-0" />
            </div>
          </div>
        </div>

        {/* Left side: Clean Student Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <Link 
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 transition-all cursor-pointer group"
            title="الرئيسية - الملف الشخصي للطالب"
          >
            {/* Circular Avatar: Clean without outer box or status dot */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Student Name and Academic Level */}
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                {CURRENT_STUDENT.fullName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                {CURRENT_STUDENT.level} • {CURRENT_STUDENT.faculty}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
