import {
  BookOpen,
  CalendarHeart,
  CircleHelp,
  Home,
  Menu,
  MoonStar,
  Sparkles,
  User,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function BottomNav() {
  const menuItems = [
    { name: '홈', icon: Home, path: '/' },
    { name: '오늘운세', icon: CalendarHeart, path: '/today' },
    { name: '사주', icon: MoonStar, path: '/fortune' },
    { name: '타로', icon: Sparkles, path: '/tarot' },
    { name: '해결거울', icon: CircleHelp, path: '/mirror' },
    { name: '전체메뉴', icon: Menu, path: '/mypage' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 border-t bg-white w-screen max-w-[480px] z-50">
      <div className="grid grid-cols-6 p-4 max-w-lg mx-auto h-20">
        {menuItems.map((item, i) => (
          <Link href={item.path} key={i} className="flex flex-col items-center gap-1">
            <span className="text-2xl">
              <item.icon className="w-7 h-7" />
            </span>
            <span className="text-xs tracking-tighter">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
