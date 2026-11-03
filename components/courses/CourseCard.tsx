import Link from 'next/link';
import { Course } from '@/types/course';
import { 
  ArrowLeft, 
  User, 
  BrainCircuit, 
  Cpu, 
  MessageSquareText, 
  Network, 
  BarChart3, 
  ShieldAlert, 
  Bot, 
  Sparkles 
} from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

// Icon helper function based on course iconName
function CourseIcon({ name }: { name: string }) {
  const iconProps = { className: 'w-4 h-4 sm:w-5 sm:h-5 text-blue-600' };
  switch (name) {
    case 'BrainCircuit':
      return <BrainCircuit {...iconProps} />;
    case 'Cpu':
      return <Cpu {...iconProps} />;
    case 'MessageSquareText':
      return <MessageSquareText {...iconProps} />;
    case 'Network':
      return <Network {...iconProps} />;
    case 'BarChart3':
      return <BarChart3 {...iconProps} />;
    case 'ShieldAlert':
      return <ShieldAlert {...iconProps} />;
    case 'Bot':
      return <Bot {...iconProps} />;
    case 'Sparkles':
    default:
      return <Sparkles {...iconProps} />;
  }
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header & Icon Accent */}
        <div className="p-3 sm:p-4 pb-2.5 sm:pb-3 border-b border-slate-100 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 border border-blue-100/80 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 [&_svg]:group-hover:text-white">
              <CourseIcon name={course.iconName} />
            </div>
            <div>
              <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-bold tracking-wider mb-0.5 border border-slate-200/60">
                {course.code}
              </span>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[120px] sm:max-w-none">
                {course.department}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200/60 whitespace-nowrap">
              المستوى {course.level}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 whitespace-nowrap">{course.semester}</span>
          </div>
        </div>

        {/* Card Body: Title & Professor */}
        <div className="p-3 sm:p-4 pt-2.5 sm:pt-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
            {course.title}
          </h2>

          {/* Doctor Info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-semibold truncate text-[11px] sm:text-xs">{course.doctorName}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Items Counts & Action Link */}
      <div className="p-3 sm:p-4 pt-2.5 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <span className="font-medium text-[11px] sm:text-xs">المحتويات الأكاديمية:</span>
          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs text-[11px] sm:text-xs">
            {course.content.length} عنصر
          </span>
        </div>

        {/* Main CTA with comfortable touch target */}
        <Link
          href={`/courses/${course.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg sm:rounded-xl bg-white hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 text-xs sm:text-sm font-semibold transition-all duration-200 group-hover:shadow-md min-h-[38px] sm:min-h-[40px]"
        >
          <span>استعراض المقرّر</span>
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
