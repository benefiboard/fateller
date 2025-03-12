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

// 목적 목록 정의 추가
const PURPOSES = ['전체', '일반', '업무', '학습', '개인'];

interface SearchAndFilterBarProps {
  onSearch: (searchTerm: string) => void;
  onCategorySelect: (category: string | null) => void;
  onPurposeSelect: (purpose: string | null) => void; // 목적 선택 추가
  onSortChange: (sortOption: 'latest' | 'oldest' | 'today') => void;
  selectedCategory: string | null;
  selectedPurpose: string | null; // 선택된 목적 추가
  searchTerm: string;
  selectedSort: 'latest' | 'oldest' | 'today';
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  onSearch,
  onCategorySelect,
  onPurposeSelect, // 목적 선택 추가
  onSortChange,
  selectedCategory,
  selectedPurpose, // 선택된 목적 추가
  searchTerm,
  selectedSort,
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPurposeFilter, setShowPurposeFilter] = useState(false); // 목적 필터 표시 상태 추가

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // 검색 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  // 카테고리 선택 처리
  const handleCategorySelect = (category: string) => {
    if (category === '전체') {
      onCategorySelect(null);
    } else if (category === selectedCategory) {
      onCategorySelect(null);
    } else {
      onCategorySelect(category);
    }
  };

  // 목적 선택 처리 추가
  const handlePurposeSelect = (purpose: string) => {
    if (purpose === '전체') {
      onPurposeSelect(null);
    } else if (purpose === selectedPurpose) {
      onPurposeSelect(null);
    } else {
      onPurposeSelect(purpose);
    }
  };

  // 필터 초기화
  const handleClearFilters = () => {
    setInputValue('');
    onSearch('');
    onCategorySelect(null);
    onPurposeSelect(null); // 목적 필터 초기화 추가
    onSortChange('latest');
  };

  return (
    <div className="sticky top-0 z-30 bg-gray-100 shadow-sm border-b border-gray-200">
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
        {/* 목적 버튼 추가 */}
        <button
          onClick={() => {
            setShowPurposeFilter(!showPurposeFilter);
            if (showCategoryFilter) setShowCategoryFilter(false); // 카테고리 필터가 열려있으면 닫기
          }}
          className={`px-2 py-1 rounded-full text-sm flex items-center whitespace-nowrap ${
            selectedPurpose
              ? 'bg-emerald-600 text-gray-50'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          <span>목적{selectedPurpose ? `: ${selectedPurpose}` : ''}</span>
          {showPurposeFilter ? (
            <ChevronUp size={16} className="ml-1" />
          ) : (
            <ChevronDown size={16} className="ml-1" />
          )}
        </button>

        {/* 카테고리 버튼 */}
        <button
          onClick={() => {
            setShowCategoryFilter(!showCategoryFilter);
            if (showPurposeFilter) setShowPurposeFilter(false); // 목적 필터가 열려있으면 닫기
          }}
          className={`px-2 py-1 rounded-full text-sm flex items-center whitespace-nowrap ${
            selectedCategory
              ? 'bg-emerald-600 text-gray-50'
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
          className={`px-2 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedSort === 'latest'
              ? 'bg-emerald-600 text-gray-50'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          최신순
        </button>

        <button
          onClick={() => onSortChange('oldest')}
          className={`px-2 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedSort === 'oldest'
              ? 'bg-emerald-600 text-gray-50'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          오래된순
        </button>

        <button
          onClick={() => onSortChange('today')}
          className={`px-2 py-1 rounded-full text-sm whitespace-nowrap ${
            selectedSort === 'today'
              ? 'bg-emerald-600 text-gray-50'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          오늘
        </button>
      </div>

      {/* 목적 필터 패널 추가 */}
      {showPurposeFilter && (
        <div className="border-t border-gray-100 bg-gray-50 shadow-inner p-2 transform transition-all duration-300 max-h-60 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map((purpose) => (
              <button
                key={purpose}
                onClick={() => handlePurposeSelect(purpose)}
                className={`px-3 py-1 rounded-full text-sm ${
                  (purpose === '전체' && !selectedPurpose) || purpose === selectedPurpose
                    ? 'bg-emerald-600 text-gray-50'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {purpose}
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setShowPurposeFilter(false)}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              접기 <ChevronUp size={14} className="inline" />
            </button>
          </div>
        </div>
      )}

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
                    ? 'bg-emerald-600 text-gray-50'
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

      {/* 현재 필터링/검색 상태 표시 (목적 포함) */}
      {(searchTerm || selectedPurpose || selectedCategory || selectedSort !== 'latest') && (
        <div className="p-2 bg-gray-50 border-t border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {searchTerm && <span>"{searchTerm}" 검색 결과</span>}
              {selectedPurpose && (
                <span>
                  {searchTerm ? ' · ' : ''}
                  {selectedPurpose} 목적
                </span>
              )}
              {selectedCategory && (
                <span>
                  {searchTerm || selectedPurpose ? ' · ' : ''}
                  {selectedCategory} 카테고리
                </span>
              )}
              {selectedSort !== 'latest' && (
                <span>
                  {searchTerm || selectedCategory || selectedPurpose ? ' · ' : ''}
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
