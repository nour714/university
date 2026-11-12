export type CourseLevel = 1 | 2 | 3 | 4;

export type Department = 
  | 'الذكاء الاصطناعي'
  | 'علوم الحاسب'
  | 'علم البيانات'
  | 'الأمن السيبراني'
  | 'الروبوتات والأنظمة الذكية';

export type Semester = 'الفصل الأول' | 'الفصل الثاني';

export type ContentType = 'file' | 'video' | 'image' | 'link';

export interface CourseContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  format: string; // e.g., 'PDF', 'MP4', 'PNG', 'LINK', 'PPTX'
  size?: string;  // e.g., '4.5 MB', '120 MB', '-' for links
  uploadedAt: string;
  url: string;
  downloadUrl?: string;
  duration?: string; // for videos (e.g., '45:20')
}

export interface Course {
  id: string;
  code: string;           // e.g., 'AI301'
  title: string;          // e.g., 'تعلم الآلة المتقدم (Machine Learning)'
  englishTitle: string;
  description: string;
  doctorName: string;     // e.g., 'أ.د. أحمد المنشاوي'
  doctorTitle: string;    // e.g., 'أستاذ الذكاء الاصطناعي ورئيس القسم'
  doctorAvatar?: string;
  creditHours: number;
  level: CourseLevel;
  department: Department;
  semester: Semester;
  iconName: string;
  thumbnailColor: string;
  itemsCount: {
    files: number;
    videos: number;
    images: number;
    links: number;
    total: number;
  };
  content: CourseContentItem[];
  enrolled?: boolean;
  locked?: boolean;
}

