import { Award, GraduationCap, Clock, BookOpen, TrendingUp, CheckCircle2 } from 'lucide-react';
import { StudentProfile } from '@/data/student';

interface StudentStatsGridProps {
  student: StudentProfile;
}

export function StudentStatsGrid({ student }: StudentStatsGridProps) {
  const stats = [
    {
      id: 'gpa',
      title: 'المعدل التراكمي (GPA)',
      value: student.gpa.toFixed(2),
      unit: `/ ${student.maxGpa.toFixed(2)}`,
      badge: student.gpaRating,
      badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300/60',
      icon: Award,
      iconColor: 'from-amber-400 to-amber-600 text-white shadow-amber-500/30',
      borderHover: 'hover:border-amber-400/80',
      description: 'أداء أكاديمي فائق',
      highlight: true,
    },
    {
      id: 'level',
      title: 'المستوى الأكاديمي',
      value: student.level,
      unit: '',
      badge: `السنة الدراسية ${student.levelNumber}`,
      badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-300/60',
      icon: GraduationCap,
      iconColor: 'from-blue-600 to-indigo-700 text-white shadow-blue-500/30',
      borderHover: 'hover:border-blue-400/80',
      description: 'قسم الذكاء الاصطناعي',
      highlight: false,
    },
    {
      id: 'hours',
      title: 'الساعات المسجلة',
      value: student.registeredHours.toString(),
      unit: 'ساعة معتمدة',
      badge: 'العبء الأكاديمي الكامل',
      badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-300/60',
      icon: Clock,
      iconColor: 'from-purple-600 to-violet-700 text-white shadow-purple-500/30',
      borderHover: 'hover:border-purple-400/80',
      description: 'الفصل الدراسي الحالي',
      highlight: false,
    },
    {
      id: 'courses',
      title: 'عدد المقرارات الدراسية',
      value: student.coursesCount.toString(),
      unit: 'مقررات مسجلة',
      badge: 'فصل الخريف 2026',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/60',
      icon: BookOpen,
      iconColor: 'from-emerald-500 to-teal-700 text-white shadow-emerald-500/30',
      borderHover: 'hover:border-emerald-400/80',
      description: 'تشمل المحاضرات والعملي',
      highlight: false,
    },
  ];

  return (
    <section aria-label="مؤشرات أداء الطالب الأكاديمية" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-extrabold text-[#172554] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          المؤشرات والبيانات الأكاديمية
        </h2>
        <span className="text-xs text-slate-500 font-medium">محدّث لحظياً</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className={`group relative bg-white/95 backdrop-blur-md rounded-[24px] p-5 sm:p-6 border border-slate-200/90 shadow-md shadow-slate-200/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${stat.borderHover}`}
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.iconColor} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${stat.badgeColor} max-w-[130px] truncate text-center`}
                  title={stat.badge}
                >
                  {stat.badge}
                </span>
              </div>

              {/* Title */}
              <p className="text-xs sm:text-sm font-bold text-slate-600 mb-1.5">
                {stat.title}
              </p>

              {/* Stat Value */}
              <div className="flex items-baseline gap-1.5 mb-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-[#172554] tracking-tight">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-xs sm:text-sm font-bold text-slate-500">
                    {stat.unit}
                  </span>
                )}
              </div>

              {/* Bottom Subtle Note */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
