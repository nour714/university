import type { Metadata } from 'next';
import { listExams } from '@/server/exams/service';
import { requireAuth } from '@/server/auth/requireAuth';
import { RAW_EXAMS_DATA } from '@/data/exams';
import { ExamsDashboard } from '@/components/exams/ExamsDashboard';
import { Exam, ListExam } from '@/types/exam';

export const metadata: Metadata = {
  title: 'الاختبارات والتقييمات الأكاديمية | كلية الذكاء الاصطناعي',
  description: 'منصة الاختبارات الإلكترونية والتقييمات الدورية - جداول الامتحانات، العد التنازلي، والنتائج الفورية لكلية الذكاء الاصطناعي.',
};

function toListExam(exam: Exam): ListExam {
  const copy: Partial<Exam> = { ...exam };
  delete copy.questions;
  return copy as ListExam;
}

export default async function ExamsPage() {
  const student = await requireAuth();
  const dbExams = await listExams(student.accountId);
  const listExamsData = dbExams.length > 0 ? dbExams : RAW_EXAMS_DATA.map(toListExam);

  return (
    <div className="animate-fadeIn">
      <ExamsDashboard initialExams={listExamsData} />
    </div>
  );
}
