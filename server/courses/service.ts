import 'server-only';
import { appSql } from '@/lib/db/app.server';
import { Course, CourseContentItem } from '@/types/course';

export async function listCourses(): Promise<Course[]> {
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
      COUNT(cc.id) AS count_total
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
    itemsCount: {
      files: Number(r.count_files) || 0,
      videos: Number(r.count_videos) || 0,
      images: Number(r.count_images) || 0,
      links: Number(r.count_links) || 0,
      total: Number(r.count_total) || 0,
    },
    content: [],
  }));
}

export async function getCourseById(courseId: string): Promise<Course | null> {
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
      c.thumbnail_color
    FROM public.academic_courses c
    WHERE c.id = ${courseId}
  `;

  if (!c) return null;

  const contentRows = await appSql`
    SELECT 
      id,
      title,
      description,
      type,
      format,
      size_label,
      duration,
      uploaded_at,
      storage_key,
      external_url
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
    url: cr.external_url || cr.storage_key || '#',
    downloadUrl: cr.storage_key ? `/api/files/download?contentId=${cr.id}` : undefined,
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
    itemsCount: {
      files: filesCount,
      videos: videosCount,
      images: imagesCount,
      links: linksCount,
      total: contents.length,
    },
    content: contents,
  };
}
