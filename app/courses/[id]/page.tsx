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
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header: Back Button & Compact Course Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200/80 transition-all group shrink-0"
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            <span>العودة للمقررات</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/70 shrink-0">
              {course.code}
            </span>
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 truncate">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Doctor Name Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70 self-start sm:self-auto shrink-0">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>أستاذ المقرر:</span>
          <span className="font-bold text-slate-800">{course.doctorName}</span>
        </div>
      </div>

      {/* Interactive Content Browser (Tabs + In-Course Search + Google Drive Table) */}
      <CourseContentBrowser
        items={course.content}
        courseCode={course.code}
      />
    </div>
  );
}
