import crypto from 'node:crypto';
import postgres from 'postgres';
import { hash } from '@node-rs/argon2';
import { COURSES_DATA } from '../data/courses';
import { RAW_EXAMS_DATA } from '../data/exams';
import { INITIAL_STUDENT_CODES, DEMO_REDEEMABLE_CODES } from '../data/codes';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';
import { CURRENT_STUDENT } from '../data/student';

// Raw keys dictionary without server-only guard for seeding script
const SEED_EXAM_KEYS: Record<string, Record<string, { correctOptionId: string; explanation: string }>> = {
  'exam-ai301-midterm': {
    q1: { correctOptionId: 'opt1_c', explanation: 'L2 regularization adds a penalty proportional to the sum of squared weights, penalizing large weights and preventing overfitting while retaining all features.' },
    q2: { correctOptionId: 'opt2_a', explanation: 'ReLU has a constant derivative of 1 for positive inputs, preventing gradient saturation and decay across deep layers unlike Sigmoid whose derivatives saturate near zero.' },
    q3: { correctOptionId: 'opt3_d', explanation: 'The kernel trick evaluates the inner product between mapped vectors directly using a kernel function, bypassing the costly explicit transformation to higher dimensions.' },
    q4: { correctOptionId: 'opt4_b', explanation: 'In highly imbalanced datasets, raw accuracy is deceptive because predicting only the majority class produces high accuracy. Recall measures sensitivity to critical positive instances.' },
    q5: { correctOptionId: 'opt5_c', explanation: 'Bagging trains diverse parallel learners on bootstrap subsets to lower variance, while Boosting trains sequentially by weighting difficult instances from previous learners.' },
    q6: { correctOptionId: 'opt6_b', explanation: 'Mini-batch SGD combines the smooth gradient estimates of full-batch training with the fast parallel matrix multiplication capabilities of modern GPUs and frequent weight updates.' },
  },
  'exam-ai305-quiz': {
    q_dl_1: { correctOptionId: 'b', explanation: 'Convolutional filters slide across the image sharing weights, preserving local spatial hierarchies with far fewer parameters than full dense connections.' },
    q_dl_2: { correctOptionId: 'a', explanation: 'MaxPooling downsamples feature maps by taking the maximum activation in each window, providing translational invariance and reducing computational load.' },
    q_dl_3: { correctOptionId: 'd', explanation: 'Transformers discard recurrence in favor of multi-head self-attention to process tokens in parallel, relying on positional encodings to inject sequential order.' },
    q_dl_4: { correctOptionId: 'c', explanation: 'Gradient clipping caps gradient norms to a maximum threshold, preventing numerical overflow and erratic weight updates in deep sequential unrolling.' },
    q_dl_5: { correctOptionId: 'b', explanation: 'Dropout sets random neuron activations to zero during training, breaking complex co-adaptations and behaving like an ensemble of sub-networks.' },
  },
  'exam-ai302-final': {
    nlp_1: { correctOptionId: 'c', explanation: 'Continuous Bag-of-Words (CBOW) predicts the center word from surrounding context, while Skip-gram learns by predicting surrounding context words given the center word.' },
    nlp_2: { correctOptionId: 'd', explanation: 'Standard bidirectional conditioning would allow each word to see itself in multi-layer context. Masking random tokens forces the model to reconstruct them based on surrounding context.' },
  },
  'exam-cs204-practical': {
    cv_q1: { correctOptionId: 'opt_b', explanation: 'Canny edge detection begins by convolving the image with a Gaussian smoothing filter to suppress high-frequency noise prior to gradient estimation.' },
    cv_q2: { correctOptionId: 'opt_a', explanation: 'Historically, OpenCV standardizes on BGR channel sequence for raster images rather than the web-standard RGB.' },
  },
};

