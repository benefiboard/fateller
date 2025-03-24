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
} from 'lucide-react';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { BlogPost, ContentSource, ContentSummary, BlogCategory } from '@/app/utils/types';

// 소스 데이터 타입 정의
interface SourceWithSummaries extends ContentSource {
  summaries: ContentSummary[];
}

export default function AdminBlogPage() {
  // 상태 관리 - 타입 추가
  const { currentUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'sources'>('posts');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [sources, setSources] = useState<SourceWithSummaries[]>([]);

  // 검색 필터 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sourceSearchTerm, setSourceSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourcesLoading, setSourcesLoading] = useState<boolean>(false);

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

      const { data, error } = await query;

      if (error) throw error;
      setBlogPosts((data as BlogPost[]) || []);

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
        .order('created_at', { ascending: false })
        .limit(50);

      if (sourceSearchTerm) {
        query = query.or(`title.ilike.%${sourceSearchTerm}%,content.ilike.%${sourceSearchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSources((data as SourceWithSummaries[]) || []);
    } catch (error) {
      console.error('콘텐츠 검색 오류:', error);
      alert('콘텐츠를 검색하는 중 오류가 발생했습니다.');
    } finally {
      setSourcesLoading(false);
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

      alert('블로그에 게시물이 추가되었습니다!');
      loadBlogPosts();
      setActiveTab('posts');
    } catch (error) {
      console.error('블로그 게시물 추가 오류:', error);
      alert('블로그에 게시물을 추가하는 중 오류가 발생했습니다.');
    }
  };

  // 블로그에서 게시물 삭제
  const removeFromBlog = async (id: string) => {
    if (!confirm('정말로 이 게시물을 블로그에서 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);

      if (error) throw error;

      alert('게시물이 블로그에서 삭제되었습니다.');
      setBlogPosts(blogPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error('블로그 게시물 삭제 오류:', error);
      alert('게시물을 삭제하는 중 오류가 발생했습니다.');
    }
  };

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
              onClick={() => setActiveTab('sources')}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="게시물 검색..."
                  className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
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
                onClick={loadBlogPosts}
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
          </div>
        )}

        {/* 콘텐츠 추가 탭 */}
        {activeTab === 'sources' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                onClick={searchContentSources}
                className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors"
              >
                검색
              </button>
            </div>

            {/* 검색 결과 테이블 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      <td colSpan={5} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : sources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        {sourceSearchTerm
                          ? '검색 결과가 없습니다'
                          : '검색어를 입력하여 원본 콘텐츠를 검색하세요'}
                      </td>
                    </tr>
                  ) : (
                    sources.map((source) => (
                      <React.Fragment key={source.id}>
                        {source.summaries && source.summaries.length > 0 ? (
                          source.summaries.map((summary: ContentSummary, index: number) => (
                            <tr key={`${source.id}-${summary.id}`}>
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
          </div>
        )}
      </main>
    </div>
  );
}
