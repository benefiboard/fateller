// app/components/CreditDisplay.tsx
'use client';

import { useEffect } from 'react';
import { useCreditStore } from '../store/creditStore';
import { useUserStore } from '../store/userStore';

export default function CreditDisplay() {
  const { currentUser } = useUserStore();
  const { creditsRemaining, isLoading, fetchCredits } = useCreditStore();

  useEffect(() => {
    if (currentUser) {
      fetchCredits();
    }
  }, [currentUser, fetchCredits]);

  if (!currentUser) return null;

  return (
    <div className="flex items-center px-1 py-1 rounded-full">
      {/* <span className="text-sm font-medium">크레딧:</span> */}
      <span className={` font-bold ${creditsRemaining < 3 ? 'text-red-500' : 'text-teal-500'}`}>
        {isLoading ? '...' : creditsRemaining}
      </span>
      <span className="text-xs text-gray-500">/10</span>
    </div>
  );
}
