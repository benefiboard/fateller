//app/layout.tsx

import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import MysticSymbolsEffect from './layout-component/BubbleEffect/MysticSymbolsEffect';

// 폰트 설정
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

// 공통 뷰포트 설정
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

// 공통 메타데이터
const APP_NAME = 'BrainLabeling';
const APP_DESCRIPTION = '아이디어 관리, AI가 자동으로 분석하고 연결합니다';

export const metadata: Metadata = {
  title: 'BrainLabeling',
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

/**
 * 루트 레이아웃 - 전체 앱에 공통으로 적용되는 최소한의 레이아웃
 * 여기에는 폰트, 기본 HTML/body 구조, 분석 도구만 포함
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
        <MysticSymbolsEffect />
      </body>
    </html>
  );
}
