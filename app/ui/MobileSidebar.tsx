// app/ui/MobileSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  X,
  BookUser,
  PanelsTopLeft,
  ShieldPlus,
} from 'lucide-react';
import { useSearchStore } from '../store/searchStore';
import { useUserStore } from '../store/userStore';
import InstallButton from './InstallButton';

const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const toggleSearch = useSearchStore((state) => state.toggleSearch);

  const { currentUser, isInitialized } = useUserStore();

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

          <Link href="/auth" className="block py-3 flex items-center">
            <User
              size={24}
              className={pathname === '/auth' ? 'text-emerald-500' : 'text-gray-800'}
            />
            <span className="ml-4 text-gray-900">프로필</span>
          </Link>
          <Link href="/blog" className="block py-3 flex items-center">
            <PanelsTopLeft
              size={24}
              className={pathname === '/blog' ? 'text-emerald-500' : 'text-gray-800'}
            />
            <span className="ml-4 text-gray-900">블로그</span>
          </Link>
          <Link href="/introduce" className="block py-3 flex items-center">
            <BookUser
              size={24}
              className={pathname === '/introduce' ? 'text-emerald-500' : 'text-gray-800'}
            />
            <span className="ml-4 text-gray-900">서비스 소개</span>
          </Link>

          <div className="w-full pt-4 mt-8 border-t border-gray-200">
            <InstallButton />
          </div>

          {(currentUser?.email === 'hjdh59@gmail.com' ||
            currentUser?.email === 'benefiboard@gmail.com') && (
            <Link href="/admin/blog" className="block py-3 flex items-center">
              <ShieldPlus
                size={24}
                className={pathname === '/admin/blog' ? 'text-emerald-500' : 'text-gray-800'}
              />
              <span className="ml-4 text-gray-900">관리자 모드</span>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
};

export default MobileSidebar;
