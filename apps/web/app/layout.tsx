import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ماجراجویی ریاضی — گام‌های کوچک، یادگیری عمیق',
  description: 'پلتفرم آموزش تعاملی ریاضی دبستان بر پایه رویکرد شناختی و یادگیری اختصاصی',
  openGraph: {
    title: 'ماجراجویی ریاضی — گام‌های کوچک، یادگیری عمیق',
    description: 'پلتفرم آموزش تعاملی ریاضی دبستان بر پایه رویکرد شناختی و یادگیری اختصاصی',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
