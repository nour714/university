import { Suspense } from 'react';
import { Menu, GraduationCap, UserCircle, Sparkles } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { NAVIGATION_LINKS } from './Sidebar';

export function Header() {
  return (
    <header className="sticky top-3.5 z-30 mx-4 sm:mx-6 lg:mx-8 mb-2 transition-all">
      {/* Floating Pill Container with Curved Sides */}
      <div className="bg-white/95 backdrop-blur-md rounded-[26px] border border-slate-200/90 shadow-md shadow-slate-200/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
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

        {/* Left side: Student Profile & Online Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-left hidden md:block">
            <div className="flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-bold text-slate-800">عبد الرحمن خالد</p>
            </div>
            <p className="text-xs text-slate-500 font-medium">طالب • المستوى الثالث (ذكاء اصطناعي)</p>
          </div>
          
          {/* Avatar Capsule */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
            <UserCircle className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </div>
    </header>
  );
}
