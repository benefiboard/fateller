// app/memo/ui/LoadingModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);

  const steps = [
    { title: '초기화 중...', description: '데이터를 준비하고 있어요' },
    { title: 'URL 확인 중...', description: '콘텐츠 위치를 확인하고 있어요' },
    { title: '콘텐츠 추출 중...', description: '유용한 정보를 추출하고 있어요' },
    { title: '내용 분석 중...', description: '글의 구조를 파악하고 있어요' },
    { title: '핵심 정리 중...', description: '중요한 내용을 찾고 있어요' },
    { title: '요약 생성 중...', description: '핵심 메시지를 정리하고 있어요' },
    { title: '최종 정리 중...', description: '결과물을 완성하고 있어요' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setShowExtendedMessage(false);
      return;
    }

    // 2초마다 다음 단계로 진행
    const intervalId = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep >= steps.length - 1) {
          clearInterval(intervalId);
          setShowExtendedMessage(true);
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 2000);

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(intervalId);
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md py-8 px-6 flex flex-col items-center">
        {/* 로딩 아이콘 */}
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-teal-500">🧠</span>
          </div>
        </div>

        {/* 현재 단계 타이틀 및 설명 */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {showExtendedMessage ? '조금만 더 기다려 주세요' : steps[currentStep].title}
          </h3>
          <p className="text-sm text-gray-600">
            {showExtendedMessage ? '거의 완성됐어요!' : steps[currentStep].description}
          </p>
        </div>

        {/* 단계 표시기 */}
        <div className="flex space-x-2 mb-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep
                  ? 'bg-teal-500'
                  : index < currentStep
                  ? 'bg-teal-300'
                  : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>

        {/* 단계 번호 */}
        <div className="text-xs text-gray-400">
          단계 {currentStep + 1}/{steps.length}
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
