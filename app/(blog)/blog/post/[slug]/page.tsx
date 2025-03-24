// app/(blog)/blog/post/[slug]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MemoContent from '@/app/ui/MemoContent';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { BlogPost, ContentSource, ContentSummary, Memo } from '@/app/utils/types';
import { MoveLeft, Notebook, Quote } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [source, setSource] = useState<ContentSource | null>(null);
  const [summary, setSummary] = useState<ContentSummary | null>(null);
  const [formattedMemo, setFormattedMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;

      try {
        //console.log('로드 시작:', slug);
        // 1. 슬러그로 blog_posts 테이블에서 포스트 찾기
        const { data: postData, error: postError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (postError) {
          console.error('포스트 로딩 오류:', postError);
          setIsLoading(false);
          return;
        }

        if (!postData) {
          console.error('포스트 데이터가 없습니다.');
          setIsLoading(false);
          return;
        }

        setPost(postData as BlogPost);
        // console.log('포스트 데이터:', postData);

        // 2. source_id로 content_sources에서 원본 데이터 가져오기
        const { data: sourceData, error: sourceError } = await supabase
          .from('content_sources')
          .select('*')
          .eq('id', postData.source_id)
          .single();

        if (sourceError || !sourceData) {
          console.error('원본 데이터 로딩 오류:', sourceError);
          setIsLoading(false);
          return;
        }

        setSource(sourceData as ContentSource);
        // console.log('원본 데이터:', sourceData);

        // 3. summary_id로 content_summaries에서 요약 데이터 가져오기 (tweet_main 명시)
        const { data: summaryData, error: summaryError } = await supabase
          .from('content_summaries')
          .select('id, title, category, key_sentence, keywords, purpose, tweet_main, thread')
          .eq('id', postData.summary_id)
          .single();

        if (summaryError || !summaryData) {
          console.error('요약 데이터 로딩 오류:', summaryError);
          setIsLoading(false);
          return;
        }

        setSummary(summaryData as ContentSummary);
        // console.log('요약 데이터:', summaryData);

        // 4. MemoContent 컴포넌트에 전달할 형식으로 데이터 포맷팅
        // 이제 summaryData와 sourceData는 null이 아님이 보장됨
        const memoFormat: Memo = {
          id: postData.id,
          title: summaryData.title || '',
          tweet_main: summaryData.tweet_main || {},
          hashtags: Array.isArray(summaryData.keywords) ? summaryData.keywords : [],
          thread: Array.isArray(summaryData.thread) ? summaryData.thread : [],
          labeling: {
            category: summaryData.category || '미분류',
            keywords: Array.isArray(summaryData.keywords) ? summaryData.keywords : [],
            key_sentence: summaryData.key_sentence || '',
          },
          original_text: sourceData.content || '',
          original_url: sourceData.canonical_url || undefined,
          original_title: sourceData.title || undefined,
          original_image: sourceData.image_url || undefined,
          time: new Date(postData.published_at).toLocaleDateString(),
          likes: 0,
          retweets: 0,
          replies: 0,
          purpose: summaryData.purpose,
          source_id: sourceData.id,
        };

        setFormattedMemo(memoFormat);
        // console.log('포맷된 메모:', memoFormat);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!formattedMemo) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">게시물을 찾을 수 없습니다</h1>
          <Link href="/blog" className="text-emerald-600 hover:underline">
            블로그로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 tracking-tighter">
      {/* 헤더 */}
      <div className="bg-emerald-600 text-white py-4">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="text-white hover:text-emerald-100 inline-flex items-center gap-2"
          >
            <MoveLeft />
            리스트
          </Link>
          <Link
            href="/memo"
            className="text-emerald-800 hover:text-emerald-100   flex items-center"
          >
            <div className="px-4 py-2 bg-white/75 hover:bg-gray-800 flex items-center rounded-lg gap-2">
              <Notebook />
              <p className=" rounded-xl">서비스 시작하기</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-2xl mx-auto  ">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            {/* 카테고리 */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                {formattedMemo.labeling.category || '미분류'}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-bold mb-6">{formattedMemo.title}</h1>

            {/* 원본 링크 */}
            {formattedMemo.original_url && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg w-full aspect-video ">
                <Link href={formattedMemo.original_url} target="_blank" rel="noopener noreferrer">
                  {source?.image_url ? (
                    <img
                      src={source?.image_url}
                      alt="url_link"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className=" w-full aspect-video  flex flex-col items-center justify-center gap-4 p-4 border-4 border-gray-200">
                      <Quote size={16} className="text-gray-400" />
                      <p className="text-center">{formattedMemo?.title || '제목 없음'}</p>
                      <Quote size={16} className="text-gray-400" />
                    </div>
                  )}
                </Link>
                {/* <p className="text-sm text-gray-500 mb-2">원본 출처:</p>
                <a
                  href={formattedMemo.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {formattedMemo.original_url}
                </a> */}
              </div>
            )}

            {/* <hr className="border border-gray-600" /> */}

            {/* MemoContent 컴포넌트 사용 */}
            <div className=" pb-4  flex flex-col ">
              <div className="flex items-center gap-2">
                <Notebook className="text-emerald-600 w-4 h-4" />
                <p className="text-sm text-emerald-600">요약내용</p>
                <hr className="flex-1 border-emerald-600/25" />
              </div>

              <div className="my-2 border-y border-gray-300">
                <MemoContent
                  memo={formattedMemo}
                  expanded={true}
                  showLabeling={true}
                  showOriginal={true}
                  onToggleThread={() => {}}
                  onToggleLabeling={() => {}}
                  onToggleOriginal={() => {}}
                  isVisible={true}
                />
              </div>
            </div>
            {/* <hr className="border border-emerald-600/25 my-12" /> */}
            {/* 서비스 안내 */}
            <div className="mt-8 p-6 bg-emerald-50 rounded-lg border border-emerald-100">
              <h3 className="text-xl font-semibold text-emerald-800 mb-3">
                직접 콘텐츠를 요약해보세요
              </h3>
              <p className="text-gray-700 mb-4">
                Brain Labeling을 사용하면 복잡한 웹 콘텐츠와 영상을 AI가 자동으로 요약해줍니다.
              </p>
              <Link
                href="/memo"
                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                지금 시작하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
