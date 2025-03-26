'use client'; // 클라이언트 컴포넌트로 변환

import React from 'react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <svg
        className="w-16 h-16 mb-4 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.072m-3.183 3.536a1.5 1.5 0 11-2.121-2.121"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <line
          strokeLinecap="round"
          strokeWidth={1.5}
          x1="4"
          y1="20"
          x2="20"
          y2="4"
          stroke="currentColor"
        />
      </svg>

      <h1 className="text-2xl font-bold mb-4">인터넷 연결 끊김</h1>
      <p className="mb-6">현재 오프라인 상태입니다. 인터넷 연결을 확인해주세요.</p>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 max-w-md">
        <p className="text-sm">
          BrainLabeling은 오프라인 모드에서도 이전에 저장한 콘텐츠를 확인할 수 있습니다. 하지만
          새로운 콘텐츠를 추가하거나 분석하려면 인터넷 연결이 필요합니다.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        새로고침
      </button>
    </div>
  );
}
