'use client';

import React, { useState } from 'react';
import { ChevronRight, Search, MessageCircle, Home, User, BookOpen } from 'lucide-react';

// 샘플 메모 데이터
const sampleMemos = [
  {
    id: '1',
    title: '글쓰기의 어려움과 방향한 전달의 중요성',
    tweet_main:
      '글쓰기가 어려운 이유는 <hi>잘 쓰려는 욕심</hi> 때문이며, <hi>명확한 메시지</hi>를 전달하기 위해서는 많은 고민이 필요하다.',
    category: '자기계발',
    color: 'bg-amber-100',
    date: '2025.03.05',
    time: '11:23',
  },
  {
    id: '2',
    title: '인공지능 기술의 윤리적 과제와 해결방안',
    tweet_main:
      '<hi>인공지능의 윤리적 문제</hi>는 기술 발전과 함께 더욱 중요해지고 있으며, <hi>투명성과 책임성</hi> 확보가 핵심 과제이다.',
    category: '기술/공학',
    color: 'bg-emerald-100',
    date: '2025.03.04',
    time: '15:42',
  },
  {
    id: '3',
    title: '효과적인 시간 관리를 위한 5가지 전략',
    tweet_main:
      '<hi>시간 관리</hi>는 성공적인 삶의 핵심 요소이며, <hi>우선순위 설정</hi>과 <hi>집중력 향상</hi>이 가장 중요하다.',
    category: '자기계발',
    color: 'bg-rose-100',
    date: '2025.03.03',
    time: '09:15',
  },
  {
    id: '4',
    title: '기후 변화와 지속 가능한 미래를 위한 실천 방안',
    tweet_main:
      '<hi>기후 변화 대응</hi>은 전 지구적 과제이며, 개인의 <hi>일상적 실천</hi>부터 시작해야 한다.',
    category: '사회과학',
    color: 'bg-blue-100',
    date: '2025.03.01',
    time: '16:30',
  },
];

// 메인 앱 컴포넌트
const MemoListApp = () => {
  const [selectedTab, setSelectedTab] = useState('home');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white px-4 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="text-lg font-semibold text-emerald-500">BrainLabel</div>
        <div className="flex space-x-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
            <Search size={18} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* 메모 목록 */}
      <main className="flex-1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">메모</h1>
          <span className="text-sm text-gray-500">{sampleMemos.length}개의 메모</span>
        </div>

        <div className="space-y-3">
          {sampleMemos.map((memo) => (
            <MemoCard key={memo.id} memo={memo} />
          ))}
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <div className="bg-white border-t border-gray-200 px-2 py-3 sticky bottom-0 z-10">
        <div className="flex justify-around items-center">
          <TabButton
            icon={<Home size={20} />}
            label="홈"
            isActive={selectedTab === 'home'}
            onClick={() => setSelectedTab('home')}
          />
          <TabButton
            icon={<BookOpen size={20} />}
            label="라이브러리"
            isActive={selectedTab === 'library'}
            onClick={() => setSelectedTab('library')}
          />
          <div className="-mt-8">
            <button className="w-14 h-14 rounded-full bg-emerald-400 text-white flex items-center justify-center shadow-lg">
              <MessageCircle size={24} />
            </button>
          </div>
          <TabButton
            icon={<Search size={20} />}
            label="검색"
            isActive={selectedTab === 'search'}
            onClick={() => setSelectedTab('search')}
          />
          <TabButton
            icon={<User size={20} />}
            label="프로필"
            isActive={selectedTab === 'profile'}
            onClick={() => setSelectedTab('profile')}
          />
        </div>
      </div>
    </div>
  );
};

// 메모 카드 컴포넌트
const MemoCard = ({ memo }) => {
  // 중요 텍스트 하이라이트 처리
  const formatText = (text) => {
    return text.replace(/<hi>(.*?)<\/hi>/g, '<span class="font-bold">$1</span>');
  };

  return (
    <div className={`rounded-xl overflow-hidden ${memo.color} shadow-sm`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{memo.title}</h2>
            <p
              className="text-gray-800 mb-2"
              dangerouslySetInnerHTML={{ __html: formatText(memo.tweet_main) }}
            ></p>

            <div className="flex items-center text-sm text-gray-500 mt-4">
              <div className="bg-white px-2 py-0.5 rounded-full text-emerald-600 text-xs font-medium mr-2">
                {memo.category}
              </div>
              <span>{memo.date}</span>
            </div>
          </div>
          <div className="ml-4">
            <ChevronRight size={20} className="text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 탭 버튼 컴포넌트
const TabButton = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      className={`flex flex-col items-center justify-center ${
        isActive ? 'text-emerald-500' : 'text-gray-500'
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default MemoListApp;
