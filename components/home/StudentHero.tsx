'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GraduationCap, Sparkles, Calendar, ShieldCheck } from 'lucide-react';
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

      {/* Decorative Official College Logo Watermark */}
      <div className="absolute left-6 bottom-4 sm:bottom-6 w-36 h-36 sm:w-48 sm:h-48 opacity-20 pointer-events-none hidden md:block">
        <Image
          src="/logo.png"
          alt="شعار كلية الذكاء الاصطناعي"
          width={192}
          height={192}
          className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]"
        />
      </div>

      <div className="relative z-10 space-y-3 sm:space-y-4">
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
    </section>
  );
}
