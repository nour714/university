import type { Metadata } from 'next';
import { RAW_EXAMS_DATA } from '@/data/exams';
import { ExamsDashboard } from '@/components/exams/ExamsDashboard';

export const metadata: Metadata = {
  title: 'الاختبارات والتقييمات الأكاديمية | كلية الذكاء الاصطناعي',
  description: 'منصة الاختبارات الإلكترونية والتقييمات الدورية - جداول الامتحانات، العد التنازلي، والنتائج الفورية لكلية الذكاء الاصطناعي.',
};

export default function ExamsPage() {
  return (
    <div className="animate-fadeIn">
      <ExamsDashboard initialExams={RAW_EXAMS_DATA} />
    </div>
  );
}
