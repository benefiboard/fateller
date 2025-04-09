// app/(admin)/admin/blog/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/app/store/userStore';
import {
  Search,
  Filter,
  PlusCircle,
  Trash2,
  ExternalLink,
  RefreshCcw,
  Tag,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Eye,
} from 'lucide-react';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { BlogPost, ContentSource, ContentSummary, BlogCategory } from '@/app/utils/types';
import ScrollbarVisible from './ScrollbarVisible';

// 소스 데이터 타입 정의
interface SourceWithSummaries extends ContentSource {
  summaries: ContentSummary[];
}

// 선택된 항목 타입 정의 - 카테고리 필드 추가
interface SelectedItem {
  sourceId: string;
  summaryId: string;
  title: string;
  category: string; // 카테고리 필드 추가
}

// 이미 블로그에 추가된 항목 타입 정의
interface ExistingBlogItem {
  source_id: string;
  summary_id: string;
}

export default function AdminBlogPage() {
  // 이메일 기반 사용자 ID 매핑 함수
  const getUserIdForEmail = (email: string | null | undefined): string => {
    if (email === 'hjdh59@gmail.com') {
      return 'd5cc7e8c-5dda-4260-be11-8e0776dc66b1';
    } else if (email === 'benefiboard@gmail.com') {
      return 'bf412c68-4b94-44af-b043-e1213c327638';
    }
    return '';
  };

  // 상태 관리 - 타입 추가
  const { currentUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'sources'>('posts');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [sources, setSources] = useState<SourceWithSummaries[]>([]);

  // 검색 필터 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sourceSearchTerm, setSourceSearchTerm] = useState<string>('');
  const [userIdSearch, setUserIdSearch] = useState<string>(''); // 사용자 ID 검색 추가
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // 다중 선택 상태
  const [selectedSourceItems, setSelectedSourceItems] = useState<SelectedItem[]>([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourcesLoading, setSourcesLoading] = useState<boolean>(false);

  // 페이지네이션 상태
  const [currentBlogPage, setCurrentBlogPage] = useState<number>(1);
  const [currentSourcePage, setCurrentSourcePage] = useState<number>(1);
  const [totalBlogPosts, setTotalBlogPosts] = useState<number>(0);
  const [totalSources, setTotalSources] = useState<number>(0);
  const itemsPerPage = 15; // 페이지당 15개 항목

  // 이미 블로그에 추가된 항목 상태 및 필터링 설정
  const [existingBlogItems, setExistingBlogItems] = useState<ExistingBlogItem[]>([]);
  const [hideExistingItems, setHideExistingItems] = useState<boolean>(true);

  const supabase = createSupabaseBrowserClient();

  // 블로그 게시물 불러오기
  const loadBlogPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select(
          `
          *,
          source:source_id(id, title, canonical_url, source_type, image_url),
          summary:summary_id(id, title, category, key_sentence, keywords, purpose)
        `
        )
        .order('published_at', { ascending: false });

      if (searchTerm) {
        query = query.or(
          `summary.title.ilike.%${searchTerm}%,summary.key_sentence.ilike.%${searchTerm}%`
        );
      }

      if (selectedCategory) {
        query = query.eq('summary.category', selectedCategory);
      }

      // 먼저 전체 데이터 카운트를 얻기 위한 쿼리 실행
      const { count } = await supabase
        .from('blog_posts')
        .select('id', { count: 'exact', head: true });

      setTotalBlogPosts(count || 0);

      // 페이지네이션 범위 계산
      const from = (currentBlogPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // 범위로 제한된 데이터 가져오기
      query = query.range(from, to);
      const { data, error } = await query;

      if (error) throw error;
      setBlogPosts((data as BlogPost[]) || []);

      // 기존 블로그 항목 데이터 수집 - 이 부분이 추가됨
      const existingItems = (data as BlogPost[]).map((post) => ({
        sourceId: post.source_id,
        summaryId: post.summary_id,
      }));

      // 페이지네이션되지 않은 모든 블로그 게시물 정보 가져오기
      const { data: allPosts, error: allPostsError } = await supabase
        .from('blog_posts')
        .select('source_id, summary_id');

      if (allPostsError) throw allPostsError;

      // 모든 기존 항목 설정
      setExistingBlogItems((allPosts as ExistingBlogItem[]) || []);

      // 카테고리 목록 가져오기
      const uniqueCategories = Array.from(
        new Set(data?.map((post) => post.summary?.category).filter(Boolean))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('블로그 게시물 불러오기 오류:', error);
      alert('블로그 게시물을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 콘텐츠 소스 필터링 함수 (이미 블로그에 추가된 항목 필터링)
  const filterContentSources = (sources: SourceWithSummaries[]): SourceWithSummaries[] => {
    if (!hideExistingItems) return sources;

    return sources
      .map((source) => {
        // summaries 배열에서 이미 블로그에 추가된 항목 필터링
        const filteredSummaries =
          source.summaries?.filter(
            (summary) =>
              !existingBlogItems.some(
                (item) => item.source_id === source.id && item.summary_id === summary.id
              )
          ) || [];

        return {
          ...source,
          summaries: filteredSummaries,
        };
      })
      .filter((source) => source.summaries && source.summaries.length > 0); // 필터링 후 summary가 없는 소스는 제외
  };

  // 원본 콘텐츠 및 요약 검색
  const searchContentSources = async () => {
    setSourcesLoading(true);
    try {
      let query = supabase
        .from('content_sources')
        .select(
          `
          *,
          summaries:content_summaries(id, title, category, key_sentence, keywords, purpose)
        `
        )
        .order('created_at', { ascending: false });

      if (sourceSearchTerm) {
        query = query.or(`title.ilike.%${sourceSearchTerm}%,content.ilike.%${sourceSearchTerm}%`);
      }

      // 먼저 전체 카운트 가져오기
      const { count } = await supabase
        .from('content_sources')
        .select('id', { count: 'exact', head: true });

      setTotalSources(count || 0);

      // 페이지네이션 범위 계산
      const from = (currentSourcePage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // 범위로 제한된 데이터 가져오기
      query = query.range(from, to);
      const { data, error } = await query;

      if (error) throw error;

      // 결과를 필터링하여 설정 (이 부분이 수정됨)
      setSources(filterContentSources(data as SourceWithSummaries[]) || []);
    } catch (error) {
      console.error('콘텐츠 검색 오류:', error);
      alert('콘텐츠를 검색하는 중 오류가 발생했습니다.');
    } finally {
      setSourcesLoading(false);
    }
  };

  // 사용자 ID로 콘텐츠 소스 검색 (수정됨)
  const searchContentSourcesByUserId = async (providedUserId: string | null = null) => {
    const idToSearch = providedUserId || userIdSearch.trim();

    if (!idToSearch) {
      alert('사용자 ID를 입력해주세요.');
      return;
    }

    setSourcesLoading(true);
    try {
      // 1. 먼저 user_id로 memos 테이블에서 source_id와 created_at 함께 조회
      const { data: memoData, error: memoError } = await supabase
        .from('memos')
        .select('source_id, created_at')
        .eq('user_id', idToSearch)
        .not('source_id', 'is', null)
        .order('created_at', { ascending: false }); // 메모 생성일 기준으로 최신순 정렬

      if (memoError) throw memoError;

      // 추출한 source_id가 없으면 빈 결과 반환
      if (!memoData || memoData.length === 0) {
        setSources([]);
        setSourcesLoading(false);
        return;
      }

      // 2. source_id 목록 추출 (중복 제거 - 최신 생성일 기준으로)
      // 같은 source_id가 있을 경우 최신 메모의 순서를 유지
      const sourceIdMap = new Map();
      memoData.forEach((memo) => {
        if (!sourceIdMap.has(memo.source_id)) {
          sourceIdMap.set(memo.source_id, memo.created_at);
        }
      });

      // 최신순으로 정렬된 source_id 배열 생성
      const sourceIds = Array.from(sourceIdMap.keys());

      // 페이지네이션을 위한 총 건수 계산
      setTotalSources(sourceIds.length);

      // 페이지네이션 범위 계산
      const from = (currentSourcePage - 1) * itemsPerPage;
      const to = Math.min(from + itemsPerPage - 1, sourceIds.length - 1);

      // 현재 페이지에 표시할 ID 목록
      const pageSourceIds = sourceIds.slice(from, to + 1);

      if (pageSourceIds.length === 0) {
        setSources([]);
        setSourcesLoading(false);
        return;
      }

      // 3. 현재 페이지 ID들로 content_sources 조회
      const { data, error } = await supabase
        .from('content_sources')
        .select(
          `
        *,
        summaries:content_summaries(id, title, category, key_sentence, keywords, purpose)
      `
        )
        .in('id', pageSourceIds);

      if (error) throw error;

      // 4. 소스 데이터를 메모의 순서(최신순)대로 정렬
      const sortedData = [...(data as SourceWithSummaries[])].sort((a, b) => {
        // pageSourceIds 배열의 순서대로 정렬 (이미 최신순으로 정렬됨)
        return pageSourceIds.indexOf(a.id) - pageSourceIds.indexOf(b.id);
      });

      // 결과를 필터링하여 설정
      setSources(filterContentSources(sortedData) || []);
    } catch (error) {
      console.error('사용자 ID로 콘텐츠 검색 오류:', error);
      alert('사용자 ID로 콘텐츠를 검색하는 중 오류가 발생했습니다.');
    } finally {
      setSourcesLoading(false);
    }
  };

  // 항목 선택 토글 (카테고리 매개변수 추가)
  const toggleSourceSelection = (
    sourceId: string,
    summaryId: string,
    title: string,
    category: string
  ) => {
    const itemIndex = selectedSourceItems.findIndex(
      (item) => item.sourceId === sourceId && item.summaryId === summaryId
    );

    if (itemIndex === -1) {
      // 항목 추가 (카테고리 포함)
      setSelectedSourceItems([...selectedSourceItems, { sourceId, summaryId, title, category }]);
    } else {
      // 항목 제거
      setSelectedSourceItems(
        selectedSourceItems.filter(
          (item) => !(item.sourceId === sourceId && item.summaryId === summaryId)
        )
      );
    }
  };

  // 전체 선택/해제 (카테고리 추가)
  const toggleSelectAll = () => {
    if (selectedSourceItems.length === 0) {
      // 모든 항목 선택
      const allItems: SelectedItem[] = [];
      sources.forEach((source) => {
        if (source.summaries && source.summaries.length > 0) {
          source.summaries.forEach((summary) => {
            allItems.push({
              sourceId: source.id,
              summaryId: summary.id,
              title: summary.title,
              category: summary.category, // 카테고리 추가
            });
          });
        }
      });
      setSelectedSourceItems(allItems);
    } else {
      // 모두 해제
      setSelectedSourceItems([]);
    }
  };

  // 블로그에 게시물 추가
  const addToBlog = async (source: ContentSource, summary: ContentSummary) => {
    try {
      // 슬러그 생성 (URL 친화적인 문자열)
      const slug =
        summary.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-')
          .substring(0, 60) +
        '-' +
        Date.now().toString(36);

      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          source_id: source.id,
          summary_id: summary.id,
          category: summary.category,
          slug,
          published: true,
          featured: false,
          published_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      // 추가된 항목을 existingBlogItems에 추가
      setExistingBlogItems([
        ...existingBlogItems,
        { source_id: source.id, summary_id: summary.id },
      ]);

      alert('블로그에 게시물이 추가되었습니다!');
      loadBlogPosts();

      // 이미 추가된 항목 숨기기가 켜져 있으면 목록 새로고침
      if (hideExistingItems) {
        if (userIdSearch) {
          searchContentSourcesByUserId();
        } else if (sourceSearchTerm) {
          searchContentSources();
        }
      }

      setActiveTab('posts');
    } catch (error) {
      console.error('블로그 게시물 추가 오류:', error);
      alert('블로그에 게시물을 추가하는 중 오류가 발생했습니다.');
    }
  };

  // 여러 항목을 블로그에 추가 (카테고리 포함)
  const addMultipleToBlog = async () => {
    if (selectedSourceItems.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }

    if (!confirm(`${selectedSourceItems.length}개의 항목을 블로그에 추가하시겠습니까?`)) {
      return;
    }

    try {
      const blogPosts = selectedSourceItems.map((item) => {
        // 슬러그 생성
        const slug =
          item.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-')
            .substring(0, 60) +
          '-' +
          Date.now().toString(36) +
          '-' +
          Math.floor(Math.random() * 1000); // 중복 방지를 위한 랜덤값 추가

        return {
          source_id: item.sourceId,
          summary_id: item.summaryId,
          category: item.category, // 카테고리 추가
          slug,
          published: true,
          featured: false,
          published_at: new Date().toISOString(),
        };
      });

      const { data, error } = await supabase.from('blog_posts').insert(blogPosts).select();

      if (error) throw error;

      // 추가된 항목들을 existingBlogItems에 추가
      const newExistingItems = selectedSourceItems.map((item) => ({
        source_id: item.sourceId,
        summary_id: item.summaryId,
      }));

      setExistingBlogItems([...existingBlogItems, ...newExistingItems]);

      alert(`${selectedSourceItems.length}개의 게시물이 블로그에 추가되었습니다!`);
      setSelectedSourceItems([]);
      loadBlogPosts();
      setActiveTab('posts');
    } catch (error) {
      console.error('블로그 게시물 일괄 추가 오류:', error);
      alert('블로그에 게시물을 추가하는 중 오류가 발생했습니다.');
    }
  };

  // 블로그에서 게시물 삭제
  const removeFromBlog = async (id: string) => {
    if (!confirm('정말로 이 게시물을 블로그에서 삭제하시겠습니까?')) return;

    try {
      // 삭제 전에 항목 정보 저장
      const postToRemove = blogPosts.find((post) => post.id === id);

      const { error } = await supabase.from('blog_posts').delete().eq('id', id);

      if (error) throw error;

      // existingBlogItems에서도 해당 항목 제거
      if (postToRemove) {
        setExistingBlogItems(
          existingBlogItems.filter(
            (item) =>
              !(
                item.source_id === postToRemove.source_id &&
                item.summary_id === postToRemove.summary_id
              )
          )
        );
      }

      alert('게시물이 블로그에서 삭제되었습니다.');
      setBlogPosts(blogPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error('블로그 게시물 삭제 오류:', error);
      alert('게시물을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  // 페이지네이션 컴포넌트
  const Pagination = ({
    currentPage,
    totalItems,
    onPageChange,
  }: {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    // 페이지 버튼 생성 (최대 5개)
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              1
            </button>
            {startPage > 2 && <span className="px-1">...</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // 이메일 기반으로 사용자 ID 자동 설정 및 검색 수행
  useEffect(() => {
    // 콘텐츠 추가 탭이 활성화되고 사용자 이메일이 있는 경우
    if (activeTab === 'sources' && currentUser?.email) {
      const userId = getUserIdForEmail(currentUser.email);
      if (userId) {
        setUserIdSearch(userId);
        searchContentSourcesByUserId(userId);
      }
    }
  }, [activeTab, currentUser?.email]);

  // 페이지 변경시 데이터 로드
  useEffect(() => {
    if (activeTab === 'posts') {
      loadBlogPosts();
    }
  }, [currentBlogPage]);

  useEffect(() => {
    if (activeTab === 'sources') {
      if (userIdSearch) {
        searchContentSourcesByUserId();
      } else if (sourceSearchTerm) {
        searchContentSources();
      }
    }
  }, [currentSourcePage]);

  // 필터링 옵션 변경 시 데이터 다시 로드
  useEffect(() => {
    if (activeTab === 'sources') {
      if (userIdSearch) {
        searchContentSourcesByUserId();
      } else if (sourceSearchTerm) {
        searchContentSources();
      }
    }
  }, [hideExistingItems]);

  // 초기 데이터 로드
  useEffect(() => {
    loadBlogPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">블로그 관리</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{currentUser?.email}</span>
              <Link
                href="/blog"
                target="_blank"
                className="text-emerald-600 hover:text-emerald-800"
              >
                블로그 보기
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab('posts');
                setCurrentBlogPage(1);
                loadBlogPosts();
              }}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'posts'
                  ? 'bg-white text-emerald-600 border-t border-l border-r border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              블로그 게시물
            </button>
            <button
              onClick={() => {
                setActiveTab('sources');
                setCurrentSourcePage(1);
                // 이메일 기반으로 사용자 ID 자동 설정
                const userId = getUserIdForEmail(currentUser?.email);
                if (userId) {
                  setUserIdSearch(userId);
                  // 검색 자동 실행
                  searchContentSourcesByUserId(userId);
                }
              }}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'sources'
                  ? 'bg-white text-emerald-600 border-t border-l border-r border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              콘텐츠 추가하기
            </button>
          </div>
        </div>

        {/* 블로그 게시물 탭 */}
        {activeTab === 'posts' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentBlogPage(1);
                  }}
                  placeholder="게시물 검색..."
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value || null);
                  setCurrentBlogPage(1);
                }}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="">모든 카테고리</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setCurrentBlogPage(1);
                  loadBlogPosts();
                }}
                className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
              >
                <RefreshCcw className="h-5 w-5" />
              </button>
            </div>

            {/* 게시물 목록 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      출처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      발행일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      조회수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : blogPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        블로그 게시물이 없습니다
                      </td>
                    </tr>
                  ) : (
                    blogPosts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {post.summary?.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            {post.summary?.category || '미분류'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.source?.source_type || '웹 콘텐츠'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.published_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.view_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <a
                              href={`/blog/post/${post.slug}`}
                              target="_blank"
                              className="text-indigo-600 hover:text-indigo-900"
                              title="보기"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </a>
                            <button
                              onClick={() => removeFromBlog(post.id)}
                              className="text-red-600 hover:text-red-900"
                              title="삭제"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <Pagination
              currentPage={currentBlogPage}
              totalItems={totalBlogPosts}
              onPageChange={(page) => setCurrentBlogPage(page)}
            />
          </div>
        )}

        {/* 콘텐츠 추가 탭 */}
        {activeTab === 'sources' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* 검색 옵션 */}
            <div className="flex flex-col gap-4 mb-6">
              {/* 키워드 검색 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={sourceSearchTerm}
                    onChange={(e) => setSourceSearchTerm(e.target.value)}
                    placeholder="원본 콘텐츠 검색..."
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={() => {
                    setCurrentSourcePage(1);
                    searchContentSources();
                  }}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
                >
                  키워드 검색
                </button>
              </div>

              {/* 사용자 ID 검색 - NEW */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    value={userIdSearch}
                    onChange={(e) => setUserIdSearch(e.target.value)}
                    placeholder="사용자 ID로 검색..."
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  onClick={() => {
                    setCurrentSourcePage(1);
                    searchContentSourcesByUserId();
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  사용자 ID로 검색
                </button>
              </div>
            </div>

            {/* 필터링 옵션 추가 - NEW */}
            <div className="mb-6 flex items-center">
              <button
                onClick={() => setHideExistingItems(!hideExistingItems)}
                className={`flex items-center px-3 py-2 text-sm border rounded-md ${
                  hideExistingItems
                    ? 'bg-gray-100 text-gray-700 border-gray-300'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {hideExistingItems ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    이미 추가된 항목 숨기는 중
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    모든 항목 표시 중
                  </>
                )}
              </button>
              <span className="ml-3 text-xs text-gray-500">
                {hideExistingItems
                  ? '이미 블로그에 추가된 항목은 표시되지 않습니다.'
                  : '모든 항목이 표시됩니다.'}
              </span>
            </div>

            {/* 선택된 항목 관리 및 일괄 추가 버튼 - NEW */}
            {selectedSourceItems.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{selectedSourceItems.length}개</span> 항목 선택됨
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSourceItems([])}
                      className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      선택 해제
                    </button>
                    <button
                      onClick={addMultipleToBlog}
                      className="px-3 py-1 text-xs text-white bg-emerald-600 rounded hover:bg-emerald-700"
                    >
                      <PlusCircle className="h-3 w-3 mr-1 inline" />
                      선택한 항목 추가하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 검색 결과 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* 체크박스 열 추가 - NEW */}
                    <th className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedSourceItems.length > 0 && sources.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      원본 제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      타입
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요약
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sourcesLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : sources.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        {sourceSearchTerm || userIdSearch
                          ? hideExistingItems
                            ? '검색 결과가 없거나 모든 항목이 이미 블로그에 추가되었습니다.'
                            : '검색 결과가 없습니다.'
                          : '검색어를 입력하여 원본 콘텐츠를 검색하세요'}
                      </td>
                    </tr>
                  ) : (
                    sources.map((source) => (
                      <React.Fragment key={source.id}>
                        {source.summaries && source.summaries.length > 0 ? (
                          source.summaries.map((summary: ContentSummary, index: number) => (
                            <tr key={`${source.id}-${summary.id}`}>
                              {/* 체크박스 셀 추가 - NEW */}
                              <td className="px-2 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedSourceItems.some(
                                    (item) =>
                                      item.sourceId === source.id && item.summaryId === summary.id
                                  )}
                                  onChange={() =>
                                    toggleSourceSelection(
                                      source.id,
                                      summary.id,
                                      summary.title,
                                      summary.category
                                    )
                                  }
                                  className="w-4 h-4"
                                />
                              </td>
                              {index === 0 && (
                                <>
                                  <td className="px-6 py-4" rowSpan={source.summaries.length}>
                                    <div className="text-sm font-medium text-gray-900">
                                      {source.title || '제목 없음'}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">
                                      {source.canonical_url}
                                    </div>
                                  </td>
                                  <td
                                    className="px-6 py-4 whitespace-nowrap"
                                    rowSpan={source.summaries.length}
                                  >
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                      {source.source_type || 'Unknown'}
                                    </span>
                                  </td>
                                </>
                              )}
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{summary.title}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {summary.key_sentence?.substring(0, 60)}...
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                  {summary.category}
                                </span>
                                <div className="text-xs text-gray-500 mt-1">{summary.purpose}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => addToBlog(source, summary)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <PlusCircle className="h-4 w-4 mr-1" />
                                  블로그에 추가
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-2 py-4 text-center">
                              <input type="checkbox" disabled className="w-4 h-4 opacity-50" />
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {source.title || '제목 없음'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {source.source_type || 'Unknown'}
                              </span>
                            </td>
                            <td colSpan={3} className="px-6 py-4 text-sm text-gray-500">
                              이 원본에 대한 요약이 없습니다
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 소스 검색 결과 페이지네이션 */}
            <Pagination
              currentPage={currentSourcePage}
              totalItems={totalSources}
              onPageChange={(page) => setCurrentSourcePage(page)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
