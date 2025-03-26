// app/ui/RightSidebar.tsx
'use client';

import React, { useState } from 'react';
import { Search, Lightbulb, BookOpen, Link2, Gauge, Brain, Clock, TrendingUp } from 'lucide-react';

// 최근 저장된 메모 샘플 데이터
const recentMemos = [
  { id: '1', title: '딥러닝 입문 가이드', category: '인공지능', time: '3시간 전' },
  { id: '2', title: '효과적인 시간 관리 방법', category: '생산성', time: '어제' },
  { id: '3', title: '비트코인 장기 전망 분석', category: '금융', time: '2일 전' },
];

// 관련 콘텐츠 추천 샘플
const recommendedContent = [
  {
    id: '1',
    title: '지식 관리의 효율적인 방법',
    source: 'YouTube',
    sourceUrl: 'https://youtube.com/watch?v=example1',
  },
  {
    id: '2',
    title: '정보 체계화를 위한 온톨로지 이해하기',
    source: '블로그',
    sourceUrl: 'https://blog.example.com/ontology',
  },
  {
    id: '3',
    title: '인사이트 발견을 위한 지식 연결 방법',
    source: '아티클',
    sourceUrl: 'https://medium.com/example-article',
  },
];

// 자동 생성된 인사이트 샘플
const generatedInsights = [
  {
    id: '1',
    content: '인공지능 관련 콘텐츠와 생산성 메모에서 공통적으로 나타나는 자동화 주제',
    relatedMemoCount: 5,
  },
  {
    id: '2',
    content: '최근 저장한 금융 관련 자료들이 거시경제 지표와 연관성이 높습니다',
    relatedMemoCount: 3,
  },
];

const RightSidebar = () => {
  const [activeTab, setActiveTab] = useState<'recent' | 'related' | 'insights'>('recent');

  // 활성 탭에 따라 콘텐츠 표시
  const renderTabContent = () => {
    switch (activeTab) {
      case 'recent':
        return (
          <div className="space-y-3">
            {recentMemos.map((memo) => (
              <div key={memo.id} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <h3 className="font-medium text-sm">{memo.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {memo.category}
                  </span>
                  <span className="text-xs text-gray-500">{memo.time}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'related':
        return (
          <div className="space-y-3">
            {recommendedContent.map((item) => (
              <div key={item.id} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span className="flex items-center">
                    {item.source === 'YouTube' ? (
                      <BookOpen size={12} className="mr-1 text-red-500" />
                    ) : item.source === '블로그' ? (
                      <BookOpen size={12} className="mr-1 text-blue-500" />
                    ) : (
                      <BookOpen size={12} className="mr-1 text-gray-500" />
                    )}
                    {item.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-3">
            {generatedInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 rounded-lg cursor-pointer border border-emerald-100 bg-emerald-50"
              >
                <div className="flex items-start">
                  <Lightbulb size={16} className="text-emerald-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-800">{insight.content}</p>
                    <div className="mt-1 text-xs text-emerald-600">
                      {insight.relatedMemoCount}개의 메모 연결됨
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full text-center text-sm text-emerald-500 font-medium hover:underline">
              더 많은 인사이트 생성하기
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full pt-2 px-4 space-y-4">
      {/* 검색창 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="의미 기반 검색..."
          className="bg-gray-100 w-full rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white border border-gray-200"
        />
      </div>

      {/* 지식 통계 카드 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
        <h2 className="font-bold text-lg mb-2">내 지식 현황</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center">
            <BookOpen size={16} className="mr-2" />
            <div>
              <p className="text-xs opacity-80">저장된 메모</p>
              <p className="font-bold">42</p>
            </div>
          </div>
          <div className="flex items-center">
            <Link2 size={16} className="mr-2" />
            <div>
              <p className="text-xs opacity-80">지식 연결</p>
              <p className="font-bold">128</p>
            </div>
          </div>
          <div className="flex items-center">
            <Brain size={16} className="mr-2" />
            <div>
              <p className="text-xs opacity-80">생성된 인사이트</p>
              <p className="font-bold">7</p>
            </div>
          </div>
          <div className="flex items-center">
            <Gauge size={16} className="mr-2" />
            <div>
              <p className="text-xs opacity-80">지식 활용도</p>
              <p className="font-bold">68%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 지식 탐색 탭 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 text-sm font-medium text-center ${
              activeTab === 'recent'
                ? 'text-emerald-500 border-b-2 border-emerald-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('recent')}
          >
            <div className="flex items-center justify-center">
              <Clock size={14} className="mr-1" />
              최근 메모
            </div>
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium text-center ${
              activeTab === 'related'
                ? 'text-emerald-500 border-b-2 border-emerald-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('related')}
          >
            <div className="flex items-center justify-center">
              <TrendingUp size={14} className="mr-1" />
              추천 콘텐츠
            </div>
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium text-center ${
              activeTab === 'insights'
                ? 'text-emerald-500 border-b-2 border-emerald-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('insights')}
          >
            <div className="flex items-center justify-center">
              <Lightbulb size={14} className="mr-1" />
              인사이트
            </div>
          </button>
        </div>
        <div className="p-3">{renderTabContent()}</div>
      </div>

      {/* 추천 링크 카드 */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h2 className="font-bold text-lg mb-2">빠른 접근</h2>
        <div className="space-y-2">
          <button className="w-full py-2 px-3 text-left text-sm font-medium rounded-lg hover:bg-gray-100 flex items-center">
            <Brain size={16} className="mr-2 text-emerald-500" />
            지식맵 보기
          </button>
          <button className="w-full py-2 px-3 text-left text-sm font-medium rounded-lg hover:bg-gray-100 flex items-center">
            <TrendingUp size={16} className="mr-2 text-emerald-500" />
            인사이트 대시보드
          </button>
          <button className="w-full py-2 px-3 text-left text-sm font-medium rounded-lg hover:bg-gray-100 flex items-center">
            <BookOpen size={16} className="mr-2 text-emerald-500" />
            모든 메모 보기
          </button>
        </div>
      </div>

      {/* 푸터 정보 */}
      <div className="text-xs text-gray-500 flex flex-wrap gap-2">
        <a href="#" className="hover:underline">
          이용약관
        </a>
        <a href="#" className="hover:underline">
          개인정보 정책
        </a>
        <a href="#" className="hover:underline">
          도움말
        </a>
        <span>© 2025 BrainLabeling</span>
      </div>
    </div>
  );
};

export default RightSidebar;
