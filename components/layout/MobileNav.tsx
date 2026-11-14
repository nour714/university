'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  BookOpen, 
  GraduationCap,
  Sparkles,
  User
} from 'lucide-react';

interface MobileNavProps {
  navLinks: {
    name: string;
    href: string;
    icon: string;
    active: boolean;
  }[];
}

export function MobileNav({ navLinks }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-blue-500/20 active:scale-95"
        aria-label="فتح القائمة الرئيسية"
      >
        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-[#172554] text-white p-5 sm:p-6 shadow-2xl flex flex-col justify-between border-l border-blue-900/60"
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
                    <div className="flex items-center gap-1">
                      <h2 className="font-extrabold text-sm text-white">كلية الذكاء الاصطناعي</h2>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-blue-200">جامعة كفر الشيخ • البوابة الأكاديمية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-blue-300 hover:text-white rounded-xl hover:bg-blue-900/60 transition-colors"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <div className="mb-2">
                <p className="text-[10px] font-bold text-blue-300/80 uppercase px-3 mb-2 tracking-wider">
                  الأقسام الرئيسية
                </p>
                <nav className="space-y-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
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

              {/* Student Info Card inside Mobile Drawer */}
              <div className="mt-6 bg-blue-950/70 p-3.5 rounded-2xl border border-blue-900/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="truncate text-right">
                  <p className="text-xs font-bold text-white truncate">عبد الرحمن خالد</p>
                  <p className="text-[10px] text-blue-200">طالب • المستوى الثالث</p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-blue-900/60 text-[11px] text-blue-300 text-center">
              كلية الذكاء الاصطناعي • جامعة كفر الشيخ © 2026
            </div>
          </div>
        </div>
      )}
    </>
  );
}
