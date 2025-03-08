// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { getUser } from '@/lib/supabse/server';
import { headers } from 'next/headers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import StoreInitializer from './layout-component/StoreInitializer';
import MysticSymbolsEffect from './layout-component/BubbleEffect/MysticSymbolsEffect';
import AnalyticsTracker from './layout-component/AnalyticsTracker';
import MobileDetector from './layout-component/MobileDetector';
import LeftSidebar from './ui/LeftSidebar';
import RightSidebar from './ui/RightSidebar';
import BottomNavigation from './ui/BottomNavigation';
import Header from './ui/Header';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'BrainLabel - 메모 AI 분석 및 관리',
  description: '찍으면 끝나는 메모 관리',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    title: 'BrainLabel',
    statusBarStyle: 'default',
    capable: true,
  },
  applicationName: 'BrainLabel',
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'BrainLabel',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getUser();
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const hiddenNavPaths = ['/start', '/question', '/food/input/photo'];
  const shouldShowNav = !hiddenNavPaths.includes(pathname);

  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}>
        {/* <MobileDetector> */}
        {/* X 스타일 레이아웃 */}
        <div className="min-h-screen flex justify-center">
          {/* 전체 레이아웃 컨테이너 */}
          <div className="flex w-full max-w-7xl">
            {/* 왼쪽 사이드바 - 모바일에서는 숨김, 태블릿/데스크탑에서 보임 */}
            <div className="hidden md:block md:w-[68px] lg:w-[275px] h-screen sticky top-0 border-r border-gray-200">
              <LeftSidebar minimized={false} />
            </div>

            {/* 메인 컨텐츠 영역 */}
            <main className="flex-1 min-h-screen max-w-md w-full mx-auto border-x border-gray-200 relative">
              {/* 메인 컨텐츠 */}
              {children}

              {/* 모바일 전용 하단 네비게이션 - 태블릿/데스크탑에서는 숨김 */}
              {/* {shouldShowNav && (
                  <div className="md:hidden">
                    <BottomNavigation />
                  </div>
                )} */}
            </main>

            {/* 오른쪽 사이드바 - 데스크탑에서만 보임 */}
            <div className="hidden lg:block w-[350px] h-screen sticky top-0 pl-4">
              <RightSidebar />
            </div>
          </div>
        </div>

        <StoreInitializer currentUser={currentUser} />
        <MysticSymbolsEffect />
        {/* </MobileDetector> */}
        <AnalyticsTracker currentUser={currentUser} />
        <SpeedInsights />
      </body>
    </html>
  );
}
