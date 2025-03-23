'use client';

import { useState, useEffect } from 'react';
import { useCreditStore } from '../store/creditStore';
import { useUserStore } from '../store/userStore';

export default function CreditDisplay() {
  const { currentUser } = useUserStore();
  const { creditsRemaining, isLoading, fetchCredits } = useCreditStore();
  const [, setForceUpdate] = useState(0);

  // 초기 로드
  useEffect(() => {
    if (currentUser) {
      fetchCredits();
    }
  }, [currentUser, fetchCredits]);

  // 강제 업데이트를 위한 이벤트 리스너
  useEffect(() => {
    const handleForceUpdate = () => {
      console.log('크레딧 강제 업데이트 트리거됨');
      setForceUpdate((prev) => prev + 1);
    };

    window.addEventListener('credit-force-update', handleForceUpdate);
    return () => window.removeEventListener('credit-force-update', handleForceUpdate);
  }, []);

  // 로깅 추가 (디버깅용)
  console.log('CreditDisplay 렌더링:', creditsRemaining);

  return (
    <div className="flex items-center px-1 py-1 rounded-full">
      <span className={`font-bold ${creditsRemaining < 3 ? 'text-red-500' : 'text-teal-500'}`}>
        {isLoading ? '...' : creditsRemaining}
      </span>
      <span className="text-xs text-gray-500">/15</span>
    </div>
  );
}
