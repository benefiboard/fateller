//app/ui/InstallButton.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface InstallButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function InstallButton({ className, children }: InstallButtonProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [installEvent, setInstallEvent] = useState<any>(null);

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // 브라우저 기본 설치 프롬프트 방지
      e.preventDefault();

      // 설치 이벤트 저장
      setInstallEvent(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installEvent) return;

    try {
      // 로컬 스토리지의 일주일 타이머 제거 (InstallPrompt에서 사용하는 타이머)
      localStorage.removeItem('installPromptDismissedAt');

      // 설치 프롬프트 직접 표시
      installEvent.prompt();

      // 사용자 선택 대기
      const choiceResult = await installEvent.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('사용자가 앱 설치를 수락했습니다');
      } else {
        console.log('사용자가 앱 설치를 거부했습니다');
      }

      setInstallEvent(null);
      setCanInstall(false);
    } catch (error) {
      console.error('설치 프로세스 오류:', error);
    }
  };

  // 설치할 수 없으면 버튼을 표시하지 않음
  if (!canInstall) return null;

  return (
    <button
      onClick={handleInstallClick}
      className={
        className ||
        'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm flex items-center'
      }
      disabled={!canInstall} // 설치할 수 없으면 비활성화
    >
      {children || (
        <>
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
          앱 설치하기
        </>
      )}
    </button>
  );
}
