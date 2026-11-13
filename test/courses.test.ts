import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestDatabase, teardownTestDatabase, TestDbClients } from './setupTestDb';
import { getCourseById, listCourses, listEnrolledCourses, resolveContentDownload } from '@/server/courses/service';

describe('Courses & Content Protection (Finding C1)', () => {
  let clients: TestDbClients;

  const enrolledStudentId = 'd0000000-0000-0000-0000-000000000001';
  const nonEnrolledStudentId = 'd0000000-0000-0000-0000-000000000002';
  const courseId = 'course-sec-101';
  const contentFileId = 'cont-file-001';
  const contentLinkId = 'cont-link-001';

  beforeAll(async () => {
    clients = await setupTestDatabase();

    // 1. Create student accounts
    await clients.ownerSql`
      INSERT INTO public.academic_accounts (id, national_id, password_hash, is_active)
      VALUES 
        (${enrolledStudentId}, '30101010101041', 'hash', true),
        (${nonEnrolledStudentId}, '30101010101042', 'hash', true)
      ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Create course
    await clients.ownerSql`
      INSERT INTO public.academic_courses (
        id, code, title, description, doctor_name, credit_hours, level, department, semester
      ) VALUES (
        ${courseId}, 'SEC101', 'أمن المعلومات وحماية البيانات', 'مقرر الأمن السيبراني', 'د. عادل إبراهيم',
        3, 2, 'الأمن السيبراني', 'الفصل الأول'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // 3. Create course contents (1 with private storage_key, 1 with external_url)
    await clients.ownerSql`
      INSERT INTO public.academic_course_contents (
        id, course_id, title, description, type, format, size_label, storage_key
      ) VALUES (
        ${contentFileId}, ${courseId}, 'المحاضرة الأولى - مقدمة', 'ملف المحاضرة بصيغة PDF',
        'file', 'PDF', '2.5 MB', 'courses/sec101/lecture1.pdf'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    await clients.ownerSql`
      INSERT INTO public.academic_course_contents (
        id, course_id, title, description, type, format, external_url
      ) VALUES (
        ${contentLinkId}, ${courseId}, 'رابط المرجع الخارجي', 'رابط موثق خارجي',
        'link', 'URL', 'https://example.com/cybersecurity-guide'
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // 4. Enroll enrolledStudentId into courseId
    await clients.ownerSql`
      INSERT INTO public.academic_student_codes (
        student_id, course_id, code, receipt_number, semester, status
      ) VALUES (
        ${enrolledStudentId}, ${courseId}, 'SEC101-ACTIVE-CODE', 'REC-SEC-01', 'الفصل الأول', 'active'
      ) ON CONFLICT (student_id, course_id) DO NOTHING;
    `;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('getCourseById content gating', () => {
    it('returns locked: true, enrolled: false, and empty content for non-enrolled student', async () => {
      const course = await getCourseById(courseId, nonEnrolledStudentId);
      expect(course).toBeDefined();
      expect(course?.enrolled).toBe(false);
      expect(course?.locked).toBe(true);
      expect(course?.content).toEqual([]);
      expect(course?.itemsCount.total).toBe(0);
    });

    it('returns locked: false, enrolled: true, and safe URLs for enrolled student', async () => {
      const course = await getCourseById(courseId, enrolledStudentId);
      expect(course).toBeDefined();
      expect(course?.enrolled).toBe(true);
      expect(course?.locked).toBe(false);
      expect(course?.content.length).toBe(2);

      for (const item of course!.content) {
        // Must point through /api/files/download
        expect(item.url).toBe(`/api/files/download?contentId=${item.id}`);
        expect(item.downloadUrl).toBe(`/api/files/download?contentId=${item.id}`);

        // Must NEVER expose raw storage_key or external_url
        expect((item as any).storage_key).toBeUndefined();
        expect((item as any).storageKey).toBeUndefined();
        expect((item as any).external_url).toBeUndefined();
        expect((item as any).externalUrl).toBeUndefined();
      }
    });

    it('listCourses marks enrollment correctly per student', async () => {
      const nonEnrolledList = await listCourses(nonEnrolledStudentId);
      const nonEnrolledCourse = nonEnrolledList.find((c) => c.id === courseId);
      expect(nonEnrolledCourse?.enrolled).toBe(false);
      expect(nonEnrolledCourse?.locked).toBe(true);

      const enrolledList = await listCourses(enrolledStudentId);
      const enrolledCourse = enrolledList.find((c) => c.id === courseId);
      expect(enrolledCourse?.enrolled).toBe(true);
      expect(enrolledCourse?.locked).toBe(false);
    });

    it('listEnrolledCourses returns only enrolled courses', async () => {
      const nonEnrolledOnly = await listEnrolledCourses(nonEnrolledStudentId);
      expect(nonEnrolledOnly.find((c) => c.id === courseId)).toBeUndefined();

      const enrolledOnly = await listEnrolledCourses(enrolledStudentId);
      expect(enrolledOnly.find((c) => c.id === courseId)).toBeDefined();
      expect(enrolledOnly.every((c) => c.enrolled === true)).toBe(true);
    });

    it('listCourses filters by student level and excludes courses from other levels', async () => {
      // courseId is level 2
      const level2Courses = await listCourses(enrolledStudentId, 2);
      expect(level2Courses.some((c) => c.id === courseId)).toBe(true);
      expect(level2Courses.every((c) => c.level === 2)).toBe(true);

      // Level 3 should NOT contain level 2 courseId
      const level3Courses = await listCourses(enrolledStudentId, 3);
      expect(level3Courses.some((c) => c.id === courseId)).toBe(false);
      expect(level3Courses.every((c) => c.level === 3)).toBe(true);

      // Level 1 should NOT contain level 2 courseId
      const level1Courses = await listCourses(enrolledStudentId, 1);
      expect(level1Courses.some((c) => c.id === courseId)).toBe(false);
      expect(level1Courses.every((c) => c.level === 1)).toBe(true);
    });
  });

  describe('resolveContentDownload SQL authorization', () => {
    it('returns not_found for non-existing content', async () => {
      const res = await resolveContentDownload('fake-content-id', enrolledStudentId);
      expect(res.status).toBe('not_found');
    });

    it('returns forbidden for non-enrolled student', async () => {
      const res = await resolveContentDownload(contentFileId, nonEnrolledStudentId);
      expect(res.status).toBe('forbidden');
      expect(res.content).toBeUndefined();
    });

    it('returns authorized with content metadata for enrolled student', async () => {
      const res = await resolveContentDownload(contentFileId, enrolledStudentId);
      expect(res.status).toBe('authorized');
      expect(res.content).toBeDefined();
      expect(res.content?.id).toBe(contentFileId);
      expect(res.content?.storageKey).toBe('courses/sec101/lecture1.pdf');
    });
  });
});
