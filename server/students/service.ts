import 'server-only';
import { appSql } from '@/lib/db/app.server';
import { StudentProfile } from '@/types/student';

export async function getStudentProfile(accountId: string): Promise<StudentProfile | null> {
  const [profile] = await appSql`
    SELECT 
      p.id,
      p.full_name,
      p.email,
      p.student_code,
      p.department,
      p.level,
      p.faculty,
      p.level_number,
      p.registered_hours,
      p.academic_year,
      p.semester,
      p.current_gpa,
      p.max_gpa,
      p.avatar_url,
      (SELECT count(*) FROM public.academic_student_codes sc WHERE sc.student_id = p.id AND sc.status = 'active') AS courses_count
    FROM public.academic_profiles p
    WHERE p.id = ${accountId}
  `;

  if (!profile) return null;

  const gpa = profile.current_gpa !== null && profile.current_gpa !== undefined && profile.current_gpa !== ''
    ? Number(profile.current_gpa)
    : null;

  let gpaRating = 'قيد الرصد';
  if (gpa !== null) {
    if (gpa < 2.0) gpaRating = 'مقبول';
    else if (gpa < 3.0) gpaRating = 'جيد';
    else if (gpa < 3.5) gpaRating = 'جيد جداً';
    else gpaRating = 'امتياز مع مرتبة الشرف';
  }

  return {
    id: profile.id,
    fullName: profile.full_name,
    academicId: profile.student_code,
    department: profile.department,
    faculty: profile.faculty || 'كلية الذكاء الاصطناعي',
    level: profile.level || 'المستوى الأول',
    levelNumber: profile.level_number || 1,
    gpa,
    maxGpa: Number(profile.max_gpa) || 4.0,
    gpaRating,
    registeredHours: profile.registered_hours || 0,
    coursesCount: Number(profile.courses_count) || 0,
    academicYear: profile.academic_year || '2026/2027',
    semester: profile.semester || 'الفصل الدراسي الأول',
    status: 'منتظم',
    avatarUrl: profile.avatar_url || null,
  };
}
