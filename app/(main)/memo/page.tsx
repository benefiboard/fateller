//app/(main)/memo/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/userStore';
import MemoPageContent from './MemoPageContent';

export default function Page() {
  const router = useRouter();
  const { currentUser, isInitialized } = useUserStore();

  useEffect(() => {
    if (isInitialized && !currentUser) {
      router.push('/auth');
    }
  }, [currentUser, isInitialized, router]);

  // 로딩 상태 표시
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-500">초기화 중...</p>
      </div>
    );
  }

  // 인증되지 않은 경우 (리디렉션 전 로딩 표시)
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-500">로그인 페이지로 이동 중...</p>
      </div>
    );
  }

  // 인증된 경우에만 메모 페이지 표시
  return <MemoPageContent />;
}
