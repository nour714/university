'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  BookOpen, 
  Calendar, 
  Bell, 
  GraduationCap, 
  FolderKanban, 
  Layers
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
        className="lg:hidden p-2 text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="فتح القائمة الرئيسية"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed inset-y-0 right-0 w-72 bg-[#172554] text-white p-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-blue-900/60 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">كلية الذكاء الاصطناعي</h2>
                    <p className="text-xs text-blue-200">بوابة المقررات الإلكترونية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-900 transition-colors"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                          : 'text-slate-300 hover:bg-blue-900/40 hover:text-white'
                      }`}
                    >
                      {link.icon === 'BookOpen' && <BookOpen className="w-5 h-5" />}
                      {link.icon === 'Calendar' && <Calendar className="w-5 h-5" />}
                      {link.icon === 'Bell' && <Bell className="w-5 h-5" />}
                      {link.icon === 'FolderKanban' && <FolderKanban className="w-5 h-5" />}
                      {link.icon === 'Layers' && <Layers className="w-5 h-5" />}
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-blue-900/60 text-xs text-blue-300 text-center">
              نظام إدارة المقررات الذكي v1.0
            </div>
          </div>
        </div>
      )}
    </>
  );
}

