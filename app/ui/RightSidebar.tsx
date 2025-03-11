// app/ui/RightSidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  BookOpen,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Network,
  Loader2,
} from 'lucide-react';

// 커스텀 훅 import
import useRightSidebarData from '../hooks/useRightSidebarData';

// 서비스에서 제공할 카테고리 목록
const CATEGORIES = [
  '인문/철학',
  '경영/경제',
  '언어',
  '역사',
  '정치',
  '사회',
  '국제',
  '과학/IT',
  '수학',
  '기술/공학',
  '의학/건강',
  '예술/문화',
  '문학/창작',
];

// 섹션 키 타입 정의
type SectionKey = 'stats' | 'recentMemos' | 'categories' | 'futureFeatures';

const RightSidebar = () => {
  // 사이드바 섹션 확장/축소 상태 관리
  // 첫 번째 섹션만 열어두고 나머지는 접어둠
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    recentMemos: false,
    categories: false,
    futureFeatures: false,
  });

  // 실제 데이터 로딩
  const {
    totalMemos,
    recentWeekMemos,
    categoryStats,
    recentMemos,
    usedCategories,
    isLoading,
    error,
  } = useRightSidebarData();

  // 섹션 토글 함수 - 타입 명시적 지정
  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-full pt-2 px-4 space-y-4 h-screen overflow-y-auto pb-20">
      {/* 1. 지식 통계 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-800">내 지식 현황</h2>
          <button
            onClick={() => toggleSection('stats')}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.stats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {expandedSections.stats && (
          <div className="p-4 border bg-gradient-to-r from-emerald-600 to-emerald-500 border-gray-100 shadow-md text-gray-100">
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="animate-spin h-6 w-6 text-white mr-2" />
                <span>데이터 로딩 중...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <BookOpen size={16} className="mr-2" />
                    <div>
                      <p className="text-xs opacity-80">저장된 메모</p>
                      <p className="font-bold">{totalMemos}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <div>
                      <p className="text-xs opacity-80">최근 7일</p>
                      <p className="font-bold">{recentWeekMemos}</p>
                    </div>
                  </div>
                </div>

                {/* 카테고리별 분포 미니 차트 */}
                <div className="mt-4">
                  <p className="text-xs opacity-80 mb-2">주요 카테고리 분포</p>
                  <div className="space-y-2">
                    {categoryStats.length > 0 ? (
                      categoryStats.slice(0, 3).map((stat, index) => (
                        <div key={index} className="w-full">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{stat.category}</span>
                            <span>{stat.count}개</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div
                              className="bg-white rounded-full h-2"
                              style={{
                                width: `${(stat.count / categoryStats[0].count) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center py-2">아직 메모가 없습니다</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. 최근 메모 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-800">최근 메모</h2>
          <button
            onClick={() => toggleSection('recentMemos')}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.recentMemos ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {expandedSections.recentMemos && (
          <div className="p-3 space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse h-12 bg-gray-100 rounded"></div>
                <div className="animate-pulse h-12 bg-gray-100 rounded"></div>
                <div className="animate-pulse h-12 bg-gray-100 rounded"></div>
              </div>
            ) : recentMemos.length > 0 ? (
              recentMemos.map((memo) => (
                <div
                  key={memo.id}
                  className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <h3 className="font-medium text-sm text-gray-800">{memo.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {memo.category}
                    </span>
                    <span className="text-xs text-gray-500">{memo.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">저장된 메모가 없습니다</p>
            )}
            {/* <button className="w-full text-center text-sm text-emerald-600 py-1 hover:underline">
              모든 메모 보기
            </button> */}
          </div>
        )}
      </div>

      {/* 3. 카테고리 탐색 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-800">카테고리 탐색</h2>
          <button
            onClick={() => toggleSection('categories')}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.categories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {expandedSections.categories && (
          <div className="p-3">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin h-5 w-5 text-emerald-500 mr-2" />
                <span className="text-sm text-gray-500">카테고리 로딩 중...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  // 사용 중인 카테고리는 강조 표시
                  const isInUse = usedCategories.includes(category);
                  return (
                    <Link
                      key={category}
                      href={`/?category=${category}`}
                      className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                        isInUse
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. 향후 기능 표시 공간 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h2 className="font-bold text-lg text-gray-800">추가 예정</h2>
          <button
            onClick={() => toggleSection('futureFeatures')}
            className="text-gray-500 hover:text-gray-700"
          >
            {expandedSections.futureFeatures ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {expandedSections.futureFeatures && (
          <div className="p-4 space-y-4">
            {/* 관련 메모 표시 공간 */}
            <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center text-gray-500 mb-2">
                <Network size={18} className="mr-2" />
                <h3 className="font-medium">관련 메모</h3>
              </div>
              <p className="text-sm text-gray-500">
                곧 추가될 기능입니다. 자동으로 관련된 메모를 찾아서 표시합니다.
              </p>
            </div>

            {/* 인사이트 공간 */}
            <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center text-gray-500 mb-2">
                <Lightbulb size={18} className="mr-2" />
                <h3 className="font-medium">AI 인사이트</h3>
              </div>
              <p className="text-sm text-gray-500">
                곧 추가될 기능입니다. AI가 메모 간의 패턴을 분석하여 새로운 인사이트를 제공합니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          데이터 로딩 중 오류가 발생했습니다: {error}
        </div>
      )}

      {/* 푸터 정보 */}
      <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-6">
        <a href="#" className="hover:underline">
          이용약관
        </a>
        <a href="#" className="hover:underline">
          개인정보 정책
        </a>
        <a href="#" className="hover:underline">
          도움말
        </a>
        <span>© 2025 BrainLabel</span>
      </div>
    </div>
  );
};

export default RightSidebar;
