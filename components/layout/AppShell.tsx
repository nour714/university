'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { NotificationToast } from '@/components/notifications/NotificationToast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  // Standalone Full-Screen Auth Pages (no sidebar, no header, no bottom nav)
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-[#070b14]">
        <NotificationToast />
        <main className="flex-1 w-full flex flex-col justify-center">
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

