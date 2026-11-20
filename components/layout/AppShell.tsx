'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { NotificationToast } from '@/components/notifications/NotificationToast';

const PROTECTED_PREFIXES = ['/courses', '/exams', '/codes', '/settings', '/account', '/notifications'];

function isRouteProtected(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === '/' ||
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    )
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/account/change-password' ||
    pathname.startsWith('/account/change-password/');
  const isExamSession = pathname?.startsWith('/exams/') && pathname !== '/exams';
  const isProtected = isRouteProtected(pathname);

  // Standalone Full-Screen Pages (Auth)
  if (isAuthPage) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-slate-900 text-slate-100 justify-center">
        <NotificationToast />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full flex flex-col outline-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Standalone Public / Non-Protected / 404 Pages
  if (!isProtected) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-[#f8fafc] text-slate-900 justify-center">
        <NotificationToast />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full flex flex-col outline-hidden justify-center items-center">
          {children}
        </main>
      </div>
    );
  }

  // Distraction-Free Exam Hall
  if (isExamSession) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col">
        <NotificationToast />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full flex flex-col outline-hidden">
          {children}
        </main>
      </div>
    );
  }

  // Standard Academic Platform Layout
  return (
    <div className="min-h-full flex flex-row bg-[#f8fafc] text-slate-900 w-full">
      {/* Real-time Global Academic Toast Banner */}
      <NotificationToast />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 p-3 sm:p-6 lg:p-8 pb-28 sm:pb-24 lg:pb-8 max-w-7xl w-full mx-auto outline-hidden">
          {children}
        </main>
        {/* Floating Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </div>
  );
}

