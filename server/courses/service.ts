import 'server-only';
import { cache } from 'react';
import { appSql } from '@/lib/db/app.server';
import { Course, CourseContentItem } from '@/types/course';

export interface CourseWithEnrollment extends Course {
  enrolled?: boolean;
  locked?: boolean;
}

export const listCourses = cache(async (studentId?: string): Promise<CourseWithEnrollment[]> => {
  try {
    const rows = await appSql`
      SELECT 
        c.id,
        c.code,
        c.title,
        c.english_title,
        c.description,
        c.doctor_name,
        c.doctor_title,
        c.doctor_avatar,
        c.credit_hours,
        c.level,
        c.department,
        c.semester,
        c.icon_name,
        c.thumbnail_color,
        COUNT(cc.id) FILTER (WHERE cc.type = 'file') AS count_files,
        COUNT(cc.id) FILTER (WHERE cc.type = 'video') AS count_videos,
        COUNT(cc.id) FILTER (WHERE cc.type = 'image') AS count_images,
        COUNT(cc.id) FILTER (WHERE cc.type = 'link') AS count_links,
        COUNT(cc.id) AS count_total,
        EXISTS (
          SELECT 1 FROM public.academic_student_codes sc
          WHERE sc.course_id = c.id 
            AND sc.student_id = ${studentId || null} 
            AND sc.status = 'active'
        ) AS enrolled
      FROM public.academic_courses c
      LEFT JOIN public.academic_course_contents cc ON cc.course_id = c.id
      GROUP BY c.id
      ORDER BY c.level, c.code
    `;

    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      title: r.title,
      englishTitle: r.english_title || r.title,
      description: r.description,
      doctorName: r.doctor_name,
      doctorTitle: r.doctor_title || 'عضو هيئة التدريس',
      doctorAvatar: r.doctor_avatar || undefined,
      creditHours: r.credit_hours,
      level: r.level as 1 | 2 | 3 | 4,
      department: r.department as Course['department'],
      semester: r.semester as Course['semester'],
      iconName: r.icon_name || 'BookOpen',
      thumbnailColor: r.thumbnail_color || 'from-blue-600 to-indigo-700',
      enrolled: Boolean(r.enrolled),
      locked: !Boolean(r.enrolled),
      itemsCount: {
        files: Number(r.count_files) || 0,
        videos: Number(r.count_videos) || 0,
        images: Number(r.count_images) || 0,
        links: Number(r.count_links) || 0,
        total: Number(r.count_total) || 0,
      },
      content: [],
    }));
  } catch (err) {
    console.error('listCourses error:', err);
    return [];
  }
});

