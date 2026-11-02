import { Suspense } from 'react';
import { Menu, GraduationCap, UserCircle } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { NAVIGATION_LINKS } from './Sidebar';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Right side: Mobile Menu + Title */}
        <div className="flex items-center gap-3">
          <Suspense fallback={
            <div className="lg:hidden p-2 text-slate-400 rounded-lg">
              <Menu className="w-6 h-6" />
            </div>
          }>
            <MobileNav navLinks={NAVIGATION_LINKS} />
          </Suspense>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <GraduationCap className="w-3.5 h-3.5" />
                العام الأكاديمي 2026/2027
              </span>
              <span className="text-xs text-slate-500 hidden md:inline">• الفصل الدراسي الأول</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#172554] tracking-tight">
              بوابة كلية الذكاء الاصطناعي الأكاديمية
            </h1>
          </div>
        </div>

        {/* Left side: Student Profile & Badge */}
        <div className="flex items-center gap-3">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">عبد الرحمن خالد</p>
            <p className="text-xs text-slate-500">طالب • المستوى الثالث (ذكاء اصطناعي)</p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:border-blue-400 transition-colors">
            <UserCircle className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
