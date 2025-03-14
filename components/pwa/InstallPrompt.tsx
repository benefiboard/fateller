'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // 브라우저 기본 설치 프롬프트 방지
      e.preventDefault();
      // 이벤트 저장
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
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
  };

  if (isAppInstalled || !installPrompt) return null;

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 max-w-xs z-50 border border-gray-200">
      <h3 className="font-semibold mb-2 text-center">BrainLabel 앱 설치하기</h3>
      <p className="text-sm mb-3 text-center">
        설치하면 더 빠르게 접근하고 오프라인에서도 사용할 수 있습니다.
      </p>
      <div className="flex justify-between">
        <button onClick={() => setInstallPrompt(null)} className="text-gray-600 text-sm px-3 py-1">
          나중에
        </button>
        <button
          onClick={handleInstallClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          설치하기
        </button>
      </div>
    </div>
  );
}