const appUrl = process.env.DATABASE_URL_APP || 'postgresql://academic_app.uflrcaljquzfqyjkjunl:f062b6e27ef4e55a2581a4b4e1dd25c90b7064f0d8e765a0@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require';
const graderUrl = process.env.DATABASE_URL_GRADER || 'postgresql://academic_grader.uflrcaljquzfqyjkjunl:c36cee0c7a92db6ca75a47faad1d43799681e15c10e4ad56@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require';
const PEPPER = process.env.CODE_PEPPER || '82ded8e8eb0619c7c16f040af35ad579ed3fcd7711fce3adae54d284d2e791fc';

const appSql = postgres(appUrl, { prepare: false, ssl: 'require' });
const graderSql = postgres(graderUrl, { prepare: false, ssl: 'require' });

async function seed() {
  console.log('--- Starting Database Seeding ---');

  // 1. Seed Courses
  console.log('Seeding courses...');
  for (const course of COURSES_DATA) {
    await appSql`
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
        await appSql`
          INSERT INTO public.academic_course_contents (
            id, course_id, title, description, type, format,
            size_label, duration, date_label, storage_key, external_url
          ) VALUES (
            ${item.id}, ${course.id}, ${item.title}, ${item.description || null},
            ${item.type}, ${item.format || 'PDF'}, ${item.size || ''},
            ${item.duration || null}, ${item.uploadedAt || ''}, ${item.url || null}, null
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
  }

  // Ensure extra courses needed by codes & exams exist
  const extraCourses = [
    { id: 'ai-303', code: 'AI-303', title: 'الرؤية الحاسوبية ومعالجة الصور', doctor: 'د. ريم سليمان', dept: 'الذكاء الاصطناعي' },
    { id: 'ai-305', code: 'AI-305', title: 'التعلم العميق والشبكات العصبية المتقدمة', doctor: 'د. طارق الحسين', dept: 'الذكاء الاصطناعي' },
    { id: 'ai-402', code: 'AI-402', title: 'التعلم المعزز والأنظمة الذكية', doctor: 'د. ريم سليمان', dept: 'الذكاء الاصطناعي' },
    { id: 'ai-403', code: 'AI-403', title: 'الأنظمة الذكية والروبوتات المتقدمة', doctor: 'أ.د. طارق الحصري', dept: 'الذكاء الاصطناعي' },
    { id: 'cs-204', code: 'CS-204', title: 'الرؤية الحاسوبية (مختبر تطبيقي)', doctor: 'د. محمود عبد الرحيم', dept: 'علوم الحاسب' },
  ];
  for (const ec of extraCourses) {
    await appSql`
      INSERT INTO public.academic_courses (
        id, code, title, doctor_name, department, description, semester
      ) VALUES (
        ${ec.id}, ${ec.code}, ${ec.title}, ${ec.doctor}, ${ec.dept}, 'مقرر دراسي تخصصي', 'الفصل الأول'
      ) ON CONFLICT (id) DO NOTHING;
    `;
  }

  // 2. Seed Student Account & Profile
  console.log('Seeding student account and profile...');
  const demoNationalId = '30209140102945';
  const demoPassword = 'Student@2026';
  const passwordHash = await hash(demoPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const [existingAccount] = await appSql`
    SELECT id FROM public.academic_accounts WHERE national_id = ${demoNationalId}
  `;

  let studentAccountId: string;
  if (!existingAccount) {
    const [newAcc] = await appSql`
      INSERT INTO public.academic_accounts (
        national_id, password_hash, must_change_password, is_active
      ) VALUES (
        ${demoNationalId}, ${passwordHash}, false, true
      ) RETURNING id;
    `;
    studentAccountId = newAcc.id;
  } else {
    studentAccountId = existingAccount.id;
    await appSql`
      UPDATE public.academic_accounts
         SET password_hash = ${passwordHash},
             must_change_password = false
       WHERE id = ${studentAccountId}
    `;
  }

  await appSql`
    INSERT INTO public.academic_profiles (
      id, full_name, email, student_code, department, level, current_gpa, max_gpa
    ) VALUES (
      ${studentAccountId}, ${CURRENT_STUDENT.fullName}, 'nour.ali@university.edu.eg',
      ${CURRENT_STUDENT.academicId}, ${CURRENT_STUDENT.department}, ${CURRENT_STUDENT.level},
      ${CURRENT_STUDENT.gpa}, ${CURRENT_STUDENT.maxGpa}
    ) ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      student_code = EXCLUDED.student_code,
      current_gpa = EXCLUDED.current_gpa;
  `;

  // 3. Seed Student Active Codes
  console.log('Seeding student enrolled codes...');
  for (const item of INITIAL_STUDENT_CODES) {
    await appSql`
      INSERT INTO public.academic_student_codes (
        student_id, course_id, code, receipt_number, semester, status
      ) VALUES (
        ${studentAccountId}, ${item.courseId}, ${item.code},
        ${item.receiptNumber}, ${item.semester}, 'active'
      ) ON CONFLICT (student_id, course_id) DO NOTHING;
    `;
  }

  // 4. Seed Redeemable Codes (Private Schema)
  console.log('Seeding redeemable codes with HMAC pepper...');
  for (const item of DEMO_REDEEMABLE_CODES) {
    const cleanCode = item.code.replace(/\s+/g, '').toUpperCase();
    const codeHash = crypto.createHmac('sha256', PEPPER).update(cleanCode).digest();
    const masked = item.code.slice(0, 4) + '-****-' + item.code.slice(-4);

    await appSql`
      INSERT INTO academic_private.redeemable_codes (
        code_hash, masked_code, course_id, receipt_number, semester
      ) VALUES (
        ${codeHash}, ${masked}, ${item.courseId},
        ${'REC-2026-' + Math.floor(1000 + Math.random() * 9000)},
        'الفصل الدراسي الأول 2026/2027'
      ) ON CONFLICT (code_hash) DO NOTHING;
    `;
  }

  // 5. Seed Notifications
  console.log('Seeding notifications...');
  for (const notif of INITIAL_NOTIFICATIONS) {
    const mappedType = notif.type === 'lecture' ? 'course' : notif.type === 'exam' ? 'exam' : 'system';
    await appSql`
      INSERT INTO public.academic_notifications (
        student_id, title, message, type, is_read, action_url, action_label
      ) VALUES (
        ${studentAccountId}, ${notif.title}, ${notif.message}, ${mappedType},
        ${notif.isRead}, ${notif.actionUrl || null}, 'عرض التفاصيل'
      ) ON CONFLICT DO NOTHING;
    `;
  }

  // 6. Seed Exams, Questions & Keys
  console.log('Seeding exams, questions and answer keys...');
  for (const exam of RAW_EXAMS_DATA) {
    const courseId = exam.id === 'exam-ai301-midterm' ? 'ai-301' :
                     exam.id === 'exam-ai305-quiz' ? 'ai-305' :
                     exam.id === 'exam-ai302-final' ? 'ai-302' : 'cs-204';

    await appSql`
      INSERT INTO public.academic_exams (
        id, course_id, title, duration_minutes, total_marks, passing_marks,
        start_date, end_date
      ) VALUES (
        ${exam.id}, ${courseId}, ${exam.title}, ${exam.durationMinutes},
        ${exam.totalMarks}, ${exam.passingMarks}, ${exam.startDate}, ${exam.endDate}
      ) ON CONFLICT (id) DO UPDATE SET
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date;
    `;

    // Insert questions
    for (const q of exam.questions) {
      await appSql`
        INSERT INTO public.academic_exam_questions (
          id, exam_id, number, question_text, code_snippet, options, points
        ) VALUES (
          ${q.id}, ${exam.id}, ${q.number}, ${q.questionText},
          ${q.codeSnippet || null}, ${JSON.stringify(q.options)}::jsonb, ${q.points}
        ) ON CONFLICT (id) DO UPDATE SET
          question_text = EXCLUDED.question_text,
          options = EXCLUDED.options;
      `;

      // Insert key into private schema via graderSql
      const keyData = SEED_EXAM_KEYS[exam.id]?.[q.id];
      if (keyData) {
        await graderSql`
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
  await appSql.end();
  await graderSql.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
