// app/ui/LoadingModal.tsx
'use client';
import { Brain } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  step: 'extracting' | 'analyzing' | 'completed'; // 실제 진행 단계 추가
  extractedData?: {
    title?: string;
    imageUrl?: string;
  };
  onContinueInBackground?: () => void; // 백그라운드 처리 옵션 추가
  autoBackgroundDelay?: number; // 자동 백그라운드 처리 지연 시간 (ms) - 기본값 3000ms
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  step,
  extractedData,
  onContinueInBackground,
  autoBackgroundDelay = 2000, // 기본값 2초
}) => {
  const [showExtendedMessage, setShowExtendedMessage] = useState(false);
  const backgroundTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 단계별 메시지 정의
  const steps: Record<string, { title: string; description: string }[]> = {
    extracting: [
      { title: '초기화 중...', description: '데이터를 준비하고 있어요' },
      { title: 'URL 확인 중...', description: '콘텐츠 위치를 확인하고 있어요' },
      { title: '콘텐츠 추출 중...', description: '유용한 정보를 추출하고 있어요' },
    ],
    analyzing: [
      { title: '내용 분석 중...', description: '글의 구조를 파악하고 있어요' },
      { title: '핵심 정리 중...', description: '중요한 내용을 찾고 있어요' },
      { title: '요약 생성 중...', description: '핵심 메시지를 정리하고 있어요' },
      { title: '최종 정리 중...', description: '결과물을 완성하고 있어요' },
    ],
    completed: [{ title: '처리 완료!', description: '메모가 성공적으로 생성되었습니다' }],
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStepList = steps[step] || [];

  // 자동 백그라운드 처리 타이머 설정
  useEffect(() => {
    // 모달이 열려있고, 백그라운드 처리 함수가 있으며, 진행 중인 단계일 때만 타이머 설정
    if (isOpen && onContinueInBackground && (step === 'extracting' || step === 'analyzing')) {
      // 이전 타이머가 있다면 정리
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }

      // 새 타이머 설정
      backgroundTimerRef.current = setTimeout(() => {
        console.log('자동 백그라운드 처리 시작');
        onContinueInBackground();
      }, autoBackgroundDelay);
    }

    // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 정리
    return () => {
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
        backgroundTimerRef.current = null;
      }
    };
  }, [isOpen, step, onContinueInBackground, autoBackgroundDelay]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setShowExtendedMessage(false);
      return;
    }

    // 단계가 변경되면 인덱스 초기화
    setCurrentStepIndex(0);

    // 단계 내에서 인덱스 진행
    const intervalId = setInterval(() => {
      setCurrentStepIndex((prevStep) => {
        if (prevStep >= currentStepList.length - 1) {
          clearInterval(intervalId);
          setShowExtendedMessage(true);
          return prevStep;
        }
        return prevStep + 1;
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isOpen, step, currentStepList.length]);

  if (!isOpen) return null;

  // 백그라운드 처리 버튼 클릭 핸들러
  const handleBackgroundClick = () => {
    // 타이머 취소
    if (backgroundTimerRef.current) {
      clearTimeout(backgroundTimerRef.current);
      backgroundTimerRef.current = null;
    }

    // 백그라운드 처리 함수 호출
    if (onContinueInBackground) {
      onContinueInBackground();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-2xl w-full max-w-md py-8 px-6 shadow-lg flex flex-col items-center">
        {/* 애니메이션 부분은 기존과 동일 */}
        <div className="w-20 h-20 relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-[3px] border-gray-200 border-t-gray-500 animate-spin opacity-80"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain size={32} className="text-gray-500 animate-pulse" />
          </div>
        </div>

        {/* 단계별 콘텐츠: 추출 완료 후 미리보기 추가 */}
        {step === 'analyzing' && extractedData && (
          <div className="mb-6 w-full max-w-xs">
            {extractedData.title && (
              <h4 className="text-sm font-medium text-gray-700 mb-2">{extractedData.title}</h4>
            )}
            {extractedData.imageUrl && (
              <img
                src={extractedData.imageUrl}
                alt="콘텐츠 미리보기"
                className="w-full h-28 object-cover rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // 이미지 로드 실패 시 대체 이미지나 에러 처리
                  console.log('이미지 로드 실패:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        )}

        {/* 현재 단계 메시지 */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-medium text-gray-900 mb-2 tracking-tight">
            {showExtendedMessage
              ? '조금만 더 기다려 주세요'
              : currentStepList[currentStepIndex]?.title || '처리 중...'}
          </h3>
          <p className="text-sm text-gray-500 font-light tracking-wide">
            {showExtendedMessage
              ? '거의 완성됐어요!'
              : currentStepList[currentStepIndex]?.description || ''}
          </p>
        </div>

        {/* 진행바 */}
        <div className="w-full max-w-xs mb-4">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-500 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / currentStepList.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* 단계 표시 */}
        <div className="text-xs text-gray-400 font-light mb-6">
          {currentStepIndex + 1} / {currentStepList.length}
        </div>

        {/* 배경에서 계속 버튼 - 분석 단계에서만 표시 */}
        {(step === 'analyzing' || step === 'extracting') && onContinueInBackground && (
          <button
            onClick={handleBackgroundClick}
            className="p-4 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md text-gray-100"
          >
            백그라운드에서 처리하기
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;
