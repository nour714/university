'use server';

import 'server-only';
import { requireAuth } from '@/server/auth/requireAuth';
import { listCourses, listEnrolledCourses, getCourseById, CourseWithEnrollment } from '@/server/courses/service';

/**
 * Server Action to list all catalog courses with student enrollment status.
 */
export async function listCoursesAction(): Promise<CourseWithEnrollment[]> {
  const student = await requireAuth();
  return listCourses(student.accountId);
}

/**
 * Server Action to list only the courses the authenticated student is actively enrolled in.
 */
export async function listEnrolledCoursesAction(): Promise<CourseWithEnrollment[]> {
  const student = await requireAuth();
  return listEnrolledCourses(student.accountId);
}

/**
 * Server Action to fetch course details with gated content.
 */
export async function getCourseByIdAction(courseId: string): Promise<CourseWithEnrollment | null> {
  const student = await requireAuth();
  return getCourseById(courseId, student.accountId);
}
