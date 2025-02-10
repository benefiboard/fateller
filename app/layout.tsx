//app/layout.tsx
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
import BrowserRedirect from './layout-component/BrowserRedirect';
import BottomNav from './BottomNav';

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
  title: 'Benefipic - 찍으면 끝나는 식단관리',
  description: '찍는 순간 시작되는 내 몸의 변화',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    title: 'benefipic',
    statusBarStyle: 'default',
    capable: true,
  },
  applicationName: 'benefipic',
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Benefipic',
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* <MobileDetector> */}
        <div className="min-h-screen  ">
          <div className="relative pb-20  max-w-[480px] flex flex-col mx-auto bg-white border border-gray-200 min-h-screen">
            {children}
            <StoreInitializer currentUser={currentUser} />
            <MysticSymbolsEffect />
          </div>
          <BottomNav />
        </div>
        {/* <BrowserRedirect />
        </MobileDetector> */}
        <AnalyticsTracker currentUser={currentUser} />
        <SpeedInsights />
      </body>
    </html>
  );
}
