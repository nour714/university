export type ExamStatus = 'live' | 'upcoming' | 'completed' | 'ended';

export type ExamType = 'midterm' | 'quiz' | 'final' | 'practical';

export interface ExamQuestionOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  questionText: string;
  codeSnippet?: string;
  options: ExamQuestionOption[];
  points: number;
}

export interface GradeResult {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  perQuestion: Record<string, boolean>;
}

export interface Exam {
  id: string;
  courseCode: string;
  courseTitle: string;
  doctorName: string;
  doctorTitle: string;
  title: string;
  description: string;
  type: ExamType;
  questionsCount: number;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startDate: string; // ISO string e.g. 2026-11-06T10:00:00+02:00
  endDate: string;   // ISO string e.g. 2026-11-06T12:00:00+02:00
  status?: ExamStatus;
  questions: ExamQuestion[];
  instructions: string[];
  // If completed previously
  submission?: {
    submittedAt: string;
    score: number;
    totalMarks: number;
    percentage: number;
    passed: boolean;
    answers: Record<string, string>; // questionId -> selectedOptionId
  };
}

export type ListExam = Omit<Exam, 'questions'>;
