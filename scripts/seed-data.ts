/**
 * Database Seeding Script
 * 
 * IMPORTANT: This script MUST be executed using an OWNER-level database URL
 * (DATABASE_URL_OWNER), as it manages schemas, tables, and inserts initial
 * administrative fixtures across both public and academic_private schemas.
 * 
 * It will refuse to run against any non-localhost host unless ALLOW_REMOTE_DB=1.
 */

import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';
import { z } from 'zod';
import { hash } from '@node-rs/argon2';
import { validateScriptDbUrl } from './env';
import { computeCodeHash, maskCode, normalizeCode } from '../lib/security/codeHash';

// Seed Fixtures
import { RAW_COURSES_DATA } from './data/courses';
import { RAW_EXAMS_DATA } from './data/exams';
import { DEMO_REDEEMABLE_CODES } from './data/codes';
import { INITIAL_NOTIFICATIONS } from './data/notifications';
import { DEMO_STUDENT, SEED_STUDENTS } from './data/student';

const ExamKeyEntrySchema = z.object({
  correctOptionId: z.string().min(1, 'correctOptionId is required'),
  explanation: z.string().default(''),
});

const ExamKeysFileSchema = z.record(
  z.string(),
  z.record(z.string(), ExamKeyEntrySchema)
);

export function loadAndValidateExamKeys(keysFilePath: string): Record<string, Record<string, { correctOptionId: string; explanation: string }>> {
  let rawJson: unknown;
  try {
    const content = fs.readFileSync(keysFilePath, 'utf-8');
    rawJson = JSON.parse(content);
  } catch (err) {
    throw new Error(`[SEED] Failed to parse JSON from ${keysFilePath}: ${err instanceof Error ? err.message : String(err)}`);
  }

  const parseResult = ExamKeysFileSchema.safeParse(rawJson);
  if (!parseResult.success) {
    throw new Error(`[SEED] Invalid exam keys schema in ${keysFilePath}: ${parseResult.error.message}`);
  }

  const examKeysMap = parseResult.data;

  // Build lookup maps from RAW_EXAMS_DATA to validate referential integrity
  const examMap = new Map<string, typeof RAW_EXAMS_DATA[0]>();
  for (const e of RAW_EXAMS_DATA) {
    examMap.set(e.id, e);
  }

  for (const [examId, questionsObj] of Object.entries(examKeysMap)) {
    const exam = examMap.get(examId);
    if (!exam) {
      throw new Error(`[SEED] Exam keys file references unknown examId: "${examId}"`);
    }

    const questionMap = new Map<string, typeof exam.questions[0]>();
    for (const q of exam.questions) {
      questionMap.set(q.id, q);
    }

    for (const [qId, keyEntry] of Object.entries(questionsObj)) {
      const question = questionMap.get(qId);
      if (!question) {
        throw new Error(`[SEED] Exam "${examId}" references unknown questionId: "${qId}"`);
      }

      if (!Array.isArray(question.options)) {
        throw new Error(`[SEED] Question "${qId}" in exam "${examId}" must have options array`);
      }

      const validOptionIds = question.options.map((o) => o.id);
      if (!validOptionIds.includes(keyEntry.correctOptionId)) {
        throw new Error(
          `[SEED] Question "${qId}" in exam "${examId}" has invalid correctOptionId "${keyEntry.correctOptionId}". Valid option IDs are: [${validOptionIds.join(', ')}]`
        );
      }
    }
  }

  return examKeysMap;
}

