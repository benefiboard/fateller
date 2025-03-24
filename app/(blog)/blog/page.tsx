// app/(blog)/blog/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Tag,
  ArrowRight,
  X,
  RefreshCw,
  ChevronDown,
  Filter,
  Quote,
  Notebook,
} from 'lucide-react';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { BlogPost, BlogCategory } from '@/app/utils/types';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputSearchQuery, setInputSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const supabase = createSupabaseBrowserClient();

  // 블로그 게시물 로드
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // 모든 게시물 쿼리
        let query = supabase
          .from('blog_posts')
          .select(
            `
            *,
            source:source_id(id, title, canonical_url, source_type, image_url),
            summary:summary_id(id, title, category, key_sentence, keywords, purpose)
          `
          )
          .eq('published', true);

        // 카테고리 필터링 (blog_posts.category 사용)
        if (selectedCategory) {
          query = query.eq('category', selectedCategory);
        }

        // 정렬 적용
        query = query.order('published_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // 검색어와 null 값 필터링은 클라이언트 측에서 수행
        const filteredPosts = ((data as BlogPost[]) || []).filter((post) => {
          // 기본 필터: null 값 체크
          const hasValidData = post.summary?.title && post.category;

          // 검색어 필터링
          if (searchQuery && hasValidData) {
            const searchLower = searchQuery.toLowerCase();
            const titleMatch = post.summary?.title?.toLowerCase().includes(searchLower) || false;
            const contentMatch =
              post.summary?.key_sentence?.toLowerCase().includes(searchLower) || false;
            const categoryMatch = post.category?.toLowerCase().includes(searchLower) || false;

            return titleMatch || contentMatch || categoryMatch;
          }

          // 카테고리만 필터링하는 경우
          if (selectedCategory) {
            return hasValidData;
          }

          return true;
        });

        setTotalResults(filteredPosts.length);
        setPosts(filteredPosts);

        // 카테고리 로드
        const { data: categoryPosts } = await supabase
          .from('blog_posts')
          .select(`category`)
          .eq('published', true)
          .not('category', 'is', null);

        // 카테고리 이름과 개수 수동 계산
        const categoryCounts: Record<string, number> = {};
        categoryPosts?.forEach((post) => {
          const category = post.category || '미분류';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        const formattedCategories: BlogCategory[] = Object.entries(categoryCounts).map(
          ([category, count]) => ({
            category,
            count,
          })
        );

        setCategories(formattedCategories);

        // 추천 게시물 로드
        if (!selectedCategory && !searchQuery) {
          const { data: featuredData } = await supabase
            .from('blog_posts')
            .select(
              `
              *,
              source:source_id(id, title, canonical_url, source_type, image_url),
              summary:summary_id(id, title, category, key_sentence, keywords, purpose)
            `
            )
            .eq('published', true)
            .eq('featured', true)
            .order('published_at', { ascending: false })
            .limit(3);

          setFeaturedPosts((featuredData as BlogPost[]) || []);
        }
      } catch (error) {
        console.error('블로그 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory, searchQuery]);

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    if (inputSearchQuery.trim()) {
      setSearchQuery(inputSearchQuery.trim());
      setMobileFilterOpen(false);
    }
  };

  // 엔터 키 이벤트 핸들러
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색 초기화 핸들러
  const handleResetSearch = () => {
    setSearchQuery('');
    setInputSearchQuery('');
    setSelectedCategory(null);
  };

  // 카테고리 필터 제거 핸들러
  const handleClearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  // 검색어 필터 제거 핸들러
  const handleClearSearchFilter = () => {
    setSearchQuery('');
    setInputSearchQuery('');
  };

  // 현재 검색 모드 텍스트 생성
  const getSearchModeText = () => {
    if (searchQuery && selectedCategory) {
      return `${selectedCategory} 카테고리에서 '${searchQuery}' 검색 결과`;
    } else if (searchQuery) {
      return `'${searchQuery}' 검색 결과`;
    } else if (selectedCategory) {
      return `${selectedCategory} 카테고리`;
    }
    return '최신 콘텐츠';
  };

  return (
    <div className="min-h-screen bg-gray-50 tracking-tighter">
      {/* 헤더 */}
      <header className="bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 sm:py-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-4xl font-bold mb-4">Brain Labeling 블로그</h1>
            <p className="text-sm sm:text-base max-w-2xl">
              AI 요약 기술로 정리된 유용한 콘텐츠를 만나보세요.
              <br />
              복잡한 원문과 요약을 함께 제공합니다.
            </p>
          </div>
        </div>
      </header>

      {/* 검색 바 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            {/* 검색 입력 필드 */}
            <div className="relative flex-1">
              <div className="flex">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={inputSearchQuery}
                  onChange={(e) => setInputSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="검색어를 입력하세요..."
                  className="pl-9 py-2 pr-8 w-full border border-gray-300 rounded-lg text-sm"
                />
                {inputSearchQuery && (
                  <button
                    onClick={() => setInputSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-2"
                    aria-label="지우기"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* 검색/필터 버튼 */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleSearch}
                className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center"
              >
                <Search className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">검색</span>
              </button>

              <button
                onClick={handleResetSearch}
                title="검색 초기화"
                className="bg-gray-200 text-gray-700 px-2 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* 필터 버튼 - 모든 화면 크기에서 표시 */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="bg-gray-200 text-gray-700 px-2 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors flex items-center"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 활성 필터 표시 */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-wrap items-center gap-2">
              {(searchQuery || selectedCategory) && (
                <>
                  <span className="text-xs text-gray-500">활성 필터:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      검색어: {searchQuery}
                      <button
                        onClick={handleClearSearchFilter}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                      카테고리: {selectedCategory}
                      <button
                        onClick={handleClearCategoryFilter}
                        className="ml-1 hover:text-emerald-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </>
              )}
            </div>

            {/* 검색 결과 수 표시 */}
            {(searchQuery || selectedCategory) && (
              <span className="text-xs text-gray-500">총 {totalResults}개 결과</span>
            )}
          </div>

          {/* 카테고리 선택 드롭다운 - 모든 화면 크기에서 표시 */}
          {mobileFilterOpen && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              <div className="text-sm font-medium mb-2">카테고리 선택</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMobileFilterOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs ${
                    selectedCategory === null
                      ? 'bg-emerald-100 text-emerald-800 font-medium'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  전체보기
                </button>
                {categories.map((category, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCategory(category.category);
                      setMobileFilterOpen(false);
                    }}
                    className={`text-left px-3 py-2 rounded-lg text-xs ${
                      selectedCategory === category.category
                        ? 'bg-emerald-100 text-emerald-800 font-medium'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {category.category} <span className="text-gray-500">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            {/* 추천 게시물 (카테고리 미선택 & 검색어 없을 때만) */}
            {featuredPosts.length > 0 && !selectedCategory && !searchQuery && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">추천 콘텐츠</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {post.source?.image_url && (
                        <div className="h-40 relative">
                          <img
                            src={post.source.image_url}
                            alt={post.summary?.title || '이미지'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full mb-2">
                          {post.category || post.summary?.category || '미분류'}
                        </span>
                        <h3 className="text-lg font-bold mb-2">
                          <Link href={`/blog/post/${post.slug}`}>
                            {post.summary?.title || post.source?.title || '제목 없음'}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.summary?.key_sentence || '내용 없음'}
                        </p>
                        <Link
                          href={`/blog/post/${post.slug}`}
                          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          자세히 보기
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 게시물 목록 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold ">{getSearchModeText()}</h2>
              <Link
                href="/"
                className="xl:hidden inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Notebook />
                  <p>서비스 시작하기</p>
                </div>
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3">로딩 중...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">
                  {searchQuery
                    ? '검색 결과가 없습니다.'
                    : selectedCategory
                    ? '이 카테고리에 게시물이 없습니다.'
                    : '게시물이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-12 sm:space-y-8">
                {posts.map((post) => (
                  <>
                    <div
                      key={post.id}
                      className="border border-gray-300 sm:bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className=" sm:p-6  sm:h-52 flex flex-col  sm:flex-row sm:items-center gap-4 ">
                        {/* 이미지 좌측 */}
                        <div className="h-60 aspect-video sm:w-auto sm:h-full">
                          {post.source?.image_url ? (
                            <img
                              src={post.source?.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className=" w-full aspect-video  flex flex-col items-center justify-center gap-4 p-4 border-4 border-gray-200">
                              <Quote size={16} className="text-gray-400" />
                              <p className="text-center">{post.summary?.title || '제목 없음'}</p>
                              <Quote size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* 우측 텍스트 */}
                        <div className="flex-1 h-full flex flex-col justify-between px-4">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                              {post.category || post.summary?.category || '미분류'}
                            </span>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {post.source?.source_type || '웹 콘텐츠'}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold mb-3">
                            <Link
                              href={`/blog/post/${post.slug}`}
                              className="line-clamp-3 hover:text-emerald-600"
                            >
                              {post.summary?.title || post.source?.title || '제목 없음'}
                            </Link>
                          </h3>

                          <p className="hidden text-gray-600 mb-4 ">
                            {post.summary?.key_sentence || '내용 없음'}
                          </p>

                          <div className="hidden  flex-wrap gap-2 sm:mb-4">
                            {post.summary?.keywords?.slice(0, 5).map((keyword, idx) => (
                              <span key={idx} className="text-sm text-gray-500">
                                #{keyword}
                              </span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center mb-4 sm:mb-0">
                            <span className="text-sm text-gray-500">
                              {new Date(post.published_at).toLocaleDateString()}
                            </span>
                            <Link
                              href={`/blog/post/${post.slug}`}
                              className="inline-flex items-center px-4 py-2 font-semibold bg-gray-800  text-gray-100 rounded-full  hover:text-gray-400"
                            >
                              요약 내용 보기
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <hr className="sm:hidden border border-gray-300 w-4/5 mx-auto" /> */}
                  </>
                ))}
              </div>
            )}
          </div>

          {/* 사이드바 (데스크톱에서만 표시) */}
          <div className="hidden xl:block xl:w-72 space-y-6">
            {/* 서비스 소개 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-3">Brain Labeling이란?</h3>
              <p className="text-gray-600 mb-4">
                AI가 콘텐츠를 자동으로 정리해주는 메모 서비스입니다. 복잡한 내용을 쉽게 이해하고
                기억할 수 있도록 도와드립니다.
              </p>
              <Link
                href="/"
                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Notebook />
                  <p>서비스 시작하기</p>
                </div>
              </Link>
            </div>

            {/* 카테고리 */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">카테고리</h3>
                {selectedCategory && (
                  <button
                    onClick={handleClearCategoryFilter}
                    className="text-xs text-gray-500 hover:text-emerald-600"
                  >
                    초기화
                  </button>
                )}
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                      selectedCategory === null
                        ? 'bg-emerald-100 text-emerald-800 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    전체보기
                  </button>
                </li>
                {categories.map((category, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => setSelectedCategory(category.category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedCategory === category.category
                          ? 'bg-emerald-100 text-emerald-800 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.category}</span>
                        <span className="text-xs text-gray-500">({category.count})</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
