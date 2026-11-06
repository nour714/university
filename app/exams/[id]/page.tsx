import { notFound } from 'next/navigation';
import { RAW_EXAMS_DATA } from '@/data/exams';
import { ExamContainer } from '@/components/exams/ExamContainer';

interface ExamDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
}

export function generateStaticParams() {
  return RAW_EXAMS_DATA.map((exam) => ({
    id: exam.id,
  }));
}

export async function generateMetadata({ params }: ExamDetailPageProps) {
  const { id } = await params;
  const exam = RAW_EXAMS_DATA.find((e) => e.id === id);
  if (!exam) return { title: 'الاختبار غير موجود | كلية الذكاء الاصطناعي' };

  return {
    title: `${exam.title} (${exam.courseCode}) | كلية الذكاء الاصطناعي`,
    description: exam.description,
  };
}

export default async function ExamDetailPage({ params, searchParams }: ExamDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const exam = RAW_EXAMS_DATA.find((e) => e.id === id);

  if (!exam) {
    notFound();
  }

  const initialView = resolvedSearchParams?.view === 'result' ? 'result' : undefined;

  return <ExamContainer exam={exam} initialView={initialView} />;
}
