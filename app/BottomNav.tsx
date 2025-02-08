import { BookOpen, Home, MoonStar, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function BottomNav() {
  const menuItems = [
    { name: '홈', icon: Home, path: '/' },
    { name: '운세', icon: MoonStar, path: '/fortune' },
    { name: '타로', icon: Sparkles, path: '/tarot' },
    { name: '해결의 책', icon: BookOpen, path: '/mirror' },
    { name: '마이페이지', icon: User, path: '/mypage' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 border-t bg-white w-screen max-w-[480px] z-50">
      <div className="grid grid-cols-5 p-4 max-w-lg mx-auto h-20">
        {menuItems.map((item, i) => (
          <Link href={item.path} key={i} className="flex flex-col items-center gap-1">
            <span className="text-2xl">
              <item.icon className="w-7 h-7" />
            </span>
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
