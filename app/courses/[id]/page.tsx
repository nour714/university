import { notFound } from 'next/navigation';
import Link from 'next/link';
import { COURSES_DATA } from '@/data/courses';
import { CourseContentBrowser } from '@/components/course-detail/CourseContentBrowser';
import { 
  ArrowRight, 
  User, 
  Clock, 
} from 'lucide-react';

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
    <div className="space-y-6">
      {/* Top Back Navigation Breadcrumb */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-slate-200/80 transition-all shadow-2xs group"
        >
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          <span>العودة إلى مكتبة المقررات</span>
        </Link>
      </div>

      {/* Course Hero Banner */}
      <div className="bg-[#172554] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-900/60">
        <div className="relative z-10">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold tracking-wider shadow-sm">
              {course.code}
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-900/80 text-blue-200 text-xs font-medium border border-blue-700/50">
              المستوى {course.level}
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-900/80 text-blue-200 text-xs font-medium border border-blue-700/50">
              {course.department}
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-900/80 text-blue-200 text-xs font-medium border border-blue-700/50">
              {course.semester}
            </span>
            <span className="px-3 py-1 rounded-lg bg-blue-900/80 text-blue-200 text-xs font-medium border border-blue-700/50 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              {course.creditHours} ساعات معتمدة
            </span>
          </div>

          {/* Titles */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
            {course.title}
          </h1>
          <p className="text-sm sm:text-base text-blue-200 font-mono mb-4" dir="ltr">
            {course.englishTitle}
          </p>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-3xl mb-6">
            {course.description}
          </p>

          {/* Professor & Course Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-900/70">
            {/* Professor Info */}
            <div className="flex items-center gap-3.5 bg-blue-950/60 p-3.5 rounded-2xl border border-blue-800/40">
              <div className="w-12 h-12 rounded-xl bg-blue-600/40 border border-blue-400/30 flex items-center justify-center shrink-0 text-white">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-blue-300 block font-medium">أستاذ المادة والمشرف الأكاديمي:</span>
                <p className="font-bold text-sm text-white truncate">{course.doctorName}</p>
                <p className="text-xs text-blue-200 truncate">{course.doctorTitle}</p>
              </div>
            </div>

            {/* Quick Content Summary Stats */}
            <div className="flex items-center justify-around bg-blue-950/60 p-3.5 rounded-2xl border border-blue-800/40 text-center">
              <div>
                <span className="text-lg font-black text-white block">{course.itemsCount.files}</span>
                <span className="text-[11px] text-blue-300">ملفات PDF</span>
              </div>
              <div className="w-px h-8 bg-blue-800/60" />
              <div>
                <span className="text-lg font-black text-white block">{course.itemsCount.videos}</span>
                <span className="text-[11px] text-blue-300">فيديوهات</span>
              </div>
              <div className="w-px h-8 bg-blue-800/60" />
              <div>
                <span className="text-lg font-black text-white block">{course.itemsCount.images}</span>
                <span className="text-[11px] text-blue-300">مخططات</span>
              </div>
              <div className="w-px h-8 bg-blue-800/60" />
              <div>
                <span className="text-lg font-black text-white block">{course.itemsCount.links}</span>
                <span className="text-[11px] text-blue-300">روابط</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient decorative elements */}
        <div className="absolute left-0 bottom-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Interactive Content Browser (Tabs + In-Course Search + Google Drive Table) */}
      <CourseContentBrowser
        items={course.content}
        courseCode={course.code}
      />
    </div>
  );
}
