'use client';

import React, { useState, useEffect } from 'react'; // React 추가
import { useCreditStore } from '../store/creditStore';
import { useUserStore } from '../store/userStore';

// React.memo로 컴포넌트 래핑
const CreditDisplay = React.memo(function CreditDisplay() {
  // 최적화된 셀렉터 사용
  const currentUser = useUserStore((state) => state.currentUser);
  const creditsRemaining = useCreditStore((state) => state.creditsRemaining);
  const isLoading = useCreditStore((state) => state.isLoading);
  const fetchCredits = useCreditStore((state) => state.fetchCredits);

  const [, setForceUpdate] = useState(0);

  // 초기 로드
  useEffect(() => {
    if (currentUser) {
      fetchCredits();
    }
  }, [currentUser, fetchCredits]);

  // 강제 업데이트를 위한 이벤트 리스너
  // useEffect(() => {
  //   const handleForceUpdate = () => {
  //     console.log('크레딧 강제 업데이트 트리거됨');
  //     setForceUpdate((prev) => prev + 1);
  //   };

  //   window.addEventListener('credit-force-update', handleForceUpdate);
  //   return () => window.removeEventListener('credit-force-update', handleForceUpdate);
  // }, []);

  // 개발 환경에서만 로그 출력하도록 제한
  if (process.env.NODE_ENV === 'development') {
    console.log('CreditDisplay 렌더링:', creditsRemaining);
  }

  return (
    <div className="flex items-center px-1 py-1 rounded-full">
      <span className={`font-bold ${creditsRemaining < 3 ? 'text-red-500' : 'text-teal-500'}`}>
        {isLoading ? '...' : creditsRemaining}
      </span>
      <span className="text-xs text-gray-500">/15</span>
    </div>
  );
});

export default CreditDisplay;
