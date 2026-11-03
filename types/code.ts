export interface StudentCode {
  id: string;
  code: string;
  courseCode: string;
  courseName: string;
  courseId: string;
  doctorName: string;
  receiptNumber: string;
  activatedAt: string;
  semester: string;
  status: 'active' | 'expired';
}
