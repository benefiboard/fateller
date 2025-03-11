// app/ui/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Sparkles } from 'lucide-react';

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
    <header className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm z-10 border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* 프로필 이미지 (모바일에서만 표시) */}
        <div className="flex items-center">
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <img
                src="https://placehold.co/40x40"
                alt="프로필"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>

        {/* 페이지 제목 */}
        <h1 className="text-xl font-bold">{getPageTitle()}</h1>

        {/* 설정 버튼 */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100" aria-label="설정">
            <Settings size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* 홈 페이지에서만 탭 표시 */}
      {pathname === '/' && (
        <div className="flex border-b border-gray-200">
          <Tab
            label="회원님의 아이디어"
            isActive={activeTab === 'for-you'}
            onClick={() => handleTabChange('for-you')}
          />
          <Tab
            label="추천 아이디어"
            isActive={activeTab === 'suggest'}
            onClick={() => handleTabChange('suggest')}
          />
        </div>
      )}
    </header>
  );
};

export default Header;
