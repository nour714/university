'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  Search, 
  User, 
  GraduationCap, 
  Menu,
  X
} from 'lucide-react';
import { NAVIGATION_LINKS } from './Sidebar';

export function BottomNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isCoursesActive = pathname.startsWith('/courses');

  const scrollToSearch = () => {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput.focus();
    }
  };

  return (
    <>
      {/* Floating Bottom Capsule Dock (Mobile Only) */}
      <nav 
        aria-label="شريط التنقل السفلي"
        className="fixed bottom-3.5 inset-x-3 max-w-md mx-auto z-40 lg:hidden"
      >
        <div className="bg-[#172554]/95 backdrop-blur-xl border border-blue-900/80 rounded-full px-3 py-1.5 shadow-2xl shadow-blue-950/60 flex items-center justify-around">
          {/* 1. Courses Library (Active Item) */}
          <Link
            href="/courses"
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all ${
              isCoursesActive
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-0.5">المقررات</span>
          </Link>

          {/* 2. Quick Search Button */}
          <button
            type="button"
            onClick={scrollToSearch}
            className="flex flex-col items-center justify-center py-1.5 px-3 text-slate-300 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">بحث</span>
          </button>

          {/* 3. Center Emblem Logo (Golden Crest) */}
          <Link
            href="/courses"
            className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-200 text-[#172554] flex items-center justify-center shadow-lg shadow-amber-500/40 ring-4 ring-[#172554] active:scale-95 transition-transform"
            title="كلية الذكاء الاصطناعي"
          >
            <GraduationCap className="w-6 h-6 stroke-[2.5]" />
          </Link>

          {/* 4. Student Profile Icon */}
          <div className="flex flex-col items-center justify-center py-1.5 px-3 text-slate-300 hover:text-white transition-colors">
            <div className="relative">
              <User className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#172554]" />
            </div>
            <span className="text-[10px] font-medium mt-0.5">طالب</span>
          </div>

          {/* 5. Mobile Drawer Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-3 text-slate-300 hover:text-white transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">المزيد</span>
          </button>
        </div>
      </nav>

      {/* Full Drawer triggered from bottom nav or header */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden animate-fadeIn"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-[#172554] text-white p-6 shadow-2xl flex flex-col justify-between border-l border-blue-900/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header with Distinctive Golden Crest */}
              <div className="flex items-center justify-between pb-5 border-b border-blue-900/60 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border border-amber-200 text-[#172554] flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
                    <GraduationCap className="w-6 h-6 stroke-[2.4]" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-white">كلية الذكاء الاصطناعي</h2>
                    <p className="text-[11px] text-blue-200">المنصة الأكاديمية الذكية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-blue-300 hover:text-white rounded-xl hover:bg-blue-900/60 transition-colors"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="mb-4">
                <p className="text-[10px] font-bold text-blue-300/80 uppercase px-3 mb-2 tracking-wider">
                  الأقسام
                </p>
                <nav className="space-y-2">
                  {NAVIGATION_LINKS.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsDrawerOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/60'
                            : 'text-slate-300 hover:bg-blue-900/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5" />
                          <span>{link.name}</span>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Student Profile Card in Drawer */}
              <div className="mt-6 bg-blue-950/70 p-4 rounded-2xl border border-blue-900/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  <User className="w-5 h-5" />
                </div>
                <div className="truncate text-right">
                  <p className="text-xs font-bold text-white truncate">عبد الرحمن خالد</p>
                  <p className="text-[10px] text-blue-200">طالب • المستوى الثالث (ذكاء اصطناعي)</p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-blue-900/60 text-[11px] text-blue-300 text-center">
              جامعة المستقبل الذكية © 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
}
