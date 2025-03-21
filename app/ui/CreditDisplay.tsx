'use client';

import { useState, useEffect } from 'react';
import { useCreditStore } from '../store/creditStore';
import { useUserStore } from '../store/userStore';

export default function CreditDisplay() {
  const { currentUser } = useUserStore();
  const { creditsRemaining, isLoading, fetchCredits } = useCreditStore();

  // 강제 리렌더링을 위한 상태
  const [forceUpdate, setForceUpdate] = useState(0);

  // 크레딧 변경 이벤트 리스너 추가
  useEffect(() => {
    const handleCreditUpdate = () => {
      console.log('크레딧 변경 이벤트 감지: UI 갱신');
      setForceUpdate((prev) => prev + 1); // 강제 리렌더링
    };

    window.addEventListener('credit-updated', handleCreditUpdate);
    return () => window.removeEventListener('credit-updated', handleCreditUpdate);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCredits();
    }
  }, [currentUser, fetchCredits]);

  if (!currentUser) return null;

  return (
    <div className="flex items-center px-1 py-1 rounded-full">
      <span className={`font-bold ${creditsRemaining < 3 ? 'text-red-500' : 'text-teal-500'}`}>
        {isLoading ? '...' : creditsRemaining}
      </span>
      <span className="text-xs text-gray-500">/15</span>
    </div>
  );
}
