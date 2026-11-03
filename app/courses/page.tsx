import { Suspense } from 'react';
import { COURSES_DATA } from '@/data/courses';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseFilters } from '@/components/courses/CourseFilters';
import { Sparkles, FolderSearch } from 'lucide-react';
import Link from 'next/link';

interface CoursesPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export const metadata = {
  title: 'مكتبة المقررات الأكاديمية | كلية الذكاء الاصطناعي',
  description: 'استكشف المقررات الدراسية، المحاضرات، التمارين، والوسائط لكل الأقسام والمستويات.',
};

// Async Server Component that consumes searchParams inside Suspense
async function CoursesList({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const query = (params.q || '').trim().toLowerCase();

  // Filter courses on the server by query
  const filteredCourses = COURSES_DATA.filter((course) => {
    if (query) {
      const matchTitle = course.title.toLowerCase().includes(query);
      const matchCode = course.code.toLowerCase().includes(query);
      const matchEng = course.englishTitle.toLowerCase().includes(query);
      const matchDoc = course.doctorName.toLowerCase().includes(query);
      if (!matchTitle && !matchCode && !matchEng && !matchDoc) {
        return false;
      }
    }
    return true;
  });

  return (
    <>
      {/* Interactive Search Bar Client Component */}
      <CourseFilters />

      {/* Course Cards Grid (Server Rendered) */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <FolderSearch className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">لم يتم العثور على مقررات مطابقة</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            تأكد من كتابة اسم المقرر أو كود المادة بشكل صحيح.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            عرض كافة المقررات
          </Link>
        </div>
      )}
    </>
  );
}

function CoursesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Hero Header (Static Server Shell) */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>مستودع المعرفة المفتوح لطلاب الكلية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            مكتبة المقررات الدراسية
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            تصفح وحمّل المحاضرات، سلايدات الشرح، الفيديوهات التعليمية، والروابط البرمجية المعتمدة لجميع الفرق والأقسام العلمية في كلية الذكاء الاصطناعي.
          </p>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/2 -top-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Dynamic Search & Grid Streaming inside Suspense */}
      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
