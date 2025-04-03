//app/(main)/layout.tsx

import { getUser } from '@/lib/supabse/server';
import StoreInitializer from '../layout-component/StoreInitializer';
import AnalyticsTracker from '../layout-component/AnalyticsTracker';
import LeftSidebar from '../ui/LeftSidebar';
import RightSidebar from '../ui/RightSidebar';
import { PWAProviders } from '../layout-component/PWAProviders';
import { headers } from 'next/headers';

/**
 * 대시보드 레이아웃 - 메인 앱 UI에 사용되는 레이아웃
 * 사이드바, 메뉴, 앱 기능 컴포넌트를 포함
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getUser();
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  const hiddenNavPaths = ['/start', '/question', '/food/input/photo'];
  const shouldShowNav = !hiddenNavPaths.includes(pathname);

  return (
    <PWAProviders>
      {/* X 스타일 레이아웃 */}
      <div className="min-h-screen flex justify-center bg-white">
        {/* 전체 레이아웃 컨테이너 */}
        <div className="flex w-full max-w-7xl">
          {/* 왼쪽 사이드바 - 모바일에서는 숨김, 태블릿/데스크탑에서 보임 */}
          <div className="hidden md:block md:w-[68px] lg:w-[275px] h-screen sticky top-0">
            <LeftSidebar minimized={false} />
          </div>

          {/* 메인 컨텐츠 영역 */}
          <main className="flex-1 min-h-screen max-w-2xl w-full mx-auto border-x border-gray-200 relative">
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
          <div className="hidden xl:block w-[350px] h-screen sticky top-0 pl-4">
            <RightSidebar />
          </div>
        </div>
      </div>

      <StoreInitializer currentUser={currentUser} />

      <AnalyticsTracker currentUser={currentUser} />
    </PWAProviders>
  );
}
