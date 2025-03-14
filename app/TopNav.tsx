//app/TopNav.tsx

'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface TopNavProps {
  title: string;
  subTitle?: string;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void; // onBack을 선택적으로 변경
  rightContent?: React.ReactNode;
  className?: string;
}

export default function TopNav({
  title,
  subTitle,
  currentStep,
  totalSteps,
  onBack,
  rightContent,
  className = '',
}: TopNavProps) {
  const router = useRouter();
  const showSteps = currentStep !== undefined && totalSteps !== undefined;

  // onBack prop이 있으면 그것을 사용하고, 없으면 router.back() 사용
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white border-b ${className}`}>
      <div className="flex items-center justify-between max-w-lg mx-auto p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-semibold">
            {title}
            {subTitle && <span className="text-sm text-gray-600 font-normal"> - {subTitle}</span>}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {showSteps && (
            <span className="text-sm text-gray-500">
              {currentStep}/{totalSteps}
            </span>
          )}
          {rightContent}
        </div>
      </div>
    </nav>
  );
}
