'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  LogOut, 
  ChevronRight, 
  Sparkles, 
  HelpCircle, 
  ClipboardCheck, 
  KeyRound, 
  Home 
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

export function Sidebar({ currentPath }: { currentPath?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { addNotification } = useNotifications();
  const pathname = usePathname() || currentPath || '/';
  const isHomeActive = pathname === '/';
  const isCoursesActive = pathname.startsWith('/courses');
  const isExamsActive = pathname.startsWith('/exams');
  const isCodesActive = pathname.startsWith('/codes');

  interface NavItem {
    title: string;
    href: string;
    icon: typeof Home;
    isActive: boolean;
    isButton?: boolean;
  }

  const navItems: NavItem[] = [
    {
      title: 'الرئيسية',
      href: '/',
      icon: Home,
      isActive: isHomeActive,
    },
    {
      title: 'مكتبة المقررات',
      href: '/courses',
      icon: BookOpen,
      isActive: isCoursesActive,
    },
    {
      title: 'الاختبارات',
      href: '/exams',
      icon: ClipboardCheck,
      isActive: isExamsActive,
    },
    {
      title: 'أكوادي',
      href: '/codes',
      icon: KeyRound,
      isActive: isCodesActive,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-start p-3.5 shrink-0 sticky top-0 h-screen select-none z-40">
      {/* Pill Capsule / Expandable Container */}
      <div 
        className={`h-full bg-[#172554] rounded-[38px] flex flex-col justify-between py-5 shadow-2xl border border-blue-900/60 relative overflow-hidden transition-[width] duration-300 ease-in-out ${
          isExpanded ? 'w-64 px-4' : 'w-[78px] px-3'
        }`}
      >
        {/* ========================================================= */}
        {/* 1. TOP SECTION: Distinctive Emblem & Logo                 */}
        {/* ========================================================= */}
        <div className="w-full shrink-0 pb-3.5 border-b border-blue-900/60">
          <div className="flex items-center justify-between gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 flex items-center gap-3 outline-hidden cursor-pointer text-right min-w-0"
              title={isExpanded ? 'طي القائمة الجانبية' : 'اضغط لفتح القائمة الجانبية'}
            >
              {/* University Emblem Logo (Always stationary, smoothly centered when collapsed) */}
              <div className="relative shrink-0 flex items-center justify-center">
                <span
                  className="absolute inset-0 rounded-full bg-white/20 animate-white-wave pointer-events-none"
                  aria-hidden="true"
                />
                <div className="w-12 h-12 rounded-full bg-white border-2 border-white flex items-center justify-center p-1.5 shrink-0 shadow-lg shadow-blue-950/40 ring-2 ring-blue-400/40 ring-offset-2 ring-offset-[#172554] hover:scale-105 hover:shadow-blue-400/60 transition-all duration-300 overflow-hidden animate-white-pulse">
                  <Image
                    src="/logo.png"
                    alt="شعار كلية الذكاء الاصطناعي"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain filter drop-shadow-xs select-none"
                    priority
                    unoptimized
                  />
                </div>
              </div>

              {/* Title Text (Smooth CSS max-width/opacity transition - No popping) */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap min-w-0 ${
                  isExpanded 
                    ? 'max-w-[145px] opacity-100 translate-x-0' 
                    : 'max-w-0 opacity-0 translate-x-3 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white tracking-tight truncate">
                    كلية الذكاء الاصطناعي
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                </div>
                <p className="text-[11px] text-blue-200 truncate mt-0.5">المنصة الأكاديمية</p>
              </div>
            </button>

            {/* Collapse Chevron Toggle Button */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
                isExpanded ? 'max-w-8 opacity-100' : 'max-w-0 opacity-0 pointer-events-none'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="طي القائمة"
                aria-label="طي القائمة الجانبية"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. MIDDLE SECTION: Navigation Items                       */}
        {/* ========================================================= */}
        <div className="flex-1 my-3.5 flex flex-col justify-start gap-2 w-full overflow-hidden">
          {/* Header Label (Smooth transition) */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap px-1 ${
              isExpanded 
                ? 'max-h-6 opacity-100 mb-1' 
                : 'max-h-0 opacity-0 mb-0 pointer-events-none'
            }`}
          >
            <p className="text-[10px] font-extrabold text-blue-300/80 uppercase tracking-wider">
              القائمة الأكاديمية
            </p>
          </div>

          {/* Navigation Links List */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                {/* Fixed Icon Container: Always 48px wide, perfectly centered in collapsed mode */}
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Label container: Smooth slide and fade without sudden DOM layout shifts */}
                <div 
                  className={`flex-1 flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap pe-3.5 ${
                    isExpanded 
                      ? 'max-w-[150px] opacity-100 translate-x-0' 
                      : 'max-w-0 opacity-0 translate-x-3 pointer-events-none'
                  }`}
                >
                  <span className="text-sm font-bold truncate">{item.title}</span>
                  {item.isActive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                </div>
              </>
            );

            const commonClasses = `w-full h-12 rounded-2xl flex items-center transition-all duration-200 cursor-pointer overflow-hidden ${
              item.isActive
                ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/40 border border-blue-400/60'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40 border border-transparent'
            }`;

            if (item.isButton) {
              return (
                <div key={item.title} className="w-full">
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    className={commonClasses}
                    title={item.title}
                    aria-label={item.title}
                  >
                    {content}
                  </button>
                </div>
              );
            }

            return (
              <div key={item.title} className="w-full">
                <Link
                  href={item.href}
                  className={commonClasses}
                  title={item.title}
                  aria-label={item.title}
                >
                  {content}
                </Link>
              </div>
            );
          })}

          {/* Academic Help Info Box (Smooth height/opacity collapse) */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out mt-auto ${
              isExpanded 
                ? 'max-h-28 opacity-100 mb-1' 
                : 'max-h-0 opacity-0 mb-0 pointer-events-none'
            }`}
          >
            <div className="bg-blue-950/60 rounded-2xl p-3 border border-blue-800/40">
              <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-white">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">الدعم الأكاديمي</span>
              </div>
              <p className="text-[11px] text-blue-200/80 leading-relaxed truncate">
                تصفح المقررات وحمّل الملفات بسهولة.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. BOTTOM SECTION: Logout & Student Status                */}
        {/* ========================================================= */}
        <div className="w-full shrink-0 pt-3 border-t border-blue-900/60 flex items-center justify-between overflow-hidden">
          {/* Student name and department */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-right ${
              isExpanded 
                ? 'max-w-[145px] opacity-100 ps-1' 
                : 'max-w-0 opacity-0 pointer-events-none'
            }`}
          >
            <p className="text-xs font-bold text-white truncate">عبد الرحمن خالد</p>
            <p className="text-[10px] text-blue-300 truncate mt-0.5">طالب • ذكاء اصطناعي</p>
          </div>

          {/* Logout button (smooth width between 40px when expanded and full 48px when collapsed) */}
          <button
            type="button"
            onClick={() => {
              router.push('/login');
            }}
            className={`h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0 ${
              isExpanded ? 'w-10' : 'w-full'
            }`}
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5 -scale-x-100" />
          </button>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </aside>
  );
}
