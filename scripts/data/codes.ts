export interface DemoRedeemableCode {
  code: string;
  courseCode: string;
  courseName: string;
  courseId: string | null;
  doctorName: string;
  isBundle?: boolean;
  targetLevel?: number;
}

export const DEMO_REDEEMABLE_CODES: DemoRedeemableCode[] = [
  // =========================================================================
  // Master Bundle Codes - Level 1 (باقة مقررات المستوى الأول - الفصل الأول)
  // =========================================================================
  {
    code: 'ALL1-2026-FULL',
    courseCode: 'ALL-L1-S1',
    courseName: 'باقة كافة مقررات المستوى الأول',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الأول',
    isBundle: true,
    targetLevel: 1,
  },
  {
    code: 'ALL1-2026-PLUS',
    courseCode: 'ALL-L1-S1',
    courseName: 'باقة كافة مقررات المستوى الأول (إضافي)',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الأول',
    isBundle: true,
    targetLevel: 1,
  },
  {
    code: 'ALL1-2026-GOLD',
    courseCode: 'ALL-L1-S1',
    courseName: 'باقة كافة مقررات المستوى الأول (مميز)',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الأول',
    isBundle: true,
    targetLevel: 1,
  },
  {
    code: 'UNIV-2026-L1S1',
    courseCode: 'ALL-L1-S1',
    courseName: 'باقة كافة مقررات المستوى الأول (احتياطي)',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الأول',
    isBundle: true,
    targetLevel: 1,
  },

  // =========================================================================
  // Master Bundle Codes - Level 3 (باقة مقررات المستوى الثالث - الفصل الأول)
  // =========================================================================
  {
    code: 'ALL3-2026-FULL',
    courseCode: 'ALL-L3-S1',
    courseName: 'كل مقررات الفصل',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
    targetLevel: 3,
  },
  {
    code: 'XXXP-UKTX-R35R',
    courseCode: 'ALL-L3-S1',
    courseName: 'كل مقررات الفصل',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
    targetLevel: 3,
  },
  {
    code: 'UNIV-2026-L3S1',
    courseCode: 'ALL-L3-S1',
    courseName: 'كل مقررات الفصل (احتياطي)',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
    targetLevel: 3,
  },
  {
    code: 'ALL3-2026-PLUS',
    courseCode: 'ALL-L3-S1',
    courseName: 'كل مقررات الفصل',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
    targetLevel: 3,
  },
  {
    code: 'ALL3-2026-GOLD',
    courseCode: 'ALL-L3-S1',
    courseName: 'كل مقررات الفصل',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
    targetLevel: 3,
  },
  {
    code: 'ALL3-2026-PREM',
    courseCode: 'ALL-L3-S1',
    courseName: 'كل مقررات الفصل',
    courseId: null,
    doctorName: 'هيئة تدريس المستوى الثالث',
    isBundle: true,
    targetLevel: 3,
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

  // =========================================================================
  // Individual Course Codes - Level 1 (المستوى الأول)
  // =========================================================================
  // 1. Computer Fundamentals - أ.د/ تامر مدحت
  {
    code: 'FUND-2026-C11A',
    courseCode: 'CS101',
    courseName: 'أساسيات الحاسب',
    courseId: 'cs-101',
    doctorName: 'أ.د/ تامر مدحت',
    targetLevel: 1,
  },
  {
    code: 'FUND-2026-F92B',
    courseCode: 'CS101',
    courseName: 'أساسيات الحاسب',
    courseId: 'cs-101',
    doctorName: 'أ.د/ تامر مدحت',
    targetLevel: 1,
  },

  // 2. Structured Programming - أ.د/ محمود يسن
  {
    code: 'PROG-2026-P21A',
    courseCode: 'CS102',
    courseName: 'البرمجة الهيكلية',
    courseId: 'cs-102',
    doctorName: 'أ.د/ محمود يسن',
    targetLevel: 1,
  },
  {
    code: 'PROG-2026-S84B',
    courseCode: 'CS102',
    courseName: 'البرمجة الهيكلية',
    courseId: 'cs-102',
    doctorName: 'أ.د/ محمود يسن',
    targetLevel: 1,
  },

  // 3. Electric Circuits - أ.د/ محمود يسن
  {
    code: 'CIRC-2026-E31A',
    courseCode: 'IT101',
    courseName: 'الدوائر الكهربائية',
    courseId: 'it-101',
    doctorName: 'أ.د/ محمود يسن',
    targetLevel: 1,
  },
  {
    code: 'CIRC-2026-C75B',
    courseCode: 'IT101',
    courseName: 'الدوائر الكهربائية',
    courseId: 'it-101',
    doctorName: 'أ.د/ محمود يسن',
    targetLevel: 1,
  },

  // 4. Mathematics 1 - أ.م.د/ منال السيد
  {
    code: 'MATH-2026-M41A',
    courseCode: 'BS101',
    courseName: 'رياضيات 1',
    courseId: 'bs-101',
    doctorName: 'أ.م.د/ منال السيد',
    targetLevel: 1,
  },
  {
    code: 'MATH-2026-T66B',
    courseCode: 'BS101',
    courseName: 'رياضيات 1',
    courseId: 'bs-101',
    doctorName: 'أ.م.د/ منال السيد',
    targetLevel: 1,
  },

  // 5. Introduction to Linear Algebra - أ.د/ تامر مدحت
  {
    code: 'LINE-2026-L51A',
    courseCode: 'BS102',
    courseName: 'مقدمة في الجبر الخطي',
    courseId: 'bs-102',
    doctorName: 'أ.د/ تامر مدحت',
    targetLevel: 1,
  },
  {
    code: 'LINE-2026-A57B',
    courseCode: 'BS102',
    courseName: 'مقدمة في الجبر الخطي',
    courseId: 'bs-102',
    doctorName: 'أ.د/ تامر مدحت',
    targetLevel: 1,
  },

  // 6. Probability & Statistics 1 - أ.د/ رشدي مرعي
  {
    code: 'PROB-2026-S61A',
    courseCode: 'BS103',
    courseName: 'الاحتمالات والإحصاء 1',
    courseId: 'bs-103',
    doctorName: 'أ.د/ رشدي مرعي',
    targetLevel: 1,
  },
  {
    code: 'PROB-2026-P48B',
    courseCode: 'BS103',
    courseName: 'الاحتمالات والإحصاء 1',
    courseId: 'bs-103',
    doctorName: 'أ.د/ رشدي مرعي',
    targetLevel: 1,
  },

  // 7. English Language - د/ محمد يسري
  {
    code: 'ENGL-2026-H71A',
    courseCode: 'HU101',
    courseName: 'اللغة الإنجليزية',
    courseId: 'hu-101',
    doctorName: 'د/ محمد يسري',
    targetLevel: 1,
  },
  {
    code: 'ENGL-2026-E39B',
    courseCode: 'HU101',
    courseName: 'اللغة الإنجليزية',
    courseId: 'hu-101',
    doctorName: 'د/ محمد يسري',
    targetLevel: 1,
  },
];
