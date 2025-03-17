'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, Mail, BookmarkIcon, User } from 'lucide-react';
import { useSearchStore } from '../store/searchStore';

// 일반 링크용 컴포넌트
interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  minimized?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon,
  label,
  active = false,
  minimized = false,
}) => {
  return (
    <Link href={href} className="group">
      <div className="flex items-center justify-center lg:justify-normal p-3 rounded-full transition-colors hover:bg-emerald-50">
        <div className="text-xl text-gray-800 group-hover:text-emerald-500">{icon}</div>
        {!minimized && <span className="ml-4 text-gray-900 text-lg hidden lg:block">{label}</span>}
      </div>
    </Link>
  );
};

// 버튼용 컴포넌트 (링크 대신 버튼으로 동작하는 항목)
interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  minimized?: boolean;
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon,
  label,
  active = false, // 이 속성은 더 이상 스타일에 영향을 주지 않지만 인터페이스 일관성을 위해 유지
  minimized = false,
  onClick,
}) => {
  return (
    <button onClick={onClick} className="w-full group">
      <div className="flex items-center justify-center lg:justify-normal p-3 rounded-full transition-colors hover:bg-emerald-50 font-normal">
        <div className="text-xl text-gray-800 group-hover:text-emerald-500">{icon}</div>
        {!minimized && <span className="ml-4 text-gray-900 text-lg hidden lg:block">{label}</span>}
      </div>
    </button>
  );
};

const LeftSidebar: React.FC<{ minimized?: boolean }> = ({ minimized = false }) => {
  const pathname = usePathname();
  const toggleSearch = useSearchStore((state) => state.toggleSearch);

  // auth 경로에서는 사이드바를 표시하지 않음
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <div className="h-full py-2 flex flex-col justify-between">
      {/* 로고 */}
      <div className="p-3">
        <Link href="/" aria-label="홈">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-400 text-white font-bold">
            B
          </div>
        </Link>
      </div>

      {/* 네비게이션 링크 */}
      <nav className="mt-2 flex-1 ">
        <SidebarLink
          href="/"
          icon={<Home size={26} />}
          label="홈"
          active={pathname === '/'}
          minimized={minimized}
        />

        {/* 탐색하기는 버튼으로 변경 (링크 대신) */}
        <SidebarButton
          icon={<Search size={26} />}
          label="탐색하기"
          active={pathname === '/explore'}
          minimized={minimized}
          onClick={toggleSearch} // 클릭 시 검색 토글 함수만 실행
        />

        <SidebarLink
          href="/notifications"
          icon={<Bell size={26} />}
          label="알림"
          active={pathname === '/notifications'}
          minimized={minimized}
        />
        {/* <SidebarLink
          href="/messages"
          icon={<Mail size={26} />}
          label="메시지"
          active={pathname === '/messages'}
          minimized={minimized}
        /> */}
        {/* <SidebarLink
          href="/bookmarks"
          icon={<BookmarkIcon size={26} />}
          label="북마크"
          active={pathname === '/bookmarks'}
          minimized={minimized}
        /> */}
        <SidebarLink
          href="/auth"
          icon={<User size={26} />}
          label="프로필"
          active={pathname === '/profile'}
          minimized={minimized}
        />
      </nav>
    </div>
  );
};

export default LeftSidebar;
