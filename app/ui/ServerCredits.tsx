// app/components/ServerCredits.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/store/userStore';
import { useCreditStore } from '@/app/store/creditStore';

export default function ServerCredits() {
  const { currentUser } = useUserStore();
  const { creditsRemaining, isLoading, fetchCredits } = useCreditStore();

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (!currentUser) return;

    // 앱 초기 로딩 시 크레딧 정보 가져오기
    fetchCredits();

    // 날짜 변경 확인 (자정 이후 자동 갱신을 위한 설정)
    const checkDateChange = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastCheckedDay = localStorage.getItem('lastCheckedCreditsDay') || '';

      if (today !== lastCheckedDay) {
        localStorage.setItem('lastCheckedCreditsDay', today);
        fetchCredits(); // 날짜가 바뀌었을 때 갱신
      }
    };

    // 30분마다 날짜 변경 확인 (1분마다 확인하는 것보다 훨씬 가벼움)
    const dateCheckInterval = setInterval(checkDateChange, 30 * 60 * 1000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(dateCheckInterval);
  }, [currentUser, fetchCredits]);

  if (!currentUser) return null;

  return (
    <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
      <span className="text-sm font-medium">크레딧:</span>
      <span
        className={`text-sm font-bold ${creditsRemaining < 3 ? 'text-red-500' : 'text-teal-500'}`}
      >
        {isLoading ? '...' : creditsRemaining}
      </span>
      <span className="text-xs text-gray-500">/ 10</span>
    </div>
  );
}