async function seed(customOwnerUrl?: string) {
  console.log('--- Starting Database Seeding (Owner Role) ---');

  const ownerUrl = customOwnerUrl || process.env.DATABASE_URL_OWNER;
  if (!ownerUrl) {
    console.error('[ERROR] DATABASE_URL_OWNER environment variable is required for seeding.');
    process.exit(1);
  }

  validateScriptDbUrl('DATABASE_URL_OWNER', ownerUrl);

  const pepper = process.env.CODE_PEPPER;
  if (!pepper || pepper.length < 32) {
    console.error('[ERROR] CODE_PEPPER environment variable (>= 32 chars) is required.');
    process.exit(1);
  }

  // Read answer keys from git-ignored private keys file if present, fallback to example
  let examKeysMap: Record<string, Record<string, { correctOptionId: string; explanation: string }>> = {};
  const privateKeysPath = path.join(process.cwd(), 'seed', 'private', 'exam-keys.json');
  const exampleKeysPath = path.join(process.cwd(), 'seed', 'exam-keys.example.json');

  const keysPath = fs.existsSync(privateKeysPath)
    ? privateKeysPath
    : fs.existsSync(exampleKeysPath)
    ? exampleKeysPath
    : null;

  if (keysPath) {
    console.log(`[SEED] Loading and validating exam answer keys from ${keysPath}...`);
    examKeysMap = loadAndValidateExamKeys(keysPath);
    console.log('[SEED] Validated exam answer keys successfully.');
  } else {
    console.log('[SEED] No exam keys file found. Placeholder exam keys will be omitted.');
  }

  const sql = postgres(ownerUrl, {
    prepare: false,
    ssl: process.env.DB_SSL === 'require' ? 'require' : false,
  });

  try {
    // 1. Seed Courses & Contents
    console.log('[SEED] Seeding courses...');
    for (const course of RAW_COURSES_DATA) {
      await sql`
        INSERT INTO public.academic_courses (
          id, code, title, english_title, doctor_name, doctor_title, doctor_avatar,
          credit_hours, level, department, description, semester, icon_name, thumbnail_color
        ) VALUES (
          ${course.id}, ${course.code}, ${course.title}, ${course.englishTitle || null},
          ${course.doctorName}, ${course.doctorTitle || null}, ${course.doctorAvatar || null},
          ${course.creditHours || 3}, ${course.level || 1}, ${course.department},
          ${course.description}, ${course.semester}, ${course.iconName || 'BookOpen'},
          ${course.thumbnailColor || 'from-blue-600 to-indigo-700'}
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          doctor_name = EXCLUDED.doctor_name,
          description = EXCLUDED.description;
      `;

      // Seed course content items
      if (course.content && course.content.length > 0) {
        for (const item of course.content) {
          const isLink = item.type === 'link';
          const externalUrl = isLink && item.url?.startsWith('https://') ? item.url : null;
          const storageKey = !isLink ? `courses/${item.id}.${(item.format || 'pdf').toLowerCase()}` : null;

          await sql`
            INSERT INTO public.academic_course_contents (
              id, course_id, title, description, type, format,
              size_label, duration, date_label, storage_key, external_url
            ) VALUES (
              ${item.id}, ${course.id}, ${item.title}, ${item.description || null},
              ${item.type}, ${item.format || 'PDF'}, ${item.size || ''},
              ${item.duration || null}, ${item.uploadedAt || ''}, ${storageKey}, ${externalUrl}
            ) ON CONFLICT (id) DO UPDATE SET
              storage_key = EXCLUDED.storage_key,
              external_url = EXCLUDED.external_url;
          `;
        }
      }
    }

    // Ensure extra courses referenced by exams/codes exist
    const extraCourses = [
      { id: 'ai-303', code: 'AI-303', title: 'الرؤية الحاسوبية ومعالجة الصور', doctor: 'د. ريم سليمان', dept: 'الذكاء الاصطناعي' },
      { id: 'ai-305', code: 'AI-305', title: 'التعلم العميق والشبكات العصبية المتقدمة', doctor: 'د. طارق الحسين', dept: 'الذكاء الاصطناعي' },
      { id: 'ai-402', code: 'AI-402', title: 'التعلم المعزز والأنظمة الذكية', doctor: 'د. ريم سليمان', dept: 'الذكاء الاصطناعي' },
      { id: 'ai-403', code: 'AI-403', title: 'الأنظمة الذكية والروبوتات المتقدمة', doctor: 'أ.د. طارق الحصري', dept: 'الذكاء الاصطناعي' },
      { id: 'cs-204', code: 'CS-204', title: 'الرؤية الحاسوبية (مختبر تطبيقي)', doctor: 'د. محمود عبد الرحيم', dept: 'علوم الحاسب' },
    ];
    for (const ec of extraCourses) {
      await sql`
        INSERT INTO public.academic_courses (
          id, code, title, doctor_name, department, description, semester
        ) VALUES (
          ${ec.id}, ${ec.code}, ${ec.title}, ${ec.doctor}, ${ec.dept}, 'مقرر دراسي تخصصي', 'الفصل الأول'
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 2. Student Accounts (Conditional, Non-Production only, must_change_password = true)
    const isProd = process.env.NODE_ENV === 'production';
    const defaultSeedPassword = process.env.SEED_DEMO_PASSWORD || 'Student@2026';

    if (!isProd && defaultSeedPassword) {
      console.log(`[SEED] Seeding ${SEED_STUDENTS.length} student accounts with must_change_password=true...`);
      const passwordHash = await hash(defaultSeedPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      for (const student of SEED_STUDENTS) {
        const [acc] = await sql`
          INSERT INTO public.academic_accounts (
            national_id, password_hash, must_change_password, is_active
          ) VALUES (
            ${student.nationalId}, ${passwordHash}, true, true
          ) ON CONFLICT (national_id) DO UPDATE SET
            password_hash = EXCLUDED.password_hash,
            must_change_password = true,
            is_active = true
          RETURNING id;
        `;
        const studentAccountId = acc.id;

        await sql`
          INSERT INTO public.academic_profiles (
            id, full_name, email, student_code, department, level, current_gpa, max_gpa,
            faculty, level_number, registered_hours, academic_year, semester
          ) VALUES (
            ${studentAccountId}, ${student.fullName}, ${student.email},
            ${student.academicId}, ${student.department}, ${student.level},
            ${student.gpa}, ${student.maxGpa},
            ${student.faculty}, ${student.levelNumber}, ${student.registeredHours},
            ${student.academicYear}, ${student.semester}
          ) ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            student_code = EXCLUDED.student_code,
            department = EXCLUDED.department,
            level = EXCLUDED.level,
            current_gpa = EXCLUDED.current_gpa,
            max_gpa = EXCLUDED.max_gpa,
            faculty = EXCLUDED.faculty,
            level_number = EXCLUDED.level_number,
            registered_hours = EXCLUDED.registered_hours,
            academic_year = EXCLUDED.academic_year,
            semester = EXCLUDED.semester;
        `;

        if (student.enrollDefaultCourses) {
          // Enroll in default courses
          for (const courseId of ['ai-301', 'ai-305']) {
            await sql`
              INSERT INTO public.academic_student_codes (
                student_id, course_id, code, receipt_number, semester, status
              ) VALUES (
                ${studentAccountId}, ${courseId}, ${'CODE-' + courseId.toUpperCase() + '-DEMO'},
                'REC-DEMO-2026', 'الفصل الدراسي الأول', 'active'
              ) ON CONFLICT (student_id, course_id) DO NOTHING;
            `;
          }

          // Seed initial notifications for demo student idempotently
          for (const notif of INITIAL_NOTIFICATIONS) {
            await sql`
              INSERT INTO public.academic_notifications (
                student_id, title, message, type, is_read, action_url, action_label
              )
              SELECT
                ${studentAccountId}, ${notif.title}, ${notif.message}, ${notif.type},
                ${notif.isRead}, ${notif.actionUrl || null}, 'عرض التفاصيل'
              WHERE NOT EXISTS (
                SELECT 1 FROM public.academic_notifications
                WHERE student_id = ${studentAccountId} AND title = ${notif.title}
              );
            `;
          }
        } else {
          // Clean accounts: seed initial welcome notification prompting them to redeem codes
          const welcomeTitle = 'مرحباً بك في بوابة المقررات الأكاديمية';
          const welcomeMessage = 'تم تفعيل حسابك الجامعي بنجاح. يرجى التوجه إلى صفحة شحن الأكواد لتفعيل مقررات الفصل الدراسي الحالي.';
          await sql`
            INSERT INTO public.academic_notifications (
              student_id, title, message, type, is_read, action_url, action_label
            )
            SELECT
              ${studentAccountId}, ${welcomeTitle}, ${welcomeMessage}, 'system',
              false, '/codes', 'تفعيل المقررات'
            WHERE NOT EXISTS (
              SELECT 1 FROM public.academic_notifications
              WHERE student_id = ${studentAccountId} AND title = ${welcomeTitle}
            );
          `;
        }
      }
    } else {
      console.log('[SEED] Skipping student accounts (production mode or SEED_DEMO_PASSWORD not provided).');
    }

    // 3. Seed Redeemable Codes (Hashed with CODE_PEPPER)
    console.log('[SEED] Seeding redeemable codes with HMAC pepper...');
    for (const item of DEMO_REDEEMABLE_CODES) {
      const normalized = normalizeCode(item.code);
      const codeHash = computeCodeHash(normalized, pepper);
      const masked = maskCode(normalized);

      await sql`
        INSERT INTO academic_private.redeemable_codes (
          code_hash, masked_code, course_id, receipt_number, semester, is_redeemed
        ) VALUES (
          ${codeHash}, ${masked}, ${item.courseId},
          ${'REC-2026-' + Math.floor(1000 + Math.random() * 9000)},
          'الفصل الدراسي الأول 2026/2027', false
        ) ON CONFLICT (code_hash) DO NOTHING;
      `;
    }

    // 4. Seed Exams & Questions & Keys
    console.log('[SEED] Seeding exams, questions and keys...');
    for (const exam of RAW_EXAMS_DATA) {
      const courseId = exam.id === 'exam-ai301-midterm' ? 'ai-301' :
                       exam.id === 'exam-ai305-quiz' ? 'ai-305' :
                       exam.id === 'exam-ai302-final' ? 'ai-302' : 'cs-204';

      await sql`
        INSERT INTO public.academic_exams (
          id, course_id, title, duration_minutes, total_marks, passing_marks,
          start_date, end_date, type, description, instructions
        ) VALUES (
          ${exam.id}, ${courseId}, ${exam.title}, ${exam.durationMinutes},
          ${exam.totalMarks}, ${exam.passingMarks}, ${exam.startDate}, ${exam.endDate},
          ${exam.type || 'midterm'}, ${exam.description || ''}, ${exam.instructions}
        ) ON CONFLICT (id) DO UPDATE SET
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          type = EXCLUDED.type,
          description = EXCLUDED.description,
          instructions = EXCLUDED.instructions;
      `;

      for (const q of exam.questions) {
        if (!Array.isArray(q.options)) {
          throw new Error(`[SEED] Question ${q.id} in exam ${exam.id} must have options as an array`);
        }
        await sql`
          INSERT INTO public.academic_exam_questions (
            id, exam_id, number, question_text, code_snippet, options, points
          ) VALUES (
            ${q.id}, ${exam.id}, ${q.number}, ${q.questionText},
            ${q.codeSnippet || null}, ${sql.json(q.options)}, ${q.points}
          ) ON CONFLICT (id) DO UPDATE SET
            question_text = EXCLUDED.question_text,
            options = EXCLUDED.options;
        `;

        // Insert key into academic_private.exam_keys if present in examKeysMap
        const keyData = examKeysMap[exam.id]?.[q.id];
        if (keyData) {
          await sql`
            INSERT INTO academic_private.exam_keys (
              question_id, correct_option_id, explanation
            ) VALUES (
              ${q.id}, ${keyData.correctOptionId}, ${keyData.explanation}
            ) ON CONFLICT (question_id) DO UPDATE SET
              correct_option_id = EXCLUDED.correct_option_id,
              explanation = EXCLUDED.explanation;
          `;
        }
      }
    }

    console.log('--- Database Seeding Completed Successfully! ---');
  } finally {
    await sql.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed-data.ts')) {
  seed().catch((err) => {
    console.error('[SEED ERROR]', err);
    process.exit(1);
  });
}

export { seed };
