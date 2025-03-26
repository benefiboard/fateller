// app/ui/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, Settings, Sparkles, UserCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useSearchStore } from '../store/searchStore';
import MobileSidebar from './MobileSidebar';
import CreditDisplay from './CreditDisplay';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-center relative ${isActive ? 'font-semibold' : 'text-gray-500'}`}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-emerald-400 rounded-full" />
      )}
    </button>
  );
};

const Header = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('for-you');
  const toggleSearch = useSearchStore((state) => state.toggleSearch);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);

  const profile = {
    name: currentUser?.email ? currentUser.email.split('@')[0] : 'BrainLabeling',
    username: currentUser?.username
      ? `@${currentUser.username}`
      : currentUser?.email
      ? `@${currentUser.email.split('@')[0]}`
      : '@BrainLabeling_ai',
    avatar: currentUser?.avatar_url || '/avatar_base.svg',
  };

  // 현재 페이지 제목 결정
  const getPageTitle = () => {
    if (pathname === '/') return '홈';
    if (pathname === '/explore') return '탐색하기';
    if (pathname === '/notifications') return '알림';
    if (pathname === '/messages') return '메시지';
    if (pathname === '/bookmarks') return '북마크';
    if (pathname === '/profile') return '프로필';
    return '';
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <header className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm z-10 border-b border-gray-200">
        <div className="px-4 py-3 grid grid-cols-3 items-center">
          {/* 왼쪽 영역 - justify-self-start로 좌측 정렬 */}
          <div className="flex items-center gap-1 justify-self-start">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-500">
              <Menu size={24} />
            </button>
            <Link href="/auth">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={24} className="text-gray-500" />
                )}
              </div>
            </Link>
            <CreditDisplay />
          </div>

          {/* 중앙 영역 - justify-self-center로 중앙 정렬 */}
          <div className="justify-self-center">
            <h1 className="text-xl font-bold">{getPageTitle()}</h1>
          </div>

          {/* 오른쪽 영역 - justify-self-end로 우측 정렬 */}
          <div className="flex items-center gap-2 justify-self-end">
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="검색"
              onClick={toggleSearch}
            >
              <Search size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
