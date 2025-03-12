// app/ui/MobileSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, Mail, User, X } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';

const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const toggleSearch = useSearchStore((state) => state.toggleSearch);

  const handleSearchClick = () => {
    toggleSearch();
    onClose(); // 사이드바 닫기
  };

  // 모바일에서는 아이콘과 텍스트를 모두 표시
  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" onClick={onClose} />
      )}

      {/* 사이드바 */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 
        transform transition-transform duration-300 ease-in-out
        md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* 헤더 */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-400 text-white font-bold">
            B
          </div>
          <button onClick={onClose} className="text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* 내비게이션 */}
        <nav className="p-4">
          <Link href="/" className="block py-3 flex items-center">
            <Home size={24} className={pathname === '/' ? 'text-emerald-500' : 'text-gray-800'} />
            <span className="ml-4 text-gray-900">홈</span>
          </Link>

          <button onClick={handleSearchClick} className="w-full py-3 flex items-center text-left">
            <Search size={24} className="text-gray-800" />
            <span className="ml-4 text-gray-900">탐색하기</span>
          </button>

          <Link href="/notifications" className="block py-3 flex items-center">
            <Bell
              size={24}
              className={pathname === '/notifications' ? 'text-emerald-500' : 'text-gray-800'}
            />
            <span className="ml-4 text-gray-900">알림</span>
          </Link>

          {/* <Link href="/messages" className="block py-3 flex items-center">
            <Mail
              size={24}
              className={pathname === '/messages' ? 'text-emerald-500' : 'text-gray-800'}
            />
            <span className="ml-4 text-gray-900">메시지</span>
          </Link> */}

          <Link href="/user-info" className="block py-3 flex items-center">
            <User
              size={24}
              className={pathname === '/user-info' ? 'text-emerald-500' : 'text-gray-800'}
            />
            <span className="ml-4 text-gray-900">프로필</span>
          </Link>
        </nav>
      </div>
    </>
  );
};

export default MobileSidebar;
