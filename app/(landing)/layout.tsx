import { getUser } from '@/lib/supabse/server';
import StoreInitializer from '../layout-component/StoreInitializer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * 랜딩 페이지 레이아웃
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  // 사용자 정보 가져오기 (서버 컴포넌트)
  const currentUser = await getUser();

  return (
    <div className="marketing-layout">
      {children}

      {/* 중요: StoreInitializer 추가 */}
      <StoreInitializer currentUser={currentUser} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
