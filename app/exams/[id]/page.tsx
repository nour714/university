import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { requireAuth } from '@/server/auth/requireAuth';
import { getPublicExamById } from '@/server/exams/service';
import { RAW_EXAMS_DATA } from '@/data/exams';
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

// Allow dynamic params access in Next.js 16
export const instant = false;

export function generateStaticParams() {
  return RAW_EXAMS_DATA.map((exam) => ({
    id: exam.id,
  }));
}

export async function generateMetadata({ params }: ExamDetailPageProps) {
  const { id } = await params;
  const exam = (await getPublicExamById(id)) || RAW_EXAMS_DATA.find((e) => e.id === id);
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

  const dbExam = await getPublicExamById(id, student.accountId);
  const exam = dbExam || RAW_EXAMS_DATA.find((e) => e.id === id);

  if (!exam) {
    notFound();
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

  let initialResult: GradeResult | undefined;
  if (currentStatus === 'completed' && exam.submission) {
    initialResult = {
      score: exam.submission.score,
      totalMarks: exam.submission.totalMarks,
      percentage: exam.submission.percentage,
      passed: exam.submission.passed,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 0,
      perQuestion: {},
    };
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
