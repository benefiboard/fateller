// app/ui/RightSidebar.tsx
'use client';

import React from 'react';
import { Search, Sparkles } from 'lucide-react';

const trendingTopics = [
  { category: '인공지능', topic: 'GPT-5 출시 루머', posts: '2,567' },
  { category: '생산성', topic: '메모 작성법', posts: '1,842' },
  { category: '프로그래밍', topic: 'Next.js 14', posts: '4,655' },
  { category: '건강', topic: '명상의 효과', posts: '1,177' },
];

const suggestedUsers = [
  { name: 'AI 연구소', username: '@ai_research', avatar: 'https://placehold.co/40x40' },
  { name: '개발자 꿀팁', username: '@dev_tips', avatar: 'https://placehold.co/40x40' },
  { name: '메모의 신', username: '@memo_master', avatar: 'https://placehold.co/40x40' },
];

const RightSidebar = () => {
  return (
    <div className="w-full pt-2 px-4 space-y-4">
      {/* 검색창 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="메모 검색"
          className="bg-gray-100 w-full rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white border border-gray-200"
        />
      </div>

      {/* 프리미엄 구독 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h2 className="font-bold text-xl mb-2">프리미엄 구독</h2>
        <p className="text-sm text-gray-700 mb-3">추가 기능을 활용하고 AI 분석 능력을 강화하세요</p>
        <button className="flex items-center bg-emerald-400 hover:bg-emerald-500 text-white rounded-full px-4 py-2 font-bold text-sm">
          <Sparkles size={16} className="mr-2" />
          구독하기
        </button>
      </div>

      {/* 트렌딩 토픽 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h2 className="font-bold text-xl mb-2">트렌딩 토픽</h2>
        <div className="space-y-4">
          {trendingTopics.map((item, index) => (
            <div key={index} className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">트렌딩 · {item.category}</p>
                  <p className="font-semibold">{item.topic}</p>
                  <p className="text-xs text-gray-500">{item.posts} 게시물</p>
                </div>
              </div>
            </div>
          ))}
          <button className="text-emerald-400 text-sm font-semibold hover:underline">
            더 보기
          </button>
        </div>
      </div>

      {/* 팔로우 추천 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h2 className="font-bold text-xl mb-2">팔로우 추천</h2>
        <div className="space-y-4">
          {suggestedUsers.map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="ml-3">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.username}</p>
                </div>
              </div>
              <button className="bg-gray-900 hover:bg-gray-700 text-white rounded-full px-4 py-1.5 text-sm font-semibold">
                팔로우
              </button>
            </div>
          ))}
          <button className="text-emerald-400 text-sm font-semibold hover:underline">
            더 보기
          </button>
        </div>
      </div>

      {/* 푸터 링크 */}
      <div className="text-xs text-gray-500 flex flex-wrap gap-2">
        <a href="#" className="hover:underline">
          이용약관
        </a>
        <a href="#" className="hover:underline">
          개인정보 정책
        </a>
        <a href="#" className="hover:underline">
          접근성
        </a>
        <a href="#" className="hover:underline">
          더 보기
        </a>
        <span>© 2025 BrainLabel</span>
      </div>
    </div>
  );
};

export default RightSidebar;
