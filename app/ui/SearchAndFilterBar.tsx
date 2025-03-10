'use client';

import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

// 카테고리 목록 정의
const CATEGORIES = [
  '전체',
  '인문/철학',
  '경영/경제',
  '언어',
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

interface SearchAndFilterBarProps {
  onSearch: (searchTerm: string) => void;
  onCategorySelect: (category: string | null) => void;
  onSortChange: (sortOption: 'latest' | 'oldest' | 'today') => void;
  selectedCategory: string | null;
  searchTerm: string;
  selectedSort: 'latest' | 'oldest' | 'today';
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  onSearch,
  onCategorySelect,
  onSortChange,
  selectedCategory,
  searchTerm,
  selectedSort,
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // 검색 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('검색 실행:', inputValue); // 디버깅용
    onSearch(inputValue.trim());
  };

  // 카테고리 선택 처리 (수정됨)
  const handleCategorySelect = (category: string) => {
    console.log('카테고리 선택:', category); // 디버깅용

    if (category === '전체') {
      onCategorySelect(null);
    } else if (category === selectedCategory) {
      // 이미 선택된 카테고리 다시 클릭하면 해제
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setInputValue('');
    onSearch('');
    onCategorySelect(null);
    onSortChange('latest');
  };

  return (
    <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
      {/* 검색 바 */}
      <form onSubmit={handleSubmit} className="p-2">
        <div className="relative">
          <input
            type="text"
            placeholder="메모 검색..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />

          {/* 검색 버튼 (엔터 아이콘) */}
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-700"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </form>

      {/* 필터 버튼 영역 */}
      <div className="flex px-2 py-2 overflow-x-auto hide-scrollbar space-x-2 border-t border-gray-100">
        {/* 카테고리 버튼 */}
        <button
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
          className={`px-3 py-1 rounded-full text-sm flex items-center whitespace-nowrap ${
            selectedCategory
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <span>카테고리{selectedCategory ? `: ${selectedCategory}` : ''}</span>
          {showCategoryFilter ? (
            <ChevronUp size={16} className="ml-1" />
          ) : (
            <ChevronDown size={16} className="ml-1" />
          )}
        </button>

        {/* 정렬 버튼들 */}
        <button
          onClick={() => onSortChange('latest')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedSort === 'latest'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          최신순
        </button>

        <button
          onClick={() => onSortChange('oldest')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedSort === 'oldest'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          오래된순
        </button>

        <button
          onClick={() => onSortChange('today')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedSort === 'today'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          오늘
        </button>
      </div>

      {/* 카테고리 필터 패널 */}
      {showCategoryFilter && (
        <div className="border-t border-gray-100 bg-gray-50 shadow-inner p-2 transform transition-all duration-300 max-h-60 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  (category === '전체' && !selectedCategory) || category === selectedCategory
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setShowCategoryFilter(false)}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              접기 <ChevronUp size={14} className="inline" />
            </button>
          </div>
        </div>
      )}

      {/* 현재 필터링/검색 상태 표시 */}
      {(searchTerm ||
        (selectedCategory && selectedCategory !== '전체') ||
        selectedSort !== 'latest') && (
        <div className="p-2 bg-gray-50 border-t border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {searchTerm && <span>"{searchTerm}" 검색 결과</span>}
              {selectedCategory && (
                <span>
                  {searchTerm ? ' · ' : ''}
                  {selectedCategory} 카테고리
                </span>
              )}
              {selectedSort !== 'latest' && (
                <span>
                  {searchTerm || selectedCategory ? ' · ' : ''}
                  {selectedSort === 'oldest' ? '오래된순' : '오늘'}
                </span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-emerald-600 hover:text-emerald-800"
            >
              필터 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilterBar;
