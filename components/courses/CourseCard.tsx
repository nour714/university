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
  const iconProps = { className: 'w-6 h-6 text-blue-600' };
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
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Card Header & Icon Accent */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 [&_svg]:group-hover:text-white">
              <CourseIcon name={course.iconName} />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold tracking-wider mb-1 border border-slate-200/60">
                {course.code}
              </span>
              <p className="text-xs text-slate-500 font-medium">{course.department}</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
              المستوى {course.level}
            </span>
            <span className="text-[10px] text-slate-600 mt-1">{course.semester}</span>
          </div>
        </div>

        {/* Card Body: Title & Professor */}
        <div className="p-5 pt-4">
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-4">
            {course.title}
          </h2>

          {/* Doctor Info */}
          <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <User className="w-4 h-4 text-slate-600 shrink-0" />
            <div className="truncate">
              <span className="font-semibold">{course.doctorName}</span>
              <span className="text-slate-600 text-[11px] block truncate">{course.doctorTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Items Counts & Action Link */}
      <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
          <span className="font-medium">المحتويات الأكاديمية:</span>
          <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
            {course.itemsCount.total} عنصر
          </span>
        </div>

        {/* Main CTA */}
        <Link
          href={`/courses/${course.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 text-sm font-semibold transition-all duration-200 group-hover:shadow-md"
        >
          <span>استعراض المقرّر</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

