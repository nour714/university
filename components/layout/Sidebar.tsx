import Link from 'next/link';
import { 
  ArrowRight,
  Plus, 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  Clock, 
  UserCheck, 
  Building2, 
  Users, 
  CreditCard, 
  RotateCw, 
  BarChart2, 
  LogOut,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

function SidebarItem({ href, label, icon, isActive = false }: SidebarItemProps) {
  return (
    <div className="relative group flex items-center justify-center">
      <Link
        href={href}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          isActive
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500 shadow-md shadow-blue-600/30 scale-105'
            : 'text-slate-400 hover:text-white hover:bg-blue-900/40'
        }`}
        aria-label={label}
      >
        {icon}
      </Link>

      {/* Modern Tooltip in RTL (appears to the left) */}
      <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none">
        <div className="bg-[#172554] text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-800 shadow-xl whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
}

export const NAVIGATION_LINKS = [
  { name: 'مكتبة المقررات', href: '/courses', icon: 'BookOpen', active: true },
];

export function Sidebar({ currentPath = '/courses' }: { currentPath?: string }) {
  return (
    <aside className="hidden lg:flex flex-col items-center justify-between p-3 shrink-0 sticky top-0 h-screen select-none z-40">
      {/* Pill Capsule Container */}
      <div className="w-[74px] h-full bg-[#172554] rounded-[36px] flex flex-col items-center justify-between py-4 px-2 shadow-2xl border border-blue-900/50 relative overflow-hidden">
        
        {/* Top Section: Back/Collapse & Quick Action Button */}
        <div className="flex flex-col items-center gap-3 w-full shrink-0">
          {/* Top Arrow / Faculty Emblem */}
          <Link
            href="/courses"
            className="w-11 h-11 rounded-2xl bg-blue-950/90 border border-blue-800/60 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-900/60 flex items-center justify-center transition-all shadow-sm"
            title="كلية الذكاء الاصطناعي"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Glowing Primary Action Button (Blue pill action like the red one in reference) */}
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 transition-all hover:scale-105 active:scale-95"
            title="إضافة أو استكشاف سريع"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Middle Navigation Icons (with subtle custom scroll track) */}
        <div className="flex-1 my-3 flex flex-col items-center justify-start gap-2.5 overflow-y-auto overflow-x-hidden no-scrollbar w-full py-1">
          {/* Main Course Library (Active Grid / Book) */}
          <SidebarItem
            href="/courses"
            label="مكتبة المقررات"
            icon={<LayoutGrid className="w-5 h-5 stroke-[2.2]" />}
            isActive={currentPath.startsWith('/courses')}
          />

          <SidebarItem
            href="#schedule"
            label="الجدول الأكاديمي"
            icon={<Calendar className="w-5 h-5" />}
          />

          <SidebarItem
            href="#timetable"
            label="مواعيد المحاضرات"
            icon={<Clock className="w-5 h-5" />}
          />

          <SidebarItem
            href="#profile"
            label="الملف الأكاديمي"
            icon={<UserCheck className="w-5 h-5" />}
          />

          <SidebarItem
            href="#departments"
            label="الأقسام العلمية"
            icon={<Building2 className="w-5 h-5" />}
          />

          <SidebarItem
            href="#teams"
            label="مجموعات العمل الطلابية"
            icon={<Users className="w-5 h-5" />}
          />

          <SidebarItem
            href="#card"
            label="البطاقة الجامعية الإلكترونية"
            icon={<CreditCard className="w-5 h-5" />}
          />

          <SidebarItem
            href="#sync"
            label="المزامنة والتحديث"
            icon={<RotateCw className="w-5 h-5" />}
          />

          <SidebarItem
            href="#analytics"
            label="المعدل التراكمي والإحصائيات"
            icon={<BarChart2 className="w-5 h-5" />}
          />
        </div>

        {/* Bottom Section: Avatar & Logout */}
        <div className="flex flex-col items-center gap-3 w-full shrink-0 pt-2 border-t border-blue-900/60">
          <ChevronDown className="w-4 h-4 text-blue-400/50" />

          {/* User Avatar Circle (MR in Blue just like reference) */}
          <div 
            className="w-11 h-11 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-600/40 cursor-pointer hover:scale-105 transition-transform border-2 border-blue-400/40"
            title="عبد الرحمن خالد (MR)"
          >
            MR
          </div>

          {/* Logout / Exit Action */}
          <button
            type="button"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5 -scale-x-100" />
          </button>
        </div>

        {/* Ambient background glow inside capsule */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
      </div>
    </aside>
  );
}