export const getCourseById = cache(async (courseId: string, studentId?: string): Promise<CourseWithEnrollment | null> => {
  try {
    const [c] = await appSql`
      SELECT 
        c.id,
        c.code,
        c.title,
        c.english_title,
        c.description,
        c.doctor_name,
        c.doctor_title,
        c.doctor_avatar,
        c.credit_hours,
        c.level,
        c.department,
        c.semester,
        c.icon_name,
        c.thumbnail_color,
        EXISTS (
          SELECT 1 FROM public.academic_student_codes sc
          WHERE sc.course_id = c.id 
            AND sc.student_id = ${studentId || null} 
            AND sc.status = 'active'
        ) AS enrolled
      FROM public.academic_courses c
      WHERE c.id = ${courseId}
    `;

    if (!c) return null;

    const isEnrolled = Boolean(c.enrolled);

    // Finding C1: If student is not enrolled, do not return course contents or any URLs/storage keys!
    if (!isEnrolled) {
      return {
        id: c.id,
        code: c.code,
        title: c.title,
        englishTitle: c.english_title || c.title,
        description: c.description,
        doctorName: c.doctor_name,
        doctorTitle: c.doctor_title || 'عضو هيئة التدريس',
        doctorAvatar: c.doctor_avatar || undefined,
        creditHours: c.credit_hours,
        level: c.level as 1 | 2 | 3 | 4,
        department: c.department as Course['department'],
        semester: c.semester as Course['semester'],
        iconName: c.icon_name || 'BookOpen',
        thumbnailColor: c.thumbnail_color || 'from-blue-600 to-indigo-700',
        enrolled: false,
        locked: true,
        itemsCount: {
          files: 0,
          videos: 0,
          images: 0,
          links: 0,
          total: 0,
        },
        content: [],
      };
    }

    // For enrolled students, fetch contents but NEVER expose raw storage_key or external_url
    const contentRows = await appSql`
      SELECT 
        id,
        title,
        description,
        type,
        format,
        size_label,
        duration,
        uploaded_at
      FROM public.academic_course_contents
      WHERE course_id = ${courseId}
      ORDER BY uploaded_at DESC, id ASC
    `;

    const contents: CourseContentItem[] = contentRows.map((cr) => ({
      id: cr.id,
      title: cr.title,
      description: cr.description || undefined,
      type: cr.type as 'file' | 'video' | 'image' | 'link',
      format: cr.format,
      size: cr.size_label || undefined,
      duration: cr.duration || undefined,
      uploadedAt: new Date(cr.uploaded_at).toLocaleDateString('ar-EG'),
      // All downloads and views are routed through the secure download endpoint
      url: `/api/files/download?contentId=${cr.id}`,
      downloadUrl: `/api/files/download?contentId=${cr.id}`,
    }));

    const filesCount = contents.filter((x) => x.type === 'file').length;
    const videosCount = contents.filter((x) => x.type === 'video').length;
    const imagesCount = contents.filter((x) => x.type === 'image').length;
    const linksCount = contents.filter((x) => x.type === 'link').length;

    return {
      id: c.id,
      code: c.code,
      title: c.title,
      englishTitle: c.english_title || c.title,
      description: c.description,
      doctorName: c.doctor_name,
      doctorTitle: c.doctor_title || 'عضو هيئة التدريس',
      doctorAvatar: c.doctor_avatar || undefined,
      creditHours: c.credit_hours,
      level: c.level as 1 | 2 | 3 | 4,
      department: c.department as Course['department'],
      semester: c.semester as Course['semester'],
      iconName: c.icon_name || 'BookOpen',
      thumbnailColor: c.thumbnail_color || 'from-blue-600 to-indigo-700',
      enrolled: true,
      locked: false,
      itemsCount: {
        files: filesCount,
        videos: videosCount,
        images: imagesCount,
        links: linksCount,
        total: contents.length,
      },
      content: contents,
    };
  } catch (err) {
    console.error(`getCourseById(${courseId}) error:`, err);
    return null;
  }
});

export interface ContentDownloadResolution {
  status: 'not_found' | 'forbidden' | 'authorized';
  content?: {
    id: string;
    courseId: string;
    title: string;
    format: string;
    storageKey?: string | null;
    externalUrl?: string | null;
  };
}

/**
 * Resolves content download authorization for a student (Finding C1).
 * Strictly requires active student enrollment in the associated course in SQL.
 */
export async function resolveContentDownload(
  contentId: string,
  studentAccountId: string
): Promise<ContentDownloadResolution> {
  const [content] = await appSql`
    SELECT id, course_id, title, format, storage_key, external_url
    FROM public.academic_course_contents
    WHERE id = ${contentId}
  `;

  if (!content) {
    return { status: 'not_found' };
  }

  const [enrollment] = await appSql`
    SELECT 1 FROM public.academic_student_codes
    WHERE student_id = ${studentAccountId} 
      AND course_id = ${content.course_id} 
      AND status = 'active'
  `;

  if (!enrollment) {
    return { status: 'forbidden' };
  }

  return {
    status: 'authorized',
    content: {
      id: content.id,
      courseId: content.course_id,
      title: content.title,
      format: content.format,
      storageKey: content.storage_key,
      externalUrl: content.external_url,
    },
  };
}
