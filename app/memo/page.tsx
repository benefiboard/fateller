// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';

// 기존에 사용한 훅과 컴포넌트 임포트는 여기에 추가

// 간소화된 MemoPage 컴포넌트
const MemoPage: React.FC = () => {
  // 상태 초기화 - 리디렉션 방지용 플래그
  const [redirectCheck, setRedirectCheck] = useState(false);

  // 사용자 스토어에서 정보 가져오기
  const currentUser = useUserStore((state) => state.currentUser);
  const isInitialized = useUserStore((state) => state.isInitialized);
  const userId = currentUser?.id;

  // 로딩 인디케이터 렌더링 함수
  const renderLoading = () => (
    <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    </div>
  );

  // 로딩 중인 경우
  if (!isInitialized) {
    return renderLoading();
  }

  // 리디렉션 필요한 경우 (비로그인)
  if (!userId && !redirectCheck) {
    // 일회성 함수 호출로 처리
    setTimeout(() => {
      setRedirectCheck(true);
      window.location.href = '/auth';
    }, 0);
    return renderLoading();
  }

  // 이미 리디렉션 중인 경우
  if (!userId && redirectCheck) {
    return <div className="p-5 text-center">인증 페이지로 이동 중...</div>;
  }

  // 정상 로그인 상태 - 실제 컴포넌트 렌더링
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold">로그인 성공 - 사용자 ID: {userId}</h1>
      <p>이제 단계적으로 기능을 복원해보세요</p>
    </div>
  );
};

export default MemoPage;
