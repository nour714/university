import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/context/NotificationContext';
import { AppShell } from '@/components/layout/AppShell';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'كلية الذكاء الاصطناعي | مكتبة المقررات الأكاديمية',
  description: 'المنصة الرقمية لكلية الذكاء الاصطناعي - تصفح المقررات، المحاضرات، التمارين، والوسائط التعليمية بسرعة وأداء فائق.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
        <NotificationProvider>
          <AppShell>
            {children}
          </AppShell>
        </NotificationProvider>
      </body>
    </html>
  );
}
