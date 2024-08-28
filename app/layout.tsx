import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ViewportLayout } from 'next/dist/lib/metadata/types/extra-types';

const inter = Inter({ subsets: [ 'latin' ] });

export const metadata: Metadata = {
  title: 'Todo',
  description: 'Basic Todo App',
  manifest: '/manifest.json',
};

export const viewport: ViewportLayout = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-dvh flex text-lg bg-stone-800">
      <body className={`h-dvh flex flex-1 ${inter.className}`}>{children}</body>
    </html>
  );
}
