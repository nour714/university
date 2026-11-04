// DEMO DATA ONLY — do not commit real student data or real access codes to this repository.

import { StudentCode } from '@/types/code';

export const INITIAL_STUDENT_CODES: StudentCode[] = [
  {
    id: 'code-1',
    code: 'AI26 - 8841 - K92X',
    courseCode: 'AI301',
    courseName: 'تعلم الآلة المتقدم (Machine Learning)',
    courseId: 'ai-301',
    doctorName: 'أ.د. طارق الحصري',
    receiptNumber: 'REC-2026-9041',
    activatedAt: '2026/10/01',
    semester: 'الفصل الدراسي الأول 2026/2027',
    status: 'active',
  },
  {
    id: 'code-2',
    code: 'DL26 - 3190 - M77Q',
    courseCode: 'AI302',
    courseName: 'التعلم العميق والشبكات العصبية',
    courseId: 'ai-302',
    doctorName: 'د. منى عبد الرحمن',
    receiptNumber: 'REC-2026-9182',
    activatedAt: '2026/10/05',
    semester: 'الفصل الدراسي الأول 2026/2027',
    status: 'active',
  },
  {
    id: 'code-3',
    code: 'CV26 - 7720 - P44W',
    courseCode: 'AI303',
    courseName: 'الرؤية الحاسوبية ومعالجة الصور',
    courseId: 'ai-303',
    doctorName: 'د. ريم سليمان',
    receiptNumber: 'REC-2026-9310',
    activatedAt: '2026/10/12',
    semester: 'الفصل الدراسي الأول 2026/2027',
    status: 'active',
  },
];

// Demo redeemable codes pool for easy testing
export const DEMO_REDEEMABLE_CODES = [
  {
    code: 'NLP2-9102-M33Z',
    courseCode: 'AI401',
    courseName: 'معالجة اللغات الطبيعية (NLP)',
    courseId: 'ai-401',
    doctorName: 'أ.د. حسام الدين شريف',
  },
  {
    code: 'RL26-4412-R71B',
    courseCode: 'AI402',
    courseName: 'التعلم المعزز والأنظمة الذكية',
    courseId: 'ai-402',
    doctorName: 'د. ريم سليمان',
  },
  {
    code: 'ROB2-6623-T88L',
    courseCode: 'AI403',
    courseName: 'الأنظمة الذكية والروبوتات المتقدمة',
    courseId: 'ai-403',
    doctorName: 'أ.د. طارق الحصري',
  },
];

