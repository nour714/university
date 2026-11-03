import { Suspense } from 'react';
import { Menu, GraduationCap, User, Sparkles } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { NAVIGATION_LINKS } from './Sidebar';

export function Header() {
  return (
    <header className="sticky top-3.5 z-30 mx-4 sm:mx-6 lg:mx-8 mb-2 transition-all">
      {/* Floating Pill Container with Curved Sides */}
      <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-slate-200/90 shadow-md shadow-slate-200/50 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Right side: Mobile Menu + Academic Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Suspense fallback={
            <div className="lg:hidden p-2 text-slate-400 rounded-lg">
              <Menu className="w-6 h-6" />
            </div>
          }>
            <MobileNav navLinks={NAVIGATION_LINKS} />
          </Suspense>
          
          <div className="truncate">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                العام الأكاديمي 2026/2027
              </span>
              <span className="text-xs text-slate-500 hidden md:inline font-medium">• الفصل الدراسي الأول</span>
            </div>
            
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#172554] tracking-tight truncate">
                بوابة كلية الذكاء الاصطناعي الأكاديمية
              </h1>
              <Sparkles className="w-4 h-4 text-blue-600 hidden sm:block shrink-0" />
            </div>
          </div>
        </div>

        {/* Left side: Modern Integrated Student Profile Capsule */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-2xl py-1.5 px-3 transition-all cursor-pointer group shadow-2xs"
            title="الملف الشخصي للطالب"
          >
            {/* Student Avatar with Online Badge */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                <User className="w-4 h-4 stroke-[2.5]" />
              </div>
              {/* Online Green Indicator Dot pinned to Avatar */}
              <span 
                className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" 
                title="متصل الآن"
              />
            </div>

            {/* Student Name and Academic Level (Clean Arabic RTL typography) */}
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                عبد الرحمن خالد
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                طالب • المستوى الثالث (ذكاء اصطناعي)
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
