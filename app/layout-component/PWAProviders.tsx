'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// PWA 컴포넌트 동적 임포트 (클라이언트 사이드에서만 실행)
const InstallPrompt = dynamic(() => import('@/components/pwa/InstallPrompt'), {
  ssr: false,
});

const OfflineStatus = dynamic(() => import('@/components/pwa/OfflineStatus'), {
  ssr: false,
});

export function PWAProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* PWA 관련 컴포넌트들 */}
      <InstallPrompt />
      <OfflineStatus />
    </>
  );
}
