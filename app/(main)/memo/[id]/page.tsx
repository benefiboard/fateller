'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MemoContent from '@/app/ui/MemoContent';
import { Memo } from '@/app/utils/types';
import { MoveLeft, Notebook, Quote } from 'lucide-react';
import useMemos from '@/app/hooks/useMemos';
import createSupabaseBrowserClient from '@/lib/supabse/client';

export default function MemoDetailPage() {
  const { id } = useParams();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createSupabaseBrowserClient();

  const {
    memos,

    error: memosError,
    createMemo,
    updateMemoWithAI,
    updateMemoDirect,
    deleteMemo,
    saveThought,
    deleteThought,
    likeMemo,
    retweetMemo,
    replyToMemo,
    loadMoreMemos,
    hasMore,
  } = useMemos({});

  useEffect(() => {
    async function loadMemo() {
      if (!id) return;

      try {
        setIsLoading(true);

        // Supabase에서 직접 메모 데이터 가져오기
        const { data, error } = await supabase.from('memos').select('*').eq('id', id).single();

        if (error) {
          console.error('메모 데이터 로딩 오류:', error);
          throw error;
        }

        // 타입 변환을 위한 포맷팅
        const formattedMemo: Memo = {
          id: data.id,
          title: data.title || '',
          tweet_main: data.tweet_main || {},
          hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
          thread: Array.isArray(data.thread) ? data.thread : [],
          labeling: {
            category: data.category || data.labeling?.category || '미분류',
            keywords: Array.isArray(data.keywords)
              ? data.keywords
              : Array.isArray(data.labeling?.keywords)
              ? data.labeling.keywords
              : [],
            key_sentence: data.key_sentence || data.labeling?.key_sentence || '',
          },
          original_text: data.original_text || '',
          original_url: data.original_url || undefined,
          original_title: data.original_title || undefined,
          original_image: data.original_image || undefined,
          time: new Date(data.created_at).toLocaleDateString(),
          likes: data.likes || 0,
          retweets: data.retweets || 0,
          replies: data.replies || 0,
          purpose: data.purpose || undefined,
          i_think: data.i_think || undefined,
        };

        setMemo(formattedMemo);
      } catch (error) {
        console.error('메모 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMemo();
  }, [id, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!memo) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">메모를 찾을 수 없습니다</h1>
          <Link href="/memo" className="text-emerald-600 hover:underline">
            메모 목록으로 돌아가기
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
            href="/memo"
            className="text-white hover:text-emerald-100 inline-flex items-center gap-2"
          >
            <MoveLeft />
            메모 목록
          </Link>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-2xl mx-auto bg-gray-50 sm:p-4">
        <div className="border border-gray-300 bg-gradient-to-r from-emerald-50/50 to-yellow-50/50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6 md:p-8">
            {/* 카테고리 */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                {memo.labeling?.category || '미분류'}
              </span>
            </div>

            {/* 제목 */}
            <h1 className="text-2xl font-bold mb-6">{memo.title}</h1>

            {/* 원본 링크 */}
            {/* {memo.original_url && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg w-full aspect-video">
                <Link href={memo.original_url} target="_blank" rel="noopener noreferrer">
                  {memo.original_image ? (
                    <img
                      src={memo.original_image}
                      alt="url_link"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video flex flex-col items-center justify-center gap-4 p-4 border-4 border-gray-200">
                      <Quote size={16} className="text-gray-400" />
                      <p className="text-center">{memo.title || '제목 없음'}</p>
                      <Quote size={16} className="text-gray-400" />
                    </div>
                  )}
                </Link>
              </div>
            )} */}

            {/* MemoContent 컴포넌트 사용 */}
            <div className="pb-4 flex flex-col border-b border-emerald-200">
              <div className="flex items-center gap-2">
                <Notebook className="text-emerald-600 w-4 h-4" />
                <p className="text-sm text-emerald-600">요약내용</p>
                <hr className="flex-1 border-emerald-600/25" />
              </div>

              <div className="my-2">
                <MemoContent
                  memo={memo}
                  expanded={true}
                  showLabeling={true}
                  showOriginal={true}
                  onToggleThread={() => {}}
                  onToggleLabeling={() => {}}
                  onToggleOriginal={() => {}}
                  isVisible={true}
                  hideImageInBlog={true}
                  onSaveThought={saveThought}
                  onDeleteThought={deleteThought}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
