'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
      return;
    }

    // 로컬 스토리지에서 마지막으로 프롬프트를 닫은 날짜 확인
    const dismissedAt = localStorage.getItem('installPromptDismissedAt');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const currentDate = new Date();

      // 일주일(7일) 계산 (밀리초로 변환)
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

      // 일주일이 지나지 않았으면 프롬프트를 표시하지 않음
      if (currentDate.getTime() - dismissedDate.getTime() < oneWeekInMs) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // 브라우저 기본 설치 프롬프트 방지
      e.preventDefault();
      // 이벤트 저장
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // 0.5초 후에 표시 (페이지 로드 후 즉시 표시되는 것 방지)
      setTimeout(() => setIsVisible(true), 500);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // 설치 프롬프트 표시
    await installPrompt.prompt();

    // 사용자 선택 결과 확인
    const choiceResult = await installPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('사용자가 앱 설치를 수락했습니다');
    } else {
      console.log('사용자가 앱 설치를 거부했습니다');
    }

    // 설치 프롬프트 초기화
    setInstallPrompt(null);
    setIsVisible(false);
  };

  // 프롬프트 숨기기 - 현재 날짜를 로컬 스토리지에 저장
  const hidePrompt = () => {
    // 현재 날짜를 로컬 스토리지에 저장 (일주일간 표시하지 않음)
    const currentDate = new Date().toISOString();
    localStorage.setItem('installPromptDismissedAt', currentDate);
    setIsVisible(false);
  };

  if (isAppInstalled || !installPrompt || !isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="max-w-xs w-full mx-auto bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl transform transition-all"
        style={{
          animation: 'slide-up 0.3s ease-out forwards',
        }}
      >
        {/* 상단 브랜드 영역 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white relative">
          <div className="absolute top-3 right-3">
            <button
              onClick={hidePrompt}
              className="text-white/80 hover:text-white p-1 rounded-full"
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex items-center mb-3">
            {/* 앱 아이콘 */}
            <div className="w-12 h-12 bg-white rounded-xl mr-3 flex items-center justify-center overflow-hidden shadow-md">
              <img
                src="/icons/icon-192x192.png"
                alt="BrainLabeling 아이콘"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-xl">BrainLabeling</h3>
              <p className="text-xs text-white/80">아이디어 AI 분석 및 관리</p>
            </div>
          </div>
        </div>

        {/* 설치 안내 콘텐츠 */}
        <div className="p-5">
          <h4 className="font-medium text-lg text-gray-800 dark:text-white mb-2">앱 설치하기</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            BrainLabeling을 홈 화면에 추가하면 더 빠르게 접근하고 오프라인에서도 사용할 수 있습니다.
          </p>

          {/* 앱 설치 이점 리스트 */}
          <div className="mb-5 space-y-2">
            <div className="flex items-start text-sm">
              <svg
                className="w-5 h-5 text-emerald-500 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">더 빠른 실행 속도</span>
            </div>
            <div className="flex items-start text-sm">
              <svg
                className="w-5 h-5 text-emerald-500 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">오프라인 모드 지원</span>
            </div>
            <div className="flex items-start text-sm">
              <svg
                className="w-5 h-5 text-emerald-500 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">홈 화면에서 바로 접근</span>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-between items-center">
            <button
              onClick={hidePrompt}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium py-2 px-3"
            >
              나중에
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                ></path>
              </svg>
              설치하기
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
