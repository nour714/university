import Link from 'next/link';
import { 
  BookOpen, 
  Calendar, 
  Bell, 
  GraduationCap, 
  FolderKanban, 
  Layers, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const NAVIGATION_LINKS = [
  { name: 'مكتبة المقررات', href: '/courses', icon: 'BookOpen', active: true },
  { name: 'الجدول الدراسي', href: '#schedule', icon: 'Calendar', active: false },
  { name: 'لوحة الإعلانات', href: '#announcements', icon: 'Bell', active: false },
  { name: 'المشاريع والأبحاث', href: '#projects', icon: 'FolderKanban', active: false },
  { name: 'الأقسام العلمية', href: '#departments', icon: 'Layers', active: false },
];

export function Sidebar({ currentPath = '/courses' }: { currentPath?: string }) {
  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#172554] text-white shrink-0 border-l border-blue-950/40 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Faculty Branding */}
      <div>
        <div className="p-6 border-b border-blue-900/50">
          <Link href="/courses" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">كلية الذكاء الاصطناعي</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-xs text-blue-200">المنصة الأكاديمية الذكية</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <p className="text-[11px] font-semibold text-blue-300 uppercase px-3 mb-2 tracking-wider">
            القائمة الرئيسية
          </p>
          <nav className="space-y-1.5">
            {NAVIGATION_LINKS.map((item) => {
              const isActive = currentPath.startsWith(item.href) && item.href !== '#';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-blue-900/40 hover:text-white'
                  }`}
                >
                  {item.icon === 'BookOpen' && <BookOpen className="w-5 h-5" />}
                  {item.icon === 'Calendar' && <Calendar className="w-5 h-5 text-slate-400" />}
                  {item.icon === 'Bell' && <Bell className="w-5 h-5 text-slate-400" />}
                  {item.icon === 'FolderKanban' && <FolderKanban className="w-5 h-5 text-slate-400" />}
                  {item.icon === 'Layers' && <Layers className="w-5 h-5 text-slate-400" />}
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-blue-900/50">
        <div className="bg-blue-900/30 rounded-xl p-3.5 text-xs text-blue-200 border border-blue-800/40">
          <div className="flex items-center gap-2 mb-1.5 text-white font-medium">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>الدعم الأكاديمي</span>
          </div>
          <p className="text-[11px] text-blue-300 leading-relaxed">
            للاستفسارات الخاصة بالمواد، تواصل مع منسق القسم الأكاديمي.
          </p>
        </div>
        <div className="mt-3 text-[11px] text-blue-300/80 text-center">
          جامعة المستقبل الذكية © 2026
        </div>
      </div>
    </aside>
  );
}

