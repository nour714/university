import { COURSES_DATA } from '@/data/courses';
import { CoursesCatalog } from '@/components/courses/CoursesCatalog';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'مكتبة المقررات الأكاديمية | كلية الذكاء الاصطناعي',
  description: 'استكشف المقررات الدراسية، المحاضرات، التمارين، والوسائط لكل الأقسام والمستويات.',
};

export default function CoursesPage() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Page Hero Header: Compact & Sleek */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:py-4.5 sm:px-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] sm:text-xs font-semibold mb-1.5 border border-blue-400/20">
            <Sparkles className="w-3 h-3 text-blue-300" />
            <span>مستودع المعرفة المفتوح لطلاب الكلية</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight mb-1">
            مكتبة المقررات الدراسية
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed line-clamp-2 sm:line-clamp-none">
            تصفح وحمّل المحاضرات، سلايدات الشرح، الفيديوهات التعليمية، والروابط البرمجية المعتمدة لجميع الفرق والأقسام.
          </p>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Dynamic Search & Grid (Rock-solid on Mobile & Desktop) */}
      <CoursesCatalog courses={COURSES_DATA} />
    </div>
  );
}
