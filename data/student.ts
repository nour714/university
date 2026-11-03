export interface StudentProfile {
  id: string;
  fullName: string;
  academicId: string;
  department: string;
  faculty: string;
  level: string;
  levelNumber: number;
  gpa: number;
  maxGpa: number;
  gpaRating: string;
  registeredHours: number;
  coursesCount: number;
  academicYear: string;
  semester: string;
  status: string;
}

export const CURRENT_STUDENT: StudentProfile = {
  id: 'std_20230814',
  fullName: 'عبد الرحمن خالد منصور',
  academicId: '20230814',
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
};
