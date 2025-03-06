// app/ui/BottomNavigation.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Bell, Mail, MessageCircle } from 'lucide-react';

const BottomNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  // 네비게이션 항목 정의
  const navItems = [
    { icon: <Home size={24} />, path: '/', label: '홈' },
    { icon: <Search size={24} />, path: '/explore', label: '탐색' },
    { icon: <Bell size={24} />, path: '/notifications', label: '알림' },
    { icon: <Mail size={24} />, path: '/messages', label: '메시지' },
  ];

  // 메모 작성 버튼 클릭 처리
  const handleComposeClick = () => {
    // 메모 작성 페이지로 이동하거나 모달 열기
    router.push('/compose');
  };

  return (
    <>
      {/* 하단 네비게이션 바 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around py-3 border-t border-gray-200 bg-white z-20">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`flex items-center justify-center ${
              pathname === item.path ? 'text-emerald-400' : 'text-gray-500'
            }`}
            aria-label={item.label}
          >
            {item.icon}
          </Link>
        ))}
      </div>

      {/* 플로팅 메모 작성 버튼 */}
      <div className="fixed right-4 bottom-20 md:hidden z-30">
        <button
          onClick={handleComposeClick}
          className="w-14 h-14 bg-emerald-400 hover:bg-emerald-500 rounded-full flex items-center justify-center shadow-lg text-white"
          aria-label="새 메모 작성"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    </>
  );
};

export default BottomNavigation;
