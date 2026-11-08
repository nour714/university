import type { Metadata } from 'next';
import { requireAuth } from '@/server/auth/requireAuth';
import { StudentHero } from '@/components/home/StudentHero';
import { StudentStatsGrid } from '@/components/home/StudentStatsGrid';
import { QuickCoursesAction } from '@/components/home/QuickCoursesAction';

export const metadata: Metadata = {
  title: 'الرئيسية | لوحة تحكم الطالب - كلية الذكاء الاصطناعي',
  description: 'لوحة التحكم الأكاديمية للطالب - استعراض المعدل التراكمي، الساعات المسجلة، المستوى، وعدد المقرارات.',
};

export default async function HomePage() {
  const authStudent = await requireAuth();
  const profile = authStudent.studentProfile;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-4">
      {/* 1. Student Hero Profile Banner */}
      <StudentHero student={profile} />

      {/* 2. Four Bento KPI Stat Cards */}
      <StudentStatsGrid student={profile} />

      {/* 3. Quick Action Access Card to Courses Library */}
      <QuickCoursesAction coursesCount={profile.coursesCount} />
    </div>
  );
}
