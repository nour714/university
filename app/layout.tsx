import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/context/NotificationContext';
import { AppShell } from '@/components/layout/AppShell';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'كلية الذكاء الاصطناعي - جامعة كفر الشيخ | مكتبة المقررات الأكاديمية',
  description: 'المنصة الرقمية لكلية الذكاء الاصطناعي بجامعة كفر الشيخ - تصفح المقررات، المحاضرات، التمارين، والوسائط التعليمية بسرعة وأداء فائق.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${cairo.className} h-full antialiased`}>
      <body className={`${cairo.className} min-h-full flex flex-col bg-[#f8fafc] text-slate-900`}>
        {/* Skip to Main Content Link (WCAG 2.1 AA) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-blue-600 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-hidden transition-all"
        >
          تخطي إلى المحتوى الرئيسي
        </a>
        <NotificationProvider>
          <AppShell>
            {children}
          </AppShell>
        </NotificationProvider>
      </body>
    </html>
  );
}
