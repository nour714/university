import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { getStudentProfile } from '@/server/students/service';
import { listCourses, getCourseById } from '@/server/courses/service';
import { listExams, getPublicExamById } from '@/server/exams/service';
import { listStudentCodes } from '@/server/codes/service';
import { listNotificationsForStudent } from '@/server/notifications/service';

describe('Response Leak Scanner across Services & Server Endpoints', () => {
  let clients: TestDbClients;

  const testStudentId = '70000000-0000-0000-0000-000000000001';
  const testCourseId = 'c-leak-101';
  const testExamId = 'e-leak-101';
  const testQId = '80000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    clients = await setupTestDatabase();

    // 1. Account & Profile
    await clients.ownerSql`
      INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
      VALUES (${testStudentId}, '30101010107777', '$argon2id$v=19$m=19456,t=2,p=1$secretpasswordhash', true)
      ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_profiles (
        id, student_code, full_name, email, department, level, level_number
      ) VALUES (
        ${testStudentId}, '20267777', 'طالب الحماية من التسريب', 'leakproof@univ.edu.eg', 'الأمن السيبراني', 'المستوى الأول', 1
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Course & Content
    await clients.ownerSql`
      INSERT INTO public.academic_courses (
        id, code, title, description, doctor_name, credit_hours, level, department, semester
      ) VALUES (
        ${testCourseId}, 'LEAK101', 'مقرر فحص التسريبات', 'الوصف', 'د. مدحت', 3, 1, 'الأمن السيبراني', 'الفصل الأول'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_course_contents (
        id, course_id, title, description, type, format, size_label, storage_key
      ) VALUES (
        'cont-leak-01', ${testCourseId}, 'ملف سري خاص بالمقرر', 'وصف', 'file', 'PDF', '1 MB', 'secret/path/to/leak.pdf'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // 3. Exam & Question & Private Key
    await clients.ownerSql`
      INSERT INTO public.academic_exams (
        id, course_id, title, description, type, duration_minutes, total_marks, passing_marks,
        start_date, end_date
      ) VALUES (
        ${testExamId}, ${testCourseId}, 'امتحان فحص التسريب', 'وصف الامتحان', 'midterm', 60, 20, 10,
        now() - interval '1 hour', now() + interval '2 hours'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_exam_questions (id, exam_id, number, question_text, options, points)
      VALUES (${testQId}, ${testExamId}, 1, 'السؤال السري', '[{"id":"opt-leak-a","text":"Secret Option A"}]'::jsonb, 20)
      ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO academic_private.exam_keys (question_id, correct_option_id)
      VALUES (${testQId}, 'opt-leak-a')
      ON CONFLICT (question_id) DO NOTHING;
    `;

    // 4. Student enrolled code
    await clients.ownerSql`
      INSERT INTO public.academic_student_codes (
        student_id, course_id, code, receipt_number, semester, status
      ) VALUES (
        ${testStudentId}, ${testCourseId}, 'LEAK-****-2026', 'REC-LK-01', 'الفصل الأول', 'active'
      ) ON CONFLICT (student_id, course_id) DO NOTHING;
    `;

    // 5. Notification
    await clients.ownerSql`
      INSERT INTO public.academic_notifications (
        student_id, title, message, type
      ) VALUES (
        ${testStudentId}, 'إشعار فحص الأمان', 'تفاصيل الإشعار الأمني', 'security'
      ) ON CONFLICT (id) DO NOTHING;
    `;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  const FORBIDDEN_STRINGS = [
    'password_hash',
    'passwordHash',
    'secretpasswordhash',
    'token_hash',
    'tokenHash',
    'storage_key',
    'storageKey',
    'secret/path/to/leak.pdf',
    'postgres://',
    'academic_private',
    'exam_keys',
    'correct_option_id',
    'correctOptionId',
    'opt-leak-a', // Secret answer key option id
  ];

  function assertNoLeak(payload: any, label: string) {
    const jsonString = JSON.stringify(payload);
    for (const forbidden of FORBIDDEN_STRINGS) {
      if (jsonString.includes(forbidden)) {
        throw new Error(`Data leak detected in ${label}! Found forbidden string: "${forbidden}"`);
      }
    }
  }

  it('getStudentProfile does not leak password_hash or credentials', async () => {
    const profile = await getStudentProfile(testStudentId);
    expect(profile).toBeDefined();
    assertNoLeak(profile, 'getStudentProfile');
  });

  it('listCourses and getCourseById do not leak storage_key or private paths', async () => {
    const courses = await listCourses(testStudentId);
    assertNoLeak(courses, 'listCourses');

    const courseDetail = await getCourseById(testCourseId, testStudentId);
    expect(courseDetail).toBeDefined();
    assertNoLeak(courseDetail, 'getCourseById');
  });

  it('getPublicExamById and listExams do not leak question text, options, or answer keys', async () => {
    const exams = await listExams(testStudentId);
    assertNoLeak(exams, 'listExams');

    const exam = await getPublicExamById(testExamId);
    expect(exam).toBeDefined();
    expect(exam?.questions).toEqual([]);
    assertNoLeak(exam, 'getPublicExamById');
  });

  it('listStudentCodes does not leak sensitive private keys', async () => {
    const codes = await listStudentCodes(testStudentId);
    assertNoLeak(codes, 'listStudentCodes');
  });

  it('listNotificationsForStudent does not leak private table data', async () => {
    const notifs = await listNotificationsForStudent(testStudentId);
    assertNoLeak(notifs, 'listNotificationsForStudent');
  });
});
