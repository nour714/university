export interface SeedStudentData {
  id: string;
  fullName: string;
  email: string;
  academicId: string;
  nationalId: string;
  department: string;
  faculty: string;
  level: string;
  levelNumber: number;
  gpa: number | null;
  maxGpa: number;
  gpaRating: string;
  registeredHours: number;
  coursesCount: number;
  academicYear: string;
  semester: string;
  status: string;
  enrollDefaultCourses: boolean;
}

export const DEMO_STUDENT: SeedStudentData = {
  id: 'std_20230814',
  fullName: 'عبد الرحمن خالد منصور',
  email: 'abdelrahman.khaled@university.edu.eg',
  academicId: '20230814',
  nationalId: '20230814000000',
  department: 'هندسة وعلوم الذكاء الاصطناعي',
  faculty: 'كلية الذكاء الاصطناعي',
  level: 'المستوى الثالث',
  levelNumber: 3,
  gpa: 3.84,
  maxGpa: 4.00,
  gpaRating: 'امتياز مع مرتبة الشرف',
  registeredHours: 18,
  coursesCount: 6,
  academicYear: '2026/2027',
  semester: 'الفصل الدراسي الأول',
  status: 'منتظم',
  enrollDefaultCourses: true,
};

export const NEW_STUDENT_ACCOUNTS: SeedStudentData[] = [
  {
    id: 'std_20230815',
    fullName: 'نور الدين وائل عبدالرؤف',
    email: 'nour.wael@university.edu.eg',
    academicId: '20230815',
    nationalId: '30405120102513',
    department: 'هندسة وعلوم الذكاء الاصطناعي',
    faculty: 'كلية الذكاء الاصطناعي',
    level: 'المستوى الثالث',
    levelNumber: 3,
    gpa: null,
    maxGpa: 4.00,
    gpaRating: 'قيد الرصد',
    registeredHours: 0,
    coursesCount: 0,
    academicYear: '2026/2027',
    semester: 'الفصل الدراسي الأول',
    status: 'منتظم',
    enrollDefaultCourses: false,
  },
  {
    id: 'std_20230816',
    fullName: 'ساره نبيل ابوالمجد',
    email: 'sara.nabil@university.edu.eg',
    academicId: '20230816',
    nationalId: '30409230104226',
    department: 'هندسة وعلوم الذكاء الاصطناعي',
    faculty: 'كلية الذكاء الاصطناعي',
    level: 'المستوى الثالث',
    levelNumber: 3,
    gpa: null,
    maxGpa: 4.00,
    gpaRating: 'قيد الرصد',
    registeredHours: 0,
    coursesCount: 0,
    academicYear: '2026/2027',
    semester: 'الفصل الدراسي الأول',
    status: 'منتظم',
    enrollDefaultCourses: false,
  },
  {
    id: 'std_20230817',
    fullName: 'ياسر وليد عبدالجواد',
    email: 'yasser.walid@university.edu.eg',
    academicId: '20230817',
    nationalId: '30411182103719',
    department: 'هندسة وعلوم الذكاء الاصطناعي',
    faculty: 'كلية الذكاء الاصطناعي',
    level: 'المستوى الثالث',
    levelNumber: 3,
    gpa: null,
    maxGpa: 4.00,
    gpaRating: 'قيد الرصد',
    registeredHours: 0,
    coursesCount: 0,
    academicYear: '2026/2027',
    semester: 'الفصل الدراسي الأول',
    status: 'منتظم',
    enrollDefaultCourses: false,
  },
];

export const SEED_STUDENTS: SeedStudentData[] = [DEMO_STUDENT, ...NEW_STUDENT_ACCOUNTS];
