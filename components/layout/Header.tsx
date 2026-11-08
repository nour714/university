'use client';

import Link from 'next/link';
import Image from 'next/image';
import { User, Sparkles } from 'lucide-react';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SettingsButton } from '@/components/layout/SettingsButton';

export function Header() {
  const { student } = useStudentProfile();
  const fullName = student?.fullName || 'الملف الأكاديمي';
  const subtitle = student ? `${student.level} • ${student.faculty}` : 'لوحة تحكم الطالب';

  return (
    <header className="sticky top-2 sm:top-3 z-30 mx-2.5 sm:mx-6 lg:mx-8 mb-2.5 sm:mb-3 transition-all">
      {/* Floating Pill Container with Curved Sides */}
      <div className="bg-white/95 backdrop-blur-md rounded-[26px] sm:rounded-[30px] border border-slate-200/90 shadow-md shadow-slate-200/50 px-4 sm:px-6 py-2.5 sm:py-3.5 min-h-[60px] sm:min-h-[66px] flex items-center justify-between gap-3 sm:gap-4">
        {/* Right side: Academic Title with Official Logo */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          {/* Mobile Logo: Clean & Transparent with No Background Box */}
          <Link 
            href="/" 
            className="lg:hidden flex items-center justify-center shrink-0 transition-transform active:scale-95 py-0.5"
            title="الرئيسية"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9">
              <Image 
                src="/images/logo.png" 
                alt="شعار كلية الذكاء الاصطناعي" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
          </Link>

          {/* Academic Portal Title */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                <span>البوابة الأكاديمية الرسمية</span>
              </span>
            </div>
            <h2 className="text-xs sm:text-base font-extrabold text-slate-800 tracking-tight truncate leading-snug">
              كلية الذكاء الاصطناعي
            </h2>
          </div>
        </div>

        {/* Left side: Settings + Notifications Bell + Student Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Settings Page Button (with hover spin) */}
          <SettingsButton />

          {/* Academic Notifications Bell */}
          <NotificationBell />

          {/* Student Profile Avatar with Hover Reveal */}
          <Link 
            href="/"
            className="flex items-center transition-all duration-700 cursor-pointer group"
            title="الرئيسية - الملف الشخصي للطالب"
          >
            {/* Circular Avatar */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-600/20 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-blue-600/30 transition-all duration-700 ease-out shrink-0">
              <User className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>

            {/* Student Name and Academic Level - Appears in Slow Motion when hovering over the icon */}
            <div className="text-right hidden sm:flex flex-col max-w-0 opacity-0 overflow-hidden group-hover:max-w-[280px] group-hover:opacity-100 group-hover:ms-2.5 transition-all duration-700 ease-in-out whitespace-nowrap pointer-events-none group-hover:pointer-events-auto">
              <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                {fullName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                {subtitle}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
