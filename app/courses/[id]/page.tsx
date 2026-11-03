import { notFound } from 'next/navigation';
import Link from 'next/link';
import { COURSES_DATA } from '@/data/courses';
import { CourseContentBrowser } from '@/components/course-detail/CourseContentBrowser';
import { ArrowRight, User } from 'lucide-react';

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Allow blocking route for params access in Next.js 16
export const instant = false;

// Generate static routes for all courses for blazing fast Edge SSG performance
export function generateStaticParams() {
  return COURSES_DATA.map((course) => ({
    id: course.id,
  }));
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const course = COURSES_DATA.find((c) => c.id === id);
  if (!course) return { title: 'المقرر غير موجود | كلية الذكاء الاصطناعي' };

  return {
    title: `${course.code}: ${course.title} | كلية الذكاء الاصطناعي`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const course = COURSES_DATA.find((c) => c.id === id);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Header: Blue Banner with Preserved Light Back Button */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 text-white rounded-2xl p-3.5 sm:py-3.5 sm:px-4.5 shadow-lg relative overflow-hidden border border-blue-900/60">
        {/* Mobile Layout (< sm) */}
        <div className="flex flex-col gap-2.5 sm:hidden relative z-10">
          {/* Top row: Back button + Course code */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-700 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-sm transition-all group active:scale-95"
            >
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-slate-700 group-hover:text-blue-700" />
              <span>العودة للمقررات</span>
            </Link>

            <span className="px-2.5 py-1 rounded-lg bg-blue-500/25 text-blue-200 border border-blue-400/30 text-xs font-bold tracking-wider shadow-xs">
              {course.code}
            </span>
          </div>

          {/* Middle row: Course Title */}
          <h1 className="text-base font-extrabold text-white tracking-tight leading-snug">
            {course.title}
          </h1>

          {/* Bottom row: Doctor Info */}
          <div className="flex items-center gap-2 text-xs text-blue-100 bg-blue-950/70 px-3 py-1.5 rounded-lg border border-blue-800/50 w-fit shadow-xs">
            <User className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span className="text-blue-200">أستاذ المقرر:</span>
            <span className="font-bold text-white">{course.doctorName}</span>
          </div>
        </div>

        {/* Desktop Layout (>= sm) */}
        <div className="hidden sm:flex sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Preserved Light Back Button */}
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-blue-700 bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-md transition-all group shrink-0 active:scale-95"
            >
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 text-slate-700 group-hover:text-blue-700" />
              <span>العودة للمقررات</span>
            </Link>

            <div className="h-6 w-px bg-blue-700/60 shrink-0" />

            {/* Course Code & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/25 text-blue-200 border border-blue-400/30 text-xs font-bold tracking-wider shrink-0 shadow-xs">
                {course.code}
              </span>
              <h1 className="text-xl font-extrabold text-white tracking-tight truncate">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Doctor Name Badge */}
          <div className="flex items-center gap-2 text-xs text-blue-100 bg-blue-950/60 px-3.5 py-2 rounded-xl border border-blue-800/50 shrink-0 shadow-xs">
            <User className="w-4 h-4 text-blue-300" />
            <span className="text-blue-200">أستاذ المقرر:</span>
            <span className="font-bold text-white">{course.doctorName}</span>
          </div>
        </div>

        {/* Ambient subtle background glow */}
        <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
      </div>

      {/* Interactive Content Browser (Tabs + In-Course Search + Google Drive Table) */}
      <CourseContentBrowser
        items={course.content}
        courseCode={course.code}
      />
    </div>
  );
}
