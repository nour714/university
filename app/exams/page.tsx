import type { Metadata } from 'next';
import { listExams } from '@/server/exams/service';
import { requireAuth } from '@/server/auth/requireAuth';
import { ExamsDashboard } from '@/components/exams/ExamsDashboard';

export const metadata: Metadata = {
  title: 'الاختبارات والتقييمات الأكاديمية | كلية الذكاء الاصطناعي',
  description: 'منصة الاختبارات الإلكترونية والتقييمات الدورية - جداول الامتحانات، العد التنازلي، والنتائج الفورية لكلية الذكاء الاصطناعي.',
};

export default async function ExamsPage() {
  const student = await requireAuth();
  const dbExams = await listExams(student.accountId);

  return (
    <div className="animate-fadeIn">
      <ExamsDashboard initialExams={dbExams} />
    </div>
  );
}
