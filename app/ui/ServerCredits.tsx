// app/components/ServerCredits.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/store/userStore';

export default function ServerCredits() {
  const { currentUser } = useUserStore();
  const [credits, setCredits] = useState({ remaining: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchCredits = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/credits');
        if (response.ok) {
          const data = await response.json();
          setCredits({ remaining: data.remaining });
        }
      } catch (error) {
        console.error('크레딧 정보를 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();

    // 1분마다 크레딧 정보 갱신
    const interval = setInterval(fetchCredits, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (loading) {
    return <div className="text-xs text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
      <span className="text-sm font-medium">크레딧:</span>
      <span
        className={`text-sm font-bold ${credits.remaining < 3 ? 'text-red-500' : 'text-teal-500'}`}
      >
        {credits.remaining}
      </span>
      <span className="text-xs text-gray-500">/ 10</span>
    </div>
  );
}
