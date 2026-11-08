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
  avatarUrl?: string | null;
}
