import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

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
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${cairo.className} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${cairo.className} min-h-full flex flex-col bg-[#f8fafc] text-slate-900`}>
        <NotificationProvider>
          <AppShell>
            {children}
          </AppShell>
        </NotificationProvider>
      </body>
    </html>
  );
}
