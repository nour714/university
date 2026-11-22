import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from '@/server/auth/cookies';
import { validateSession } from '@/server/auth/session';
import { getExamReview, getExamSubmissionReview } from '@/server/exams/service';
import { AppError } from '@/lib/errors';

export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getSessionCookie();
  if (!token) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول.' }, { status: 401 });
  }

  const session = await validateSession(token);
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح لك بالوصول.' }, { status: 401 });
  }

  const { id: examId } = await params;
  const url = new URL(req.url);
  const targetStudentId = url.searchParams.get('studentId') || undefined;
  const submissionId = url.searchParams.get('submissionId') || undefined;

  try {
    if (submissionId) {
      const review = await getExamSubmissionReview(submissionId, session.accountId);
      return NextResponse.json(
        { review },
        {
          headers: {
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    const review = await getExamReview(examId, session.accountId, targetStudentId);
    return NextResponse.json(
      { review },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.safeMessage, code: err.code },
        { status: err.statusCode || 400 }
      );
    }
    return NextResponse.json(
      { error: 'حدث خطأ في استرجاع مراجعة الاختبار.' },
      { status: 500 }
    );
  }
}
