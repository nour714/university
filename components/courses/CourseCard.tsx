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
  Sparkles,
  Lock,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onOpenActivationModal?: (course: Course) => void;
}

// Icon helper function based on course iconName
function CourseIcon({ name, isLocked }: { name: string; isLocked: boolean }) {
  const iconProps = { className: `w-4 h-4 sm:w-5 sm:h-5 ${isLocked ? 'text-slate-500' : 'text-blue-600'}` };
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

export function CourseCard({ course, onOpenActivationModal }: CourseCardProps) {
  const isLocked = course.locked ?? !course.enrolled;
  const itemsTotal = course.itemsCount?.total ?? course.content?.length ?? 0;

  return (
    <div 
      className={`group bg-white rounded-xl sm:rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
        isLocked 
          ? 'border-slate-200/90 hover:border-amber-300' 
          : 'border-slate-200/90 hover:border-blue-400'
      }`}
    >
      <div>
        {/* Card Header & Badges */}
        <div className="p-3 sm:p-4 pb-2.5 sm:pb-3 border-b border-slate-100 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
              isLocked 
                ? 'bg-slate-100 border border-slate-200 text-slate-500 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-700' 
                : 'bg-blue-50 border border-blue-100/80 text-blue-600 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white [&_svg]:group-hover:text-white'
            }`}>
              <CourseIcon name={course.iconName} isLocked={isLocked} />
            </div>
            <div className="min-w-0">
              <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-bold tracking-wider mb-0.5 border border-slate-200/60">
                {course.code}
              </span>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                {course.department}
              </p>
            </div>
          </div>

          {/* Level / Semester & Lock Badges */}
          <div className="flex flex-col items-end shrink-0 gap-1">
            {isLocked ? (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 whitespace-nowrap">
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                <span>مقفل 🔒 يتطلب كود تفعيل</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 whitespace-nowrap">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>مفعل ونشط</span>
              </span>
            )}
            <span className="text-[9px] sm:text-[10px] text-slate-500 whitespace-nowrap">
              المستوى {course.level} • {course.semester}
            </span>
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
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2.5">
          <span className="font-medium text-[11px] sm:text-xs">
            {isLocked ? 'حالة المحتوى الأكاديمي:' : 'المحتويات الأكاديمية:'}
          </span>
          {isLocked ? (
            <span className="font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60 text-[10px] sm:text-[11px] flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>يتطلب اشتراك</span>
            </span>
          ) : (
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs text-[11px] sm:text-xs">
              {itemsTotal} عنصر
            </span>
          )}
        </div>

        {/* CTA Actions */}
        {isLocked ? (
          <div className="flex items-center gap-1.5">
            {onOpenActivationModal ? (
              <button
                type="button"
                onClick={() => onOpenActivationModal(course)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all min-h-[42px] cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تفعيل المفتاح</span>
              </button>
            ) : (
              <Link
                href={`/courses/${course.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all min-h-[42px]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تفعيل المفتاح</span>
              </Link>
            )}

            <Link
              href={`/courses/${course.id}`}
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg sm:rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all min-h-[42px]"
              title="معاينة تفاصيل المقرر"
              aria-label={`معاينة تفاصيل مقرر ${course.title}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <Link
            href={`/courses/${course.id}`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg sm:rounded-xl bg-white hover:bg-blue-600 text-slate-800 hover:text-white border border-slate-200 hover:border-blue-600 text-xs sm:text-sm font-semibold transition-all duration-200 group-hover:shadow-md min-h-[42px]"
          >
            <span>استعراض المقرّر</span>
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
