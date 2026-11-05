'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';

export function SettingsButton() {
  const pathname = usePathname();
  const isActive = pathname === '/settings';

  return (
    <Link
      href="/settings"
      className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
        isActive
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30'
          : 'bg-slate-50 hover:bg-blue-50/80 text-slate-700 hover:text-blue-600 border-slate-200/90 shadow-2xs'
      }`}
      aria-label="الإعدادات والدعم الفني"
      title="الإعدادات والدعم الفني"
    >
      <Settings 
        className={`w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2] transition-transform duration-700 ease-in-out group-hover:rotate-180 ${
          isActive ? 'text-white' : 'text-slate-700 group-hover:text-blue-600'
        }`} 
      />
    </Link>
  );
}

