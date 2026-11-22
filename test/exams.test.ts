import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { 
  getPublicExamById, 
  startOrResumeExamSession, 
  getExamResult, 
  saveExamAnswers,
  getExamReview,
  getExamSubmissionReview
} from '@/server/exams/service';
import { submitAndGradeExam } from '@/server/exams/submit';
import { getExamStatus } from '@/lib/exams/status';
import { getGradeLabel } from '@/lib/exams/grade';
import { AppError } from '@/lib/errors';

describe('Exams Architecture & Grading Verification (Findings E1, E2)', () => {
  let clients: TestDbClients;
  const testStudentId = 'b0000000-0000-0000-0000-000000000001';
  const testCourseId = 'c0000000-0000-0000-0000-000000000001';
  const testExamId = 'e0000000-0000-0000-0000-000000000001';
  const testQ1Id = 'q0000000-0000-0000-0000-000000000001';
  const testQ2Id = 'q0000000-0000-0000-0000-000000000002';

  beforeAll(async () => {
    clients = await setupTestDatabase();

    // 1. Create account & profile
    await clients.ownerSql`
      INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
      VALUES (${testStudentId}, '30101010101022', '$argon2id$v=19$m=19456,t=2,p=1$fake$fake', true)
      ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Create course
    await clients.ownerSql`
      INSERT INTO public.academic_courses (id, code, title, description, doctor_name, credit_hours, level, department, semester)
      VALUES (${testCourseId}, 'AI101', 'مقدمة في الذكاء الاصطناعي', 'وصف المادة', 'د. محمد علي', 3, 1, 'الذكاء الاصطناعي', 'الفصل الأول')
      ON CONFLICT (id) DO NOTHING;
    `;

    // 3. Create exam (window active now)
    await clients.ownerSql`
      INSERT INTO public.academic_exams (
        id, course_id, title, description, type, duration_minutes, total_marks, passing_marks,
        start_date, end_date
      ) VALUES (
        ${testExamId}, ${testCourseId}, 'اختبار تجريبي منتصف الفصل', 'وصف الاختبار التجريبي',
        'midterm', 60, 20, 10,
        now() - interval '1 hour', now() + interval '2 hours'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // 4. Create 2 exam questions
    await clients.ownerSql`
      INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
      VALUES 
        (${testQ1Id}, ${testExamId}, 1, 'What is 2 + 2 in AI?', '[{"id":"opt-a","text":"4"},{"id":"opt-b","text":"5"}]'::jsonb, 10),
        (${testQ2Id}, ${testExamId}, 2, 'Is Python interpreted?', '[{"id":"opt-yes","text":"Yes"},{"id":"opt-no","text":"No"}]'::jsonb, 10)
      ON CONFLICT (id) DO NOTHING;
    `;

    // 5. Insert private keys for questions in academic_private
    await clients.ownerSql`
      INSERT INTO academic_private.exam_keys (question_id, correct_option_id, explanation)
      VALUES 
        (${testQ1Id}, 'opt-a', '2+2 is 4'),
        (${testQ2Id}, 'opt-yes', 'Python is interpreted')
      ON CONFLICT (question_id) DO NOTHING;
    `;
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Pre-reading Prevention (Finding E1)', () => {
    it('getPublicExamById must strip all question texts and options', async () => {
      const publicExam = await getPublicExamById(testExamId, testStudentId);
      expect(publicExam).not.toBeNull();
      expect(publicExam?.questions).toEqual([]);
      expect(publicExam?.questionsCount).toBe(2);
      expect(publicExam?.isEnrolled).toBe(false);
    });

    it('startOrResumeExamSession must reject non-enrolled students and return zero questions', async () => {
      const sessionRes = await startOrResumeExamSession(testExamId, testStudentId);
      expect(sessionRes.status).toBe('error');
      if (sessionRes.status === 'error') {
        expect(sessionRes.reason).toBe('not_enrolled');
      }
    });

    it('startOrResumeExamSession must succeed and return questions only after course enrollment', async () => {
      // Enroll student in testCourseId
      await clients.ownerSql`
        INSERT INTO public.academic_student_codes (
          student_id, course_id, code, receipt_number, semester, status
        ) VALUES (
          ${testStudentId}, ${testCourseId}, 'ENROLLED-TEST-CODE', 'REC-001', 'الفصل الأول', 'active'
        );
      `;

      const sessionRes = await startOrResumeExamSession(testExamId, testStudentId);
      expect(sessionRes.status).toBe('active');
      if (sessionRes.status === 'active') {
        expect(sessionRes.questions).toHaveLength(2);
        expect(sessionRes.questions[0].questionText).toBe('What is 2 + 2 in AI?');
        expect(sessionRes.endAt).toBeGreaterThan(Date.now());
      }
    });
  });

  describe('Submit Sanitization & Fail-Closed Grading (Finding E2)', () => {
    it('must fail closed with AppError if an answer key is missing from academic_private.exam_keys', async () => {
      // Add a third question without inserting its private answer key
      const incompleteQId = 'q0000000-0000-0000-0000-000000000003';
      await clients.ownerSql`
        INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
        VALUES (${incompleteQId}, ${testExamId}, 3, 'Missing key question', '[{"id":"opt-1","text":"1"}]'::jsonb, 5)
        ON CONFLICT (id) DO NOTHING;
      `;

      let errorCaught: any = null;
      try {
        await submitAndGradeExam(testExamId, testStudentId, { [testQ1Id]: 'opt-a' });
      } catch (err: any) {
        errorCaught = err;
      }

      expect(errorCaught).toBeInstanceOf(AppError);
      expect(errorCaught?.code).toBe('exam_not_configured');

      // Cleanup third question
      await clients.ownerSql`DELETE FROM public.academic_exam_questions WHERE id = ${incompleteQId}`;
    });

    it('must grade accurately, sanitize options, and persist answers and per_question JSONB', async () => {
      const answers = {
        [testQ1Id]: 'opt-a', // correct
        [testQ2Id]: 'opt-no', // wrong
        'fake-question-id': 'hacked-option', // invalid: must be dropped
      };

      const result = await submitAndGradeExam(testExamId, testStudentId, answers);

      expect(result.score).toBe(10); // 1 correct (10 pts)
      expect(result.totalMarks).toBe(20);
      expect(result.percentage).toBe(50);
      expect(result.correctCount).toBe(1);
      expect(result.wrongCount).toBe(1);
      expect(result.unansweredCount).toBe(0);

      // Verify DB persistence of answers and per_question in academic_exam_submissions
      const [submission] = await clients.ownerSql`
        SELECT score, answers, per_question, auto_submitted
        FROM public.academic_exam_submissions
        WHERE student_id = ${testStudentId} AND exam_id = ${testExamId}
      `;

      expect(submission).toBeDefined();
      expect(Number(submission.score)).toBe(10);
      expect(typeof submission.answers).toBe('object');
      expect(typeof submission.per_question).toBe('object');
      const savedAnswers = submission.answers;
      const savedPerQuestion = submission.per_question;
      expect(savedAnswers[testQ1Id]).toBe('opt-a');
      expect(savedAnswers[testQ2Id]).toBe('opt-no');
      expect(savedAnswers['fake-question-id']).toBeUndefined();
      expect(savedPerQuestion[testQ1Id].isCorrect ?? savedPerQuestion[testQ1Id]).toBe(true);
      expect(savedPerQuestion[testQ2Id].isCorrect ?? savedPerQuestion[testQ2Id]).toBe(false);
    });

    it('subsequent submission calls must be idempotent and return existing results', async () => {
      const result2 = await submitAndGradeExam(testExamId, testStudentId, {
        [testQ1Id]: 'opt-b', // Attempt to re-grade with different answer
      });

      // Still returns 10 pts from original submission
      expect(result2.score).toBe(10);
      expect(result2.correctCount).toBe(1);
    });

    it('6.3(a) draft save rejects unknown question keys and invalid option ids', async () => {
      const testStudent2 = '00000000-0000-0000-0000-000000000092';
      await clients.ownerSql`
        INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
        VALUES (${testStudent2}, '30101010109292', 'hash', true)
        ON CONFLICT (id) DO NOTHING;
      `;

      await clients.ownerSql`
        INSERT INTO public.academic_exam_sessions (id, student_id, exam_id, end_at, answers)
        VALUES (
          '00000000-0000-0000-0000-000000000092'::uuid,
          ${testStudent2},
          ${testExamId},
          now() + interval '30 minutes',
          '{}'::jsonb
        ) ON CONFLICT (student_id, exam_id) DO UPDATE SET answers = '{}'::jsonb, submitted = false;
      `;

      // Pass 1 valid answer + 1 unknown question id + 1 invalid option id
      const saveRes = await saveExamAnswers(testExamId, testStudent2, {
        [testQ1Id]: 'opt-a',
        'unknown-question-xyz': 'opt-a',
        [testQ2Id]: 'INVALID_OPTION_ID',
      });

      expect(saveRes.success).toBe(true);
      expect(saveRes.saved).toBe(1);
      expect(saveRes.dropped).toBe(2);

      const [session] = await clients.ownerSql`
        SELECT answers FROM public.academic_exam_sessions
        WHERE student_id = ${testStudent2} AND exam_id = ${testExamId}
      `;
      expect(session.answers).toEqual({ [testQ1Id]: 'opt-a' });
    });

    it('6.3(b) during exam window, getExamResult returns score but hides per-question breakdown', async () => {
      // Ensure exam window is open
      await clients.ownerSql`
        UPDATE public.academic_exams
           SET end_date = now() + interval '5 hours'
         WHERE id = ${testExamId}
      `;

      const result = await getExamResult(testExamId, testStudentId);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(10);
      expect(result?.perQuestion).toBeNull();
    });

    it('6.3(c) after exam window closes, getExamResult returns full per-question breakdown with explanations', async () => {
      // Close the exam window
      await clients.ownerSql`
        UPDATE public.academic_exams
           SET end_date = now() - interval '1 minute'
         WHERE id = ${testExamId}
      `;

      const result = await getExamResult(testExamId, testStudentId);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(10);
      expect(result?.perQuestion).not.toBeNull();
      const perQ = result!.perQuestion as Record<string, any>;
      expect(perQ[testQ1Id]).toBeDefined();
      expect(perQ[testQ1Id].selectedOptionId).toBe('opt-a');
      expect(perQ[testQ1Id].correctOptionId).toBe('opt-a');
      expect(perQ[testQ1Id].isCorrect).toBe(true);
      expect(perQ[testQ1Id].explanation).toBe('2+2 is 4');
    });

    it('6.3(d) student viewing an expired unsubmitted session gets auto-finalized lazily', async () => {
      const testStudent3 = '00000000-0000-0000-0000-000000000093';
      await clients.ownerSql`
        INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
        VALUES (${testStudent3}, '30101010109393', 'hash', true)
        ON CONFLICT (id) DO NOTHING;
      `;

      // Expired session without submission
      await clients.ownerSql`
        INSERT INTO public.academic_exam_sessions (id, student_id, exam_id, end_at, submitted, answers)
        VALUES (
          '00000000-0000-0000-0000-000000000093'::uuid,
          ${testStudent3},
          ${testExamId},
          now() - interval '10 minutes',
          false,
          ${clients.ownerSql.json({ [testQ1Id]: 'opt-a' })}
        ) ON CONFLICT (student_id, exam_id) DO UPDATE 
             SET end_at = now() - interval '10 minutes', submitted = false, answers = ${clients.ownerSql.json({ [testQ1Id]: 'opt-a' })};
      `;

      // Call getExamResult -> lazy finalization must occur
      const lazyResult = await getExamResult(testExamId, testStudent3);
      expect(lazyResult).not.toBeNull();
      expect(lazyResult?.score).toBe(10);
      expect(lazyResult?.autoSubmitted).toBe(true);

      // Verify DB submission exists
      const [sub] = await clients.ownerSql`
        SELECT score, auto_submitted FROM public.academic_exam_submissions
        WHERE student_id = ${testStudent3} AND exam_id = ${testExamId}
      `;
      expect(sub).toBeDefined();
      expect(sub.auto_submitted).toBe(true);
    });
  });

  describe('Exam Status & Tab Count Consistency', () => {
    it('past-due exams are never classified as upcoming and resolve to ended', () => {
      const pastExam = {
        startDate: '2026-10-01T09:00:00Z',
        endDate: '2026-10-01T11:00:00Z',
      };
      const now = new Date('2026-10-25T12:00:00Z').getTime();

      const status = getExamStatus(pastExam, now);
      expect(status).not.toBe('upcoming');
      expect(status).toBe('ended');
    });

    it('past-due exam with submission resolves to completed rather than ended or upcoming', () => {
      const pastExamWithSub = {
        startDate: '2026-10-01T09:00:00Z',
        endDate: '2026-10-01T11:00:00Z',
        submission: { score: 15, totalMarks: 20 },
      };
      const now = new Date('2026-10-25T12:00:00Z').getTime();

      const status = getExamStatus(pastExamWithSub, now);
      expect(status).toBe('completed');
    });

    it('tab counts strictly sum to total exams across mixed exam cohorts', () => {
      const now = new Date('2026-11-20T12:00:00Z').getTime();
      const mockExams = [
        // Live exam
        {
          startDate: '2026-11-20T10:00:00Z',
          endDate: '2026-11-20T14:00:00Z',
        },
        // Upcoming exam
        {
          startDate: '2026-11-25T09:00:00Z',
          endDate: '2026-11-25T11:00:00Z',
        },
        // Past exam (unsubmitted -> ended)
        {
          startDate: '2026-10-20T09:00:00Z',
          endDate: '2026-10-20T11:00:00Z',
        },
        // Past exam (submitted -> completed)
        {
          startDate: '2026-10-15T09:00:00Z',
          endDate: '2026-10-15T11:00:00Z',
          submission: { score: 18, totalMarks: 20 },
        },
        // Live exam (submitted -> completed)
        {
          startDate: '2026-11-20T10:00:00Z',
          endDate: '2026-11-20T14:00:00Z',
          submission: { score: 20, totalMarks: 20 },
        },
      ];

      const counts = {
        all: mockExams.length,
        live: mockExams.filter((e) => getExamStatus(e, now) === 'live').length,
        upcoming: mockExams.filter((e) => getExamStatus(e, now) === 'upcoming').length,
        completed: mockExams.filter((e) => getExamStatus(e, now) === 'completed').length,
        ended: mockExams.filter((e) => getExamStatus(e, now) === 'ended').length,
      };

      expect(counts.all).toBe(5);
      expect(counts.live).toBe(1);
      expect(counts.upcoming).toBe(1);
      expect(counts.completed).toBe(2);
      expect(counts.ended).toBe(1);

      // Verify strict sum equality
      const sumTabs = counts.live + counts.upcoming + counts.completed + counts.ended;
      expect(sumTabs).toBe(counts.all);
    });
  });

  describe('Secure Post-Deadline Exam Answer Review & Grade Scale Fix (Phase 8)', () => {
    it('8.1 Grade Scale: 15% resolves to راسب and boundary values map accurately', () => {
      // 15% bug fix verification: must resolve to راسب (not تقدير مقبول)
      const grade15 = getGradeLabel(15);
      expect(grade15.label).toBe('راسب');
      expect(grade15.colorClass).toBe('text-red-600');

      // 0%
      expect(getGradeLabel(0).label).toBe('راسب');
      expect(getGradeLabel(0).colorClass).toBe('text-red-600');

      // 49.9%
      expect(getGradeLabel(49.9).label).toBe('راسب');
      expect(getGradeLabel(49.9).colorClass).toBe('text-red-600');

      // 50% boundary: مقبول
      const grade50 = getGradeLabel(50);
      expect(grade50.label).toBe('تقدير مقبول');
      expect(grade50.colorClass).toBe('text-amber-600');

      // 64.9%
      expect(getGradeLabel(64.9).label).toBe('تقدير مقبول');

      // 65% boundary: جيد
      const grade65 = getGradeLabel(65);
      expect(grade65.label).toBe('تقدير جيد');
      expect(grade65.colorClass).toBe('text-sky-600');

      // 74.9%
      expect(getGradeLabel(74.9).label).toBe('تقدير جيد');

      // 75% boundary: جيد جداً
      const grade75 = getGradeLabel(75);
      expect(grade75.label).toBe('تقدير جيد جداً');
      expect(grade75.colorClass).toBe('text-teal-600');

      // 84.9%
      expect(getGradeLabel(84.9).label).toBe('تقدير جيد جداً');

      // 85% boundary: امتياز
      const grade85 = getGradeLabel(85);
      expect(grade85.label).toBe('تقدير امتياز');
      expect(grade85.colorClass).toBe('text-emerald-600');

      // 100%
      expect(getGradeLabel(100).label).toBe('تقدير امتياز');
      expect(getGradeLabel(100).colorClass).toBe('text-emerald-600');
    });

    it('8.2 Anti-Leak Before Deadline (now < endTime): questions + student answers ONLY, ZERO correct keys leaked', async () => {
      // Ensure exam end_date is in the future
      await clients.ownerSql`
        UPDATE public.academic_exams
           SET end_date = now() + interval '3 hours'
         WHERE id = ${testExamId};
      `;

      const review = await getExamReview(testExamId, testStudentId);
      expect(review).toBeDefined();
      expect(review.examId).toBe(testExamId);
      expect(review.canRevealCorrectAnswers).toBe(false);
      expect(review.questions).toHaveLength(2);

      // Verify questions contain only student submitted answers and metadata
      const q1 = review.questions.find((q) => q.id === testQ1Id);
      const q2 = review.questions.find((q) => q.id === testQ2Id);

      expect(q1?.selectedOptionId).toBe('opt-a');
      expect(q2?.selectedOptionId).toBe('opt-no');

      // Verify individual question objects strictly omit correctOption, correctAnswer, isCorrect, earnedPoints, explanation
      for (const q of review.questions) {
        expect('correctOption' in q).toBe(false);
        expect('correctOptionId' in q).toBe(false);
        expect('correctAnswer' in q).toBe(false);
        expect('isCorrect' in q).toBe(false);
        expect('earnedPoints' in q).toBe(false);
        expect('explanation' in q).toBe(false);
      }

      // CRITICAL: verify serialized JSON payload contains ZERO leaked answer keys or flags
      const serialized = JSON.stringify(review);
      expect(serialized).not.toContain('"correctOption"');
      expect(serialized).not.toContain('"correctOptionId"');
      expect(serialized).not.toContain('"correctAnswer"');
      expect(serialized).not.toContain('"isCorrect"');
      expect(serialized).not.toContain('"earnedPoints"');
      expect(serialized).not.toContain('"explanation"');
      expect(serialized).not.toContain('2+2 is 4'); // explanation leak check
    });

    it('8.3 Full Review After Deadline (now >= endTime): returns correctOption, isCorrect, and per-question points', async () => {
      // Set exam end_date in the past
      await clients.ownerSql`
        UPDATE public.academic_exams
           SET end_date = now() - interval '5 minutes'
         WHERE id = ${testExamId};
      `;

      const review = await getExamReview(testExamId, testStudentId);
      expect(review).toBeDefined();
      expect(review.canRevealCorrectAnswers).toBe(true);
      expect(review.questions).toHaveLength(2);

      const q1 = review.questions.find((q) => q.id === testQ1Id)!;
      const q2 = review.questions.find((q) => q.id === testQ2Id)!;

      // Question 1: student answered 'opt-a' (correct)
      expect(q1.selectedOptionId).toBe('opt-a');
      expect(q1.correctOptionId).toBe('opt-a');
      expect(q1.correctOption).toBe('opt-a');
      expect(q1.correctAnswer).toBe('opt-a');
      expect(q1.isCorrect).toBe(true);
      expect(q1.earnedPoints).toBe(10);
      expect(q1.maxPoints).toBe(10);
      expect(q1.explanation).toBe('2+2 is 4');

      // Question 2: student answered 'opt-no' (wrong, correct is 'opt-yes')
      expect(q2.selectedOptionId).toBe('opt-no');
      expect(q2.correctOptionId).toBe('opt-yes');
      expect(q2.correctOption).toBe('opt-yes');
      expect(q2.correctAnswer).toBe('opt-yes');
      expect(q2.isCorrect).toBe(false);
      expect(q2.earnedPoints).toBe(0);
      expect(q2.maxPoints).toBe(10);
    });

    it('8.4 Authorization Isolation: another student cannot view or fetch the review of a different submission', async () => {
      const otherStudentId = '00000000-0000-0000-0000-000000000092';

      // 1. Trying to fetch with targetStudentId mismatch throws 403 forbidden
      let targetMismatchErr: any = null;
      try {
        await getExamReview(testExamId, otherStudentId, testStudentId);
      } catch (err: any) {
        targetMismatchErr = err;
      }
      expect(targetMismatchErr).toBeInstanceOf(AppError);
      expect(targetMismatchErr?.code).toBe('forbidden');
      expect(targetMismatchErr?.statusCode).toBe(403);

      // 2. Student without submission fetching review throws 404 submission_not_found
      let noSubErr: any = null;
      try {
        await getExamReview(testExamId, otherStudentId);
      } catch (err: any) {
        noSubErr = err;
      }
      expect(noSubErr).toBeInstanceOf(AppError);
      expect(noSubErr?.code).toBe('submission_not_found');
      expect(noSubErr?.statusCode).toBe(404);

      // 3. Trying to access testStudentId submission by ID as otherStudentId throws 403 forbidden
      const [submission] = await clients.ownerSql`
        SELECT id FROM public.academic_exam_submissions
        WHERE student_id = ${testStudentId} AND exam_id = ${testExamId}
      `;
      expect(submission).toBeDefined();

      let subAccessErr: any = null;
      try {
        await getExamSubmissionReview(submission.id, otherStudentId);
      } catch (err: any) {
        subAccessErr = err;
      }
      expect(subAccessErr).toBeInstanceOf(AppError);
      expect(subAccessErr?.code).toBe('forbidden');
      expect(subAccessErr?.statusCode).toBe(403);

      // 4. Non-existent exam throws 404 exam_not_found
      let nonExistentExamErr: any = null;
      try {
        await getExamReview('non-existent-exam-id', testStudentId);
      } catch (err: any) {
        nonExistentExamErr = err;
      }
      expect(nonExistentExamErr).toBeInstanceOf(AppError);
      expect(nonExistentExamErr?.code).toBe('exam_not_found');
      expect(nonExistentExamErr?.statusCode).toBe(404);
    });
  });
});
