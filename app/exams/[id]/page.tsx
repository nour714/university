import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { requireAuth } from '@/server/auth/requireAuth';
import { getPublicExamById, getExamResult } from '@/server/exams/service';
import { ExamContainer } from '@/components/exams/ExamContainer';
import { getExamStatus } from '@/lib/exams/status';
import { GradeResult } from '@/types/exam';

interface ExamDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
}

export async function generateMetadata({ params }: ExamDetailPageProps) {
  const { id } = await params;
  const exam = await getPublicExamById(id);
  if (!exam) return { title: 'الاختبار غير موجود | كلية الذكاء الاصطناعي' };

  return {
    title: `${exam.title} (${exam.courseCode}) | كلية الذكاء الاصطناعي`,
    description: exam.description,
  };
}

export default async function ExamDetailPage({ params, searchParams }: ExamDetailPageProps) {
  const student = await requireAuth();
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const exam = await getPublicExamById(id, student.accountId);

  if (!exam) {
    notFound();
  }

  // Enforce enrollment check (Finding E1)
  if (!exam.isEnrolled) {
    redirect('/exams');
  }

  // Defer rendering until request time to read authoritative current time under Next.js 16 cacheComponents
  await connection();
  const currentStatus = getExamStatus(exam);

  // Direct access restrictions
  if (currentStatus === 'upcoming' || currentStatus === 'ended') {
    redirect('/exams');
  }

  // ?view=result is allowed ONLY for completed exams
  if (resolvedSearchParams?.view === 'result') {
    if (currentStatus !== 'completed') {
      if (currentStatus === 'live') {
        redirect(`/exams/${exam.id}`);
      }
      redirect('/exams');
    }
  }

  // Finding E2: fetch real stored submission metrics instead of hard-coded zeros
  let initialResult: GradeResult | undefined;
  if (currentStatus === 'completed' || exam.submission || resolvedSearchParams?.view === 'result') {
    const storedResult = await getExamResult(id, student.accountId);
    if (storedResult) {
      initialResult = storedResult;
    }
  }

  const initialView = currentStatus === 'completed' || resolvedSearchParams?.view === 'result' ? 'result' : 'session';

  return (
    <ExamContainer
      exam={exam}
      initialView={initialView}
      initialResult={initialResult}
    />
  );
}
