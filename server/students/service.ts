import 'server-only';
import { appSql } from '@/lib/db/app.server';
import { StudentProfile } from '@/data/student';

export async function getStudentProfile(accountId: string): Promise<StudentProfile | null> {
  const [profile] = await appSql`
    SELECT 
      p.id,
      p.full_name,
      p.email,
      p.student_code,
      p.department,
      p.level,
      p.current_gpa,
      p.max_gpa,
      p.avatar_url,
      (SELECT count(*) FROM public.academic_student_codes sc WHERE sc.student_id = p.id AND sc.status = 'active') AS courses_count
    FROM public.academic_profiles p
    WHERE p.id = ${accountId}
  `;

  if (!profile) return null;

  const gpa = Number(profile.current_gpa) || 3.84;
  let gpaRating = 'امتياز مع مرتبة الشرف';
  if (gpa < 2.0) gpaRating = 'مقبول';
  else if (gpa < 3.0) gpaRating = 'جيد';
  else if (gpa < 3.5) gpaRating = 'جيد جداً';

  return {
    id: profile.id,
    fullName: profile.full_name,
    academicId: profile.student_code,
    department: profile.department,
    faculty: 'كلية الذكاء الاصطناعي',
    level: profile.level,
    levelNumber: 3,
    gpa,
    maxGpa: Number(profile.max_gpa) || 4.0,
    gpaRating,
    registeredHours: 18,
    coursesCount: Number(profile.courses_count) || 6,
    academicYear: '2026/2027',
    semester: 'الفصل الدراسي الأول',
    status: 'منتظم',
  };
}
