'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, Calendar, ShieldCheck, User } from 'lucide-react';
import { StudentProfile } from '@/data/student';

interface StudentHeroProps {
  student: StudentProfile;
}

export function StudentHero({ student }: StudentHeroProps) {
  const [formattedDate, setFormattedDate] = useState<string>('الفصل الدراسي الأول');

  useEffect(() => {
    try {
      const today = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
      setFormattedDate(today);
    } catch {
      setFormattedDate('الفصل الدراسي الأول');
    }
  }, []);

  return (
    <section 
      aria-label="الملف الأكاديمي للطالب"
      className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#0b1329] via-[#172554] to-[#1e1b4b] p-6 sm:p-8 lg:p-10 text-white shadow-2xl border border-blue-800/40"
    >
      {/* Ambient background glow highlights */}
      <div 
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" 
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8">
        {/* Right Info Section (RTL) */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          {/* Top Badges Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {student.academicYear} • {student.semester}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {student.status}
            </span>
          </div>

          {/* Student Welcome & Full Name */}
          <div>
            <p className="text-xs sm:text-sm font-medium text-blue-200/90 mb-1">
              مرحباً بك مجدداً في بوابتك الأكاديمية 👋
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {student.fullName}
            </h1>
          </div>

          {/* Department & Date Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-blue-200/80 pt-1">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              {student.department}
            </span>
            <span className="hidden sm:inline text-blue-400/50">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-300" />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Left Profile Avatar Capsule */}
        <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-r border-blue-800/60 pt-4 md:pt-0 md:pr-8 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {/* Premium Gradient Ring Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/25">
                <div className="w-full h-full rounded-[14px] bg-[#172554] flex items-center justify-center text-amber-300">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
                </div>
              </div>
              <span 
                className="absolute -bottom-1 -left-1 w-4 h-4 bg-emerald-500 border-2 border-[#172554] rounded-full shadow-xs" 
                title="حساب نشط" 
              />
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-blue-300/80 font-bold block">
                الرقم الجامعي
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider">
                {student.academicId}
              </span>
              <span className="text-[11px] text-blue-200 block font-medium">
                {student.faculty}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
