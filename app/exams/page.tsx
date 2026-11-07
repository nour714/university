import type { Metadata } from 'next';
import { RAW_EXAMS_DATA } from '@/data/exams';
import { ExamsDashboard } from '@/components/exams/ExamsDashboard';
import { Exam, ListExam } from '@/types/exam';

export const metadata: Metadata = {
  title: 'الاختبارات والتقييمات الأكاديمية | كلية الذكاء الاصطناعي',
  description: 'منصة الاختبارات الإلكترونية والتقييمات الدورية - جداول الامتحانات، العد التنازلي، والنتائج الفورية لكلية الذكاء الاصطناعي.',
};

function toListExam(exam: Exam): ListExam {
  const { questions: _unused, ...rest } = exam;
  return rest;
}

export default function ExamsPage() {
  const listExams = RAW_EXAMS_DATA.map(toListExam);

  return (
    <div className="animate-fadeIn">
      <ExamsDashboard initialExams={listExams} />
    </div>
  );
}
