import { listCourses } from '@/server/courses/service';
import { requireAuth } from '@/server/auth/requireAuth';
import { CoursesCatalog } from '@/components/courses/CoursesCatalog';
import { GraduationCap } from 'lucide-react';

export const maxDuration = 100;

export const metadata = {
  title: 'مكتبة المقررات الأكاديمية | كلية الذكاء الاصطناعي - جامعة كفر الشيخ',
  description: 'استكشف المقررات الدراسية، المحاضرات، التمارين، والوسائط للمستوى الدراسي المسجل للطالب.',
};

export default async function CoursesPage() {
  const student = await requireAuth();
  const studentLevel = student.studentProfile.levelNumber || 1;
  const courses = await listCourses(student.accountId, studentLevel);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Page Hero Header: Compact & Sleek */}
      <div className="bg-gradient-to-l from-[#172554] to-blue-900 rounded-2xl p-4 sm:py-4.5 sm:px-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-[10px] sm:text-xs font-semibold mb-1.5 border border-blue-400/20">
            <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
            <span>{student.studentProfile.level} • {student.studentProfile.department}</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight mb-1">
            مكتبة المقررات الدراسية ({student.studentProfile.level})
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed line-clamp-2 sm:line-clamp-none">
            المقررات المعتمدة والمحاضرات وسلايدات الشرح الخاصة بطلاب {student.studentProfile.level}.
          </p>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Dynamic Search & Grid */}
      <CoursesCatalog 
        courses={courses} 
        studentLevel={studentLevel}
        studentLevelName={student.studentProfile.level}
      />
    </div>
  );
}
