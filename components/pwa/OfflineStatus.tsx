'use client';

import React, { useState, useEffect } from 'react';

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    // 온라인/오프라인 상태 변경 이벤트 리스너
    const handleOnline = () => {
      setIsOnline(true);
      // 온라인으로 변경 시 메시지 표시
      if (!navigator.onLine) {
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 메시지가 표시되지 않으면 렌더링하지 않음
  if (!showMessage) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-3 rounded-lg shadow-md transition-all duration-300 z-50 ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {isOnline ? (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span>온라인 상태로 전환되었습니다</span>
          <button
            onClick={() => setShowMessage(false)}
            className="ml-2 text-green-800 hover:text-green-900"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          <span>오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.</span>
          <button
            onClick={() => setShowMessage(false)}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
