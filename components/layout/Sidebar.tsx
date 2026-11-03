import Link from 'next/link';
import { 
  Plus, 
  BookOpen, 
  GraduationCap,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const NAVIGATION_LINKS = [
  { name: 'مكتبة المقررات', href: '/courses', icon: 'BookOpen', active: true },
];

export function Sidebar({ currentPath = '/courses' }: { currentPath?: string }) {
  const isCoursesActive = currentPath.startsWith('/courses');

  return (
    <aside className="hidden lg:flex flex-col items-center justify-between p-3.5 shrink-0 sticky top-0 h-screen select-none z-40">
      {/* Pill Capsule Container matching reference design in website colors */}
      <div className="w-[76px] h-full bg-[#172554] rounded-[38px] flex flex-col items-center justify-between py-5 px-2 shadow-2xl border border-blue-900/60 relative overflow-hidden">
        
        {/* Top Section: College Emblem & Primary Action Button */}
        <div className="flex flex-col items-center gap-3.5 w-full shrink-0">
          {/* Top Logo / College Badge */}
          <Link
            href="/courses"
            className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800/80 text-blue-300 hover:text-white hover:border-blue-500 hover:bg-blue-900/60 flex items-center justify-center transition-all shadow-sm group relative"
            title="كلية الذكاء الاصطناعي"
          >
            <GraduationCap className="w-6 h-6 group-hover:scale-110 transition-transform" />
            
            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
              <div className="bg-[#172554] text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                كلية الذكاء الاصطناعي
              </div>
            </div>
          </Link>

          {/* Primary Action Button (Blue Circle matching the site's primary blue #2563EB) */}
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 transition-all hover:scale-105 active:scale-95 group relative"
            title="استكشاف المقررات"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />

            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
              <div className="bg-[#172554] text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                تصفح المقررات
              </div>
            </div>
          </button>
        </div>

        {/* Middle Section: ONLY the original content (مكتبة المقررات) */}
        <div className="flex-1 my-6 flex flex-col items-center justify-start w-full">
          <div className="relative group flex flex-col items-center">
            <Link
              href="/courses"
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                isCoursesActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500 shadow-lg shadow-blue-600/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-blue-900/40'
              }`}
              aria-label="مكتبة المقررات"
            >
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </Link>

            {/* Micro label underneath for clear accessibility */}
            <span className={`text-[10px] font-bold mt-1.5 transition-colors ${
              isCoursesActive ? 'text-blue-300' : 'text-slate-400'
            }`}>
              المقررات
            </span>

            {/* Full Tooltip on hover */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
              <div className="bg-[#172554] text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                مكتبة المقررات الأكاديمية
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Avatar & Logout */}
        <div className="flex flex-col items-center gap-3 w-full shrink-0 pt-3 border-t border-blue-900/60">
          <ChevronDown className="w-4 h-4 text-blue-400/40" />

          {/* User Avatar Circle (MR in Blue) */}
          <div 
            className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-600/40 cursor-pointer hover:scale-105 transition-transform border-2 border-blue-400/50 group relative"
            title="عبد الرحمن خالد (MR)"
          >
            MR
            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
              <div className="bg-[#172554] text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-blue-700 shadow-xl whitespace-nowrap">
                عبد الرحمن خالد (طالب)
              </div>
            </div>
          </div>

          {/* Logout / Exit */}
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
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
      </div>
    </aside>
  );
}
