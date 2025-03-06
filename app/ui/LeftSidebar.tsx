// app/ui/LeftSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Bell,
  Mail,
  BookmarkIcon,
  User,
  MoreHorizontal,
  MessageCircle,
} from 'lucide-react';

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
      <div
        className={`flex items-center p-3 rounded-full text-xl transition-colors hover:bg-emerald-50 ${
          active ? 'font-bold' : 'font-normal'
        }`}
      >
        <div
          className={`${
            active ? 'text-emerald-500' : 'text-gray-800 group-hover:text-emerald-500'
          }`}
        >
          {icon}
        </div>
        {!minimized && <span className="ml-4 text-gray-900 text-xl">{label}</span>}
      </div>
    </Link>
  );
};

interface LeftSidebarProps {
  minimized?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ minimized = false }) => {
  const pathname = usePathname();

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
      <nav className="mt-2 flex-1">
        <SidebarLink
          href="/"
          icon={<Home size={26} />}
          label="홈"
          active={pathname === '/'}
          minimized={minimized}
        />
        <SidebarLink
          href="/explore"
          icon={<Search size={26} />}
          label="탐색하기"
          active={pathname === '/explore'}
          minimized={minimized}
        />
        <SidebarLink
          href="/notifications"
          icon={<Bell size={26} />}
          label="알림"
          active={pathname === '/notifications'}
          minimized={minimized}
        />
        <SidebarLink
          href="/messages"
          icon={<Mail size={26} />}
          label="메시지"
          active={pathname === '/messages'}
          minimized={minimized}
        />
        <SidebarLink
          href="/bookmarks"
          icon={<BookmarkIcon size={26} />}
          label="북마크"
          active={pathname === '/bookmarks'}
          minimized={minimized}
        />
        <SidebarLink
          href="/profile"
          icon={<User size={26} />}
          label="프로필"
          active={pathname === '/profile'}
          minimized={minimized}
        />
      </nav>

      {/* 메모 작성 버튼 */}
      <div className="mt-4 px-3">
        <button className="bg-emerald-400 hover:bg-emerald-500 transition-colors text-white rounded-full p-3 w-full flex items-center justify-center font-bold text-lg">
          {minimized ? <MessageCircle size={24} /> : <span>새 메모</span>}
        </button>
      </div>

      {/* 프로필 정보 */}
      <div className="mt-auto p-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img
              src="https://placehold.co/40x40"
              alt="프로필"
              className="w-full h-full object-cover"
            />
          </div>
          {!minimized && (
            <>
              <div className="ml-3 flex-1 truncate">
                <div className="font-bold text-sm">BrainLabel</div>
                <div className="text-gray-500 text-xs">@brainlabel_ai</div>
              </div>
              <MoreHorizontal size={18} className="text-gray-500" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
