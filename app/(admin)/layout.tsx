import { getUser } from '@/lib/supabse/server';
import StoreInitializer from '@/app/layout-component/StoreInitializer';
import AnalyticsTracker from '@/app/layout-component/AnalyticsTracker';
import { PWAProviders } from '@/app/layout-component/PWAProviders';
import { redirect } from 'next/navigation';

// 관리자 이메일 목록
const ADMIN_EMAILS = ['benefiboard@gmail.com', 'hjdh59@gmail.com']; // 여기에 실제 관리자 이메일을 넣으세요

/**
 * 관리자 레이아웃
 * 관리자 페이지에 대한 레이아웃 및 인증 처리
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 서버에서 사용자 정보 가져오기
  const currentUser = await getUser();

  // 로그인 확인
  if (!currentUser) {
    redirect('/auth');
  }

  // 관리자 권한 확인
  const isAdmin = currentUser.email && ADMIN_EMAILS.includes(currentUser.email);
  if (!isAdmin) {
    redirect('/memo'); // 권한 없으면 메모 페이지로 리디렉션
  }

  return (
    <PWAProviders>
      <div className="min-h-screen bg-gray-50">
        {/* 관리자 레이아웃 컨테이너 */}
        <div className="w-full">
          {/* 메인 컨텐츠 영역 */}
          <main className="w-full mx-auto">{children}</main>
        </div>
      </div>

      {/* 이 부분이 중요: 스토어 초기화 */}
      <StoreInitializer currentUser={currentUser} />

      <AnalyticsTracker currentUser={currentUser} />
    </PWAProviders>
  );
}
