export interface DemoRedeemableCode {
  code: string;
  courseCode: string;
  courseName: string;
  courseId: string | null;
  doctorName: string;
  isBundle?: boolean;
}

export const DEMO_REDEEMABLE_CODES: DemoRedeemableCode[] = [
  // =========================================================================
  // Master Bundle Code: كود واحد شامل لتفعيل جميع مقررات المستوى الثالث دفعة واحدة
  // =========================================================================
  {
    code: 'ALL3-2026-FULL',
    courseCode: 'ALL-L3-S1',
    courseName: 'باقة كافة مقررات المستوى الثالث (الفصل الأول)',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
  },
  {
    code: 'UNIV-2026-L3S1',
    courseCode: 'ALL-L3-S1',
    courseName: 'باقة كافة مقررات المستوى الثالث (الفصل الأول - احتياطي)',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
  },

  // =========================================================================
  // Individual Course Codes: أكواد تفعيل مستقلة لكل مقرر دراسي على حدة
  // =========================================================================
  // 1. Software Development for Mobile Devices - د/ مروة الصديق
  {
    code: 'MOBL-2026-M91A',
    courseCode: 'CS311',
    courseName: 'تطوير برمجيات الأجهزة المحمولة',
    courseId: 'cs-311',
    doctorName: 'د/ مروة الصديق',
  },
  {
    code: 'MOBL-2026-X47K',
    courseCode: 'CS311',
    courseName: 'تطوير برمجيات الأجهزة المحمولة',
    courseId: 'cs-311',
    doctorName: 'د/ مروة الصديق',
  },

  // 2. Computational Vision - د/ مروة الصديق
  {
    code: 'CVIS-2026-V84X',
    courseCode: 'AI303',
    courseName: 'الرؤية الحاسوبية',
    courseId: 'ai-303',
    doctorName: 'د/ مروة الصديق',
  },
  {
    code: 'CVIS-2026-N12P',
    courseCode: 'AI303',
    courseName: 'الرؤية الحاسوبية',
    courseId: 'ai-303',
    doctorName: 'د/ مروة الصديق',
  },

  // 3. Data Analysis - د/ محمود الصباغ
  {
    code: 'DATA-2026-D37K',
    courseCode: 'DS302',
    courseName: 'تحليل البيانات',
    courseId: 'ds-302',
    doctorName: 'د/ محمود الصباغ',
  },
  {
    code: 'DATA-2026-Q89L',
    courseCode: 'DS302',
    courseName: 'تحليل البيانات',
    courseId: 'ds-302',
    doctorName: 'د/ محمود الصباغ',
  },

  // 4. Parallel and Distributed Computing - د/ محمد عبده
  {
    code: 'PDCS-2026-P62M',
    courseCode: 'CS302',
    courseName: 'الحوسبة المتوازية والموزعة',
    courseId: 'cs-302',
    doctorName: 'د/ محمد عبده',
  },
  {
    code: 'PDCS-2026-R43W',
    courseCode: 'CS302',
    courseName: 'الحوسبة المتوازية والموزعة',
    courseId: 'cs-302',
    doctorName: 'د/ محمد عبده',
  },

  // 5. Introduction to Algorithms - د/ فاطمة طلعت
  {
    code: 'ALGO-2026-A19T',
    courseCode: 'CS303',
    courseName: 'مقدمة في الخوارزميات',
    courseId: 'cs-303',
    doctorName: 'د/ فاطمة طلعت',
  },
  {
    code: 'ALGO-2026-B76Y',
    courseCode: 'CS303',
    courseName: 'مقدمة في الخوارزميات',
    courseId: 'cs-303',
    doctorName: 'د/ فاطمة طلعت',
  },

  // 6. Fundamentals of Deep Learning - د/ بسمة حسن
  {
    code: 'DEEP-2026-B55H',
    courseCode: 'AI302',
    courseName: 'أساسيات التعلم العميق',
    courseId: 'ai-302',
    doctorName: 'د/ بسمة حسن',
  },
  {
    code: 'DEEP-2026-Z38E',
    courseCode: 'AI302',
    courseName: 'أساسيات التعلم العميق',
    courseId: 'ai-302',
    doctorName: 'د/ بسمة حسن',
  },
];
