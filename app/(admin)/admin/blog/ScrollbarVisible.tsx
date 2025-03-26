'use client';

import React, { useEffect } from 'react';

export default function ScrollbarVisible({ children }: any) {
  useEffect(() => {
    // 스크롤바 스타일을 재정의하는 스타일 태그 생성
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .scroll-visible::-webkit-scrollbar {
        display: block !important;
        width: 10px !important;
      }
      .scroll-visible::-webkit-scrollbar-thumb {
        background: #888 !important;
        border-radius: 5px !important;
      }
      .scroll-visible {
        scrollbar-width: thin !important;
        -ms-overflow-style: scrollbar !important;
      }
    `;

    // 헤드에 스타일 태그 추가
    document.head.appendChild(styleElement);

    // 컴포넌트 언마운트 시 스타일 태그 제거
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return <div className="scroll-visible min-h-screen bg-gray-50 overflow-y-scroll">{children}</div>;
}
