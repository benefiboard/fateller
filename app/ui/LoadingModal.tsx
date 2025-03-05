'use client';

import { Brain } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-2xl w-full max-w-md py-8 px-6 shadow-lg flex flex-col items-center">
        {/* 애플 스타일 로딩 아이콘 */}
        <div className="w-20 h-20 relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* 그라데이션 링 애니메이션 */}
            <div className="w-16 h-16 rounded-full border-[3px] border-gray-200 border-t-gray-500 animate-spin opacity-80"></div>
          </div>
          {/* 애니메이션 중앙 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain size={32} className="text-gray-500 animate-pulse" />
          </div>
        </div>

        {/* 현재 단계 타이틀 및 설명 - 애플의 SF Pro Display 스타일 폰트 */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-2 tracking-tight">
            {showExtendedMessage ? '조금만 더 기다려 주세요' : steps[currentStep].title}
          </h3>
          <p className="text-sm text-gray-500 font-light tracking-wide">
            {showExtendedMessage ? '거의 완성됐어요!' : steps[currentStep].description}
          </p>
        </div>

        {/* 단계 진행 바 - 애플의 선형 진행 표시 스타일 */}
        <div className="w-full max-w-xs mb-4">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 단계 번호 - 미니멀한 스타일 */}
        <div className="text-xs text-gray-400 font-light">
          {currentStep + 1} / {steps.length}
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
