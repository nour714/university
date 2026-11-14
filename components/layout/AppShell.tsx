'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { NotificationToast } from '@/components/notifications/NotificationToast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/account/change-password';
  const isExamSession = pathname?.startsWith('/exams/') && pathname !== '/exams';

  // Per-tab session verification:
  // Requires user to have logged in within this specific browser tab.
  // Closing the tab destroys sessionStorage, requiring fresh login upon reopening.
  const [isTabVerified, setIsTabVerified] = useState(false);

  useEffect(() => {
    if (isAuthPage) {
      setIsTabVerified(true);
      return;
    }

    const isActive = sessionStorage.getItem('academic_tab_active');
    if (!isActive) {
      // The tab does not have an active session (tab was closed or opened directly).
      // Redirect to /auth/clear to wipe the cookie and show /login.
      window.location.replace('/auth/clear');
      return;
    }

    setIsTabVerified(true);
  }, [pathname, isAuthPage]);

  // Standalone Full-Screen Pages (Auth)
  if (isAuthPage) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col bg-slate-900 text-slate-100 justify-center">
        <NotificationToast />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  // Prevent flashing protected content before verifying this tab's session
  if (!isTabVerified) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f8fafc]">
        <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Distraction-Free Exam Hall
  if (isExamSession) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col">
        <NotificationToast />
        <main className="flex-1 w-full flex flex-col">
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
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-28 sm:pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
        {/* Floating Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </div>
  );
}

