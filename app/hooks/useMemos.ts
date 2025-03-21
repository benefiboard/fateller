//app/hooks/useMemos.ts

'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/store/userStore';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { Memo } from '../utils/types';
import { formatTimeAgo } from '../utils/formatters';

interface SearchOptions {
  searchTerm?: string;
  category?: string | null;
  purpose?: string | null;
  sortOption?: 'latest' | 'oldest' | 'today';
}

export const useMemos = (options: SearchOptions = {}) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0); // 페이지 번호 (0부터 시작)
  const [hasMore, setHasMore] = useState(true); // 더 불러올 메모가 있는지 여부
  const PAGE_SIZE = 10; // 한 번에 로드할 메모 개수
  const currentUser = useUserStore((state) => state.currentUser);
  const supabase = createSupabaseBrowserClient();

  const user_id = currentUser?.id || '';

  // Supabase에서 메모 불러오기
  const loadMemos = async (resetPage = false) => {
    if (!user_id) {
      console.warn('로그인된 사용자가 없습니다.');
      setMemos([]);
      return;
    }

    if (resetPage) {
      setPage(0);
      setMemos([]);
    }

    // 더 불러올 메모가 없으면 중단
    if (!hasMore && !resetPage) return;

    setIsLoading(true);
    setError(null);

    try {
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      // 기본 쿼리 생성
      let query = supabase.from('memos').select('*', { count: 'exact' });

      // 사용자 ID로 필터링 (항상 적용)
      query = query.eq('user_id', user_id);

      // 카테고리 필터링
      if (options.category) {
        query = query.eq('category', options.category);
      }

      // 목적 필터링 추가
      if (options.purpose) {
        query = query.eq('purpose', options.purpose);
      }

      // 날짜 필터링 ("오늘" 옵션)
      if (options.sortOption === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      }

      // 검색어 적용 (title, tweet_main, key_sentence, original_text 필드에서 검색)
      if (options.searchTerm && options.searchTerm.trim() !== '') {
        const searchTerm = options.searchTerm.trim();

        // 단일 필드 검색으로 단순화 (테스트용)
        query = query.ilike('title', `%${searchTerm}%`);

        // 성공적으로 작동하면 아래 코드를 사용하여 다중 필드 검색 적용
        /*
        query = query.or(
          `title.ilike.%${searchTerm}%,` + 
          `tweet_main.ilike.%${searchTerm}%,` +
          `key_sentence.ilike.%${searchTerm}%,` +
          `original_text.ilike.%${searchTerm}%`
        );
        */

        console.log(`검색어 "${searchTerm}" 적용, 수정된 쿼리 방식 사용`);
      }

      // 정렬 적용
      if (options.sortOption === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        // 기본값과 'today' 옵션 모두 최신순 정렬
        query = query.order('created_at', { ascending: false });
      }

      // 페이지네이션 적용
      query = query.range(start, end);

      // 디버깅용 로그
      console.log('쿼리 실행:', {
        searchTerm: options.searchTerm,
        category: options.category,
        sortOption: options.sortOption,
      });

      // 최종 쿼리 실행
      const { data, error, count } = await query;

      if (error) {
        console.error('메모 불러오기 오류:', error);
        throw error;
      }

      console.log(`쿼리 결과: ${data?.length}개 항목 반환`);

      // Supabase에서 가져온 데이터를 애플리케이션 형식으로 변환
      const formattedMemos: Memo[] = data.map((memo: any) => ({
        id: memo.id,
        title: memo.title,
        tweet_main: memo.tweet_main,
        hashtags: memo.hashtags,
        thread: memo.thread,
        original_text: memo.original_text,
        original_url: memo.original_url,
        original_title: memo.original_title,
        original_image: memo.original_image,
        labeling: {
          category: memo.category,
          keywords: memo.keywords,
          key_sentence: memo.key_sentence,
        },
        time: formatTimeAgo(new Date(memo.created_at)),
        likes: memo.likes || 0,
        retweets: memo.retweets || 0,
        replies: memo.replies || 0,
        purpose: memo.purpose || '일반',
      }));

      // 기존 메모에 새로 불러온 메모 추가 (첫 페이지면 교체)
      setMemos((prevMemos) => (resetPage ? formattedMemos : [...prevMemos, ...formattedMemos]));

      // 더 불러올 메모가 있는지 확인 - 개선된 로직
      setHasMore(data.length === PAGE_SIZE);

      // 다음 페이지로 설정
      if (data.length > 0) {
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error: any) {
      console.error('메모 불러오기 중 오류가 발생했습니다:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // loadMemosWithFixedRange 함수 전체 수정
  const loadMemosWithFixedRange = async () => {
    if (!user_id) {
      console.warn('로그인된 사용자가 없습니다.');
      setMemos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 항상 첫 번째 범위(0-9)로 고정
      const fixedStart = 0;
      const fixedEnd = PAGE_SIZE - 1;
      console.log(`고정 범위로 쿼리 실행: ${fixedStart}-${fixedEnd}`);

      // 기본 쿼리 생성
      let query = supabase.from('memos').select('*', { count: 'exact' });

      // 사용자 ID로 필터링 (항상 적용)
      query = query.eq('user_id', user_id);

      // 카테고리 필터링
      if (options.category) {
        query = query.eq('category', options.category);
      }

      // 목적 필터링 추가
      if (options.purpose) {
        query = query.eq('purpose', options.purpose);
      }

      // 검색어 적용 (단순화된 방식)
      if (options.searchTerm && options.searchTerm.trim() !== '') {
        const searchTerm = options.searchTerm.trim();

        // 단일 필드 검색으로 단순화 (테스트용)
        // query = query.ilike('title', `%${searchTerm}%`);

        //검색이 잘 되면 다중 필드 검색으로 확장할 수 있습니다
        query = query.or(
          `title.ilike.%${searchTerm}%,` +
            `tweet_main.ilike.%${searchTerm}%,` +
            `key_sentence.ilike.%${searchTerm}%,` +
            `keywords.cs.{${searchTerm}}` // 배열을 텍스트로 변환하여 검색
        );
      }

      // 날짜 필터링 ("오늘" 옵션)
      if (options.sortOption === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      }

      // 정렬 적용
      if (options.sortOption === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // 고정 범위 페이지네이션 적용
      query = query.range(fixedStart, fixedEnd);

      console.log('고정 쿼리 실행:', {
        searchTerm: options.searchTerm,
        category: options.category,
        sortOption: options.sortOption,
        range: `${fixedStart}-${fixedEnd}`,
      });

      // 쿼리 실행
      const { data, error, count } = await query;

      // 디버깅용 로그 추가
      console.log(`쿼리 결과: ${data?.length}개 항목, 총 ${count || 0}개 중`);

      if (error) {
        console.error('메모 불러오기 오류:', error);
        throw error;
      }

      // 여기가 중요: 데이터 변환 코드를 완전히 구현
      const formattedMemos: Memo[] = data.map((memo: any) => ({
        id: memo.id,
        title: memo.title,
        tweet_main: memo.tweet_main,
        hashtags: memo.hashtags || [],
        thread: memo.thread || [],
        original_text: memo.original_text || '',
        original_url: memo.original_url || '',
        original_title: memo.original_title || '',
        original_image: memo.original_image || '',
        labeling: {
          category: memo.category || '미분류',
          keywords: memo.keywords || [],
          key_sentence: memo.key_sentence || '',
        },
        time: formatTimeAgo(new Date(memo.created_at)),
        likes: memo.likes || 0,
        retweets: memo.retweets || 0,
        replies: memo.replies || 0,
        purpose: memo.purpose || '일반',
      }));

      // 완전히 새 배열로 교체
      setMemos(formattedMemos);

      // 페이지 상태 업데이트 (항상 1로 설정)
      setPage(1);

      // 더 불러올 메모가 있는지 확인
      setHasMore((count || 0) > PAGE_SIZE);
    } catch (error: any) {
      console.error('메모 불러오기 중 오류:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMemos = () => {
    if (!isLoading && hasMore) {
      loadMemos(false);
    }
  };

  const showAIOverloadAlert = () => {
    // 브라우저 환경인 경우에만 실행
    if (typeof window !== 'undefined') {
      // 브라우저 기본 alert 사용
      alert('요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');

      // 또는 토스트/모달 라이브러리 사용 (프로젝트에 따라 선택)
      // import { toast } from 'react-toastify';
      // toast.error('현재 AI 서비스가 혼잡합니다. 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  // API 호출하여 트윗 분석하기
  const analyzeWithAI = async (
    text: string,
    metadata: any = {},
    retryCount = 0,
    maxRetries = 1
  ) => {
    try {
      console.log(
        `텍스트 분석 요청 ${retryCount > 0 ? `(재시도 ${retryCount}/${maxRetries})` : ''}`
      );

      const response = await fetch('/api/labeling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          originalTitle: metadata.originalTitle || '',
          originalImage: metadata.originalImage || '',
          purpose: metadata.purpose || '일반',
          sourceId: metadata.sourceId || null,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // 타임아웃 또는 서버 오류인 경우 재시도
        if (
          (response.status === 408 || response.status === 504 || response.status === 500) &&
          retryCount < maxRetries &&
          (responseData.isTimeout || responseData.error?.includes('시간 초과'))
        ) {
          console.log(`API 요청 시간 초과, ${retryCount + 1}번째 재시도 중...`);

          // 재시도 전 1.5초 대기 (서버 부하 감소)
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // 재귀적으로 재시도
          return analyzeWithAI(text, metadata, retryCount + 1, maxRetries);
        }

        // 최대 재시도 횟수를 초과한 경우 사용자 친화적인 메시지 표시
        if (retryCount >= maxRetries) {
          showAIOverloadAlert();
          throw new Error(
            '현재 AI 요청이 많아 처리가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'
          );
        }

        throw new Error(responseData.error || '분석 중 오류가 발생했습니다.');
      }

      // JSON 형식이 아니거나 필수 필드가 없는 경우 재시도
      if (!responseData.title || !responseData.tweet_main) {
        if (retryCount < maxRetries) {
          console.log(`API 응답이 올바르지 않음, ${retryCount + 1}번째 재시도 중...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return analyzeWithAI(text, metadata, retryCount + 1, maxRetries);
        } else {
          showAIOverloadAlert();
          throw new Error('AI 응답이 올바른 형식이 아닙니다. 현재 시스템이 혼잡한 것 같습니다.');
        }
      }

      return responseData;
    } catch (error: any) {
      console.error('API 요청 오류:', error);

      // 네트워크 오류나 JSON 파싱 오류인 경우 재시도
      if (
        retryCount < maxRetries &&
        (error.message.includes('fetch') || error.message.includes('JSON'))
      ) {
        console.log(`네트워크 오류, ${retryCount + 1}번째 재시도 중...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return analyzeWithAI(text, metadata, retryCount + 1, maxRetries);
      }

      // 최대 재시도 후 실패 시 사용자 친화적인 알림
      if (retryCount >= maxRetries) {
        showAIOverloadAlert();
      }

      throw new Error(`분석 실패: ${error.message}`);
    }
  };

  // 임베딩 생성 또는 참조 함수
  const createEmbedding = async (
    memoId: string,
    sourceId: string | null,
    memoData: any
  ): Promise<boolean> => {
    try {
      if (sourceId) {
        // 1. 먼저 해당 소스에 대한 임베딩이 이미 있는지 확인
        const { data: existingEmbedding } = await supabase
          .from('source_embeddings')
          .select('id')
          .eq('source_id', sourceId)
          .limit(1);

        if (existingEmbedding && existingEmbedding.length > 0) {
          console.log(
            `소스 ID ${sourceId}에 대한 임베딩이 이미 존재합니다. 참조만 업데이트합니다.`
          );

          // 2A. 이미 임베딩이 있다면 메모에 임베딩 ID만 연결
          const { error: updateError } = await supabase
            .from('memos')
            .update({
              embedding_id: existingEmbedding[0].id,
              has_embedding: true,
            })
            .eq('id', memoId)
            .eq('user_id', user_id);

          if (updateError) {
            console.error('임베딩 참조 업데이트 오류:', updateError);
            return false;
          }

          return true;
        }
      }

      // 2B. 임베딩이 없으면 새로 생성
      // 임베딩에 사용할 텍스트 구성
      const textToEmbed = [
        memoData.title,
        memoData.tweet_main,
        memoData.key_sentence || memoData.labeling?.key_sentence,
        ...(Array.isArray(memoData.thread) ? memoData.thread : []),
        ...(Array.isArray(memoData.keywords)
          ? memoData.keywords
          : Array.isArray(memoData.labeling?.keywords)
          ? memoData.labeling.keywords
          : []),
      ]
        .filter(Boolean)
        .join(' ');

      if (!textToEmbed.trim()) {
        console.error('임베딩할 텍스트가 없습니다:', memoId);
        return false;
      }

      console.log('새 임베딩 생성을 위해 OpenAI API 호출...');

      // OpenAI API로 임베딩 생성
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${
            process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
          }`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: textToEmbed.slice(0, 8000), // 입력 제한
        }),
      });

      if (!embeddingResponse.ok) {
        const errorData = await embeddingResponse.json();
        console.error('OpenAI 임베딩 API 오류:', errorData);
        return false;
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // 3. 새 임베딩을 source_embeddings 테이블에 저장
      const { data: newEmbedding, error: insertError } = await supabase
        .from('source_embeddings')
        .insert({
          source_id: sourceId,
          embedding,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('임베딩 저장 오류:', insertError);
        return false;
      }

      // 4. 메모에 새 임베딩 ID 연결
      const { error: updateError } = await supabase
        .from('memos')
        .update({
          embedding_id: newEmbedding.id,
          has_embedding: true,
        })
        .eq('id', memoId)
        .eq('user_id', user_id);

      if (updateError) {
        console.error('메모 업데이트 오류:', updateError);
        return false;
      }

      console.log(
        '임베딩 생성 및 연결 성공:',
        memoId,
        sourceId ? `(소스 ID: ${sourceId})` : '',
        `(차원: ${embedding.length})`
      );
      return true;
    } catch (error) {
      console.error('임베딩 처리 중 오류:', error);
      return false;
    }
  };

  // 메모 생성
  const createMemo = async (text: string, options: any = {}) => {
    if (!user_id) {
      throw new Error('로그인이 필요합니다.');
    }

    setIsLoading(true);
    setError(null);

    try {
      // AI 분석 요청을 별도의 try-catch 블록으로 분리
      let aiResponse;
      try {
        aiResponse = await analyzeWithAI(text, {
          originalTitle: options.originalTitle,
          originalImage: options.originalImage,
          purpose: options.purpose || '일반',
          sourceId: options.sourceId,
        });

        // API 응답 확인
        if (aiResponse.error) {
          throw new Error(aiResponse.error);
        }

        // 응답 형식 확인 - 필수 필드가 있는지 검사
        if (!aiResponse.title || !aiResponse.tweet_main || !aiResponse.thread) {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
      } catch (analyzeError: any) {
        // AI 분석 실패 시 사용자 친화적인 메시지 설정
        console.error('AI 분석 오류:', analyzeError);

        // 로딩 상태 해제
        setIsLoading(false);

        // 사용자에게 표시할 메시지 설정
        let errorMessage;
        if (
          analyzeError.message.includes('시간 초과') ||
          analyzeError.message.includes('timeout')
        ) {
          errorMessage = '현재 AI 서비스가 혼잡합니다. 잠시 후 다시 시도해 주세요.';
        } else if (analyzeError.message.includes('API 응답이 올바른 형식이 아닙니다')) {
          errorMessage = 'AI가 올바른 형식으로 응답하지 않았습니다. 다시 시도해 주세요.';
        } else {
          errorMessage = `AI 분석 중 오류가 발생했습니다: ${analyzeError.message}`;
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // 저장할 원본 텍스트 결정 - URL이면 URL 자체를 저장, 아니면 추출된 텍스트
      const originalTextToSave = text; // 항상 추출된 텍스트나 사용자가 입력한 텍스트 저장
      const originalUrl = options.isUrl ? options.sourceUrl : null; // URL이면 URL 저장, 아니면 null

      const memoData = {
        user_id: user_id,
        title: aiResponse.title,
        tweet_main: aiResponse.tweet_main,
        hashtags: aiResponse.hashtags || [],
        thread: aiResponse.thread || [],
        original_title: aiResponse.originalTitle || options.originalTitle || '',
        original_image: aiResponse.originalImage || options.originalImage || '',
        original_text: originalTextToSave,
        original_url: originalUrl || '',
        category: aiResponse.labeling?.category || '미분류',
        keywords: aiResponse.labeling?.keywords || [],
        key_sentence: aiResponse.labeling?.key_sentence || '',
        purpose: options.purpose || '일반',
        source_id: options.sourceId || null, // 추가: 소스 ID 연결
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        replies: 0,
        has_embedding: false, // 임베딩 상태 추적을 위한 필드 추가
      };

      // 새 메모 생성 (Supabase)
      const { data, error } = await supabase.from('memos').insert(memoData).select();

      if (error) {
        throw new Error(`메모 생성 오류: ${error.message}`);
      }

      const newMemo = data[0];

      // 로컬 상태에 새 메모 추가
      const formattedNewMemo: Memo = {
        id: newMemo.id,
        title: newMemo.title,
        tweet_main: newMemo.tweet_main,
        hashtags: newMemo.hashtags,
        thread: newMemo.thread,
        original_text: newMemo.original_text,
        original_title: newMemo.original_title || options.originalTitle || '',
        original_image: newMemo.original_image || options.originalImage || '',
        original_url: newMemo.original_url || options.sourceUrl || '',
        labeling: {
          category: newMemo.category,
          keywords: newMemo.keywords,
          key_sentence: newMemo.key_sentence,
        },
        source_id: newMemo.source_id, // 추가: source_id 필드
        time: '방금',
        likes: 0,
        retweets: 0,
        replies: 0,
        purpose: newMemo.purpose || '일반',
      };

      // 새 메모 추가
      setMemos((prevMemos) => [formattedNewMemo, ...prevMemos]);

      // 임베딩
      // if (options.sourceId) {
      //   // 비동기로 임베딩 생성 (UI 흐름에 영향 없이 백그라운드에서 처리)
      //   setTimeout(async () => {
      //     try {
      //       const embeddingResult = await createEmbedding(
      //         newMemo.id,
      //         options.sourceId, // sourceId 전달
      //         {
      //           title: aiResponse.title,
      //           tweet_main: aiResponse.tweet_main,
      //           key_sentence: aiResponse.labeling?.key_sentence,
      //           thread: aiResponse.thread,
      //           keywords: aiResponse.labeling?.keywords,
      //         }
      //       );

      //       if (embeddingResult) {
      //         await supabase
      //           .from('memos')
      //           .update({ has_embedding: true })
      //           .eq('id', newMemo.id)
      //           .eq('user_id', user_id);
      //       }
      //     } catch (embeddingError) {
      //       console.error('임베딩 생성 오류:', embeddingError);
      //     }
      //   }, 100);
      // } else {
      //   // sourceId가 없는 일반 텍스트 - 항상 새로운 임베딩 생성
      //   setTimeout(async () => {
      //     try {
      //       const embeddingResult = await createEmbedding(
      //         newMemo.id,
      //         null, // sourceId 없음
      //         {
      //           title: aiResponse.title,
      //           tweet_main: aiResponse.tweet_main,
      //           key_sentence: aiResponse.labeling?.key_sentence,
      //           thread: aiResponse.thread,
      //           keywords: aiResponse.labeling?.keywords,
      //         }
      //       );

      //       if (embeddingResult) {
      //         await supabase
      //           .from('memos')
      //           .update({ has_embedding: true })
      //           .eq('id', newMemo.id)
      //           .eq('user_id', user_id);
      //       }
      //     } catch (embeddingError) {
      //       console.error('임베딩 생성 오류:', embeddingError);
      //     }
      //   }, 100);
      // }

      return newMemo;
    } catch (error: any) {
      // 이미 AI 분석 오류에 대해 처리했으므로 여기서는 다른 유형의 오류만 처리
      if (
        !error.message.includes('AI 분석 중 오류') &&
        !error.message.includes('AI가 올바른 형식으로 응답하지 않았습니다') &&
        !error.message.includes('현재 AI 서비스가 혼잡합니다')
      ) {
        console.error('Error creating memo:', error);
        setError(`메모를 생성하는 중 오류가 발생했습니다: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 메모 업데이트 (AI 분석)
  const updateMemoWithAI = async (memoId: string, text: string, options: any = {}) => {
    if (!user_id) {
      throw new Error('로그인이 필요합니다.');
    }

    setIsLoading(true);
    setError(null);

    try {
      // AI 분석 요청
      const aiResponse = await analyzeWithAI(text, {
        originalTitle: options.originalTitle,
        originalImage: options.originalImage,
        purpose: options.purpose || '일반',
        sourceId: options.sourceId,
      });

      const originalTextToSave = text; // 항상 추출된 텍스트나 사용자가 입력한 텍스트 저장
      const originalUrl = options.isUrl ? options.sourceUrl : null; // URL이면 URL 저장, 아니면 null

      // 업데이트 데이터 준비 (source_id 추가)
      const updateData = {
        title: aiResponse.title,
        tweet_main: aiResponse.tweet_main,
        hashtags: aiResponse.hashtags || [],
        thread: aiResponse.thread || [],
        original_title: aiResponse.originalTitle || options.originalTitle || '',
        original_image: aiResponse.originalImage || options.originalImage || '',
        original_text: originalTextToSave,
        original_url: originalUrl || '',
        category: aiResponse.labeling?.category || '미분류',
        keywords: aiResponse.labeling?.keywords || [],
        key_sentence: aiResponse.labeling?.key_sentence || '',
        purpose: options.purpose || '일반',
        source_id: options.sourceId || null, // 추가: 소스 ID 연결
        updated_at: new Date().toISOString(),
        has_embedding: false, // 업데이트 시 임베딩도 갱신 필요하므로 false로 설정
      };

      // 기존 메모 업데이트 (Supabase)
      const { data, error } = await supabase
        .from('memos')
        .update(updateData)
        .eq('id', memoId)
        .eq('user_id', user_id)
        .select();

      if (error) {
        throw new Error(`메모 업데이트 오류: ${error.message}`);
      }

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) =>
          memo.id === memoId
            ? {
                ...memo,
                title: aiResponse.title,
                tweet_main: aiResponse.tweet_main,
                hashtags: aiResponse.hashtags || [],
                thread: aiResponse.thread || [],
                original_text: text,
                original_title: aiResponse.originalTitle || options.originalTitle || '',
                original_image: aiResponse.originalImage || options.originalImage || '',
                original_url: options.isUrl ? options.sourceUrl : '',
                labeling: {
                  category: aiResponse.labeling?.category || '미분류',
                  keywords: aiResponse.labeling?.keywords || [],
                  key_sentence: aiResponse.labeling?.key_sentence || '',
                },
                source_id: options.sourceId || null, // 추가: source_id 필드
                time: formatTimeAgo(new Date()),
                purpose: options.purpose || '일반',
              }
            : memo
        )
      );

      // URL에서 추출한 콘텐츠는 임베딩 생성 건너뛰기 (비용 절감)
      // if (!options.sourceId) {
      //   // 비동기로 임베딩 생성 (UI 흐름에 영향 없이 백그라운드에서 처리)
      //   setTimeout(async () => {
      //     try {
      //       const embeddingResult = await createEmbedding(memoId, options.sourceId, {
      //         title: aiResponse.title,
      //         tweet_main: aiResponse.tweet_main,
      //         key_sentence: aiResponse.labeling?.key_sentence,
      //         thread: aiResponse.thread,
      //         keywords: aiResponse.labeling?.keywords,
      //       });

      //       if (embeddingResult) {
      //         await supabase
      //           .from('memos')
      //           .update({ has_embedding: true })
      //           .eq('id', memoId)
      //           .eq('user_id', user_id);
      //       }
      //     } catch (embeddingError) {
      //       console.error('임베딩 생성 오류:', embeddingError);
      //     }
      //   }, 100);
      // } else {
      //   // source_id가 있는 경우 이미 임베딩이 있다고 가정하고 플래그 설정
      //   await supabase
      //     .from('memos')
      //     .update({ has_embedding: true })
      //     .eq('id', memoId)
      //     .eq('user_id', user_id);
      // }

      return data && data[0] ? data[0] : null;
    } catch (error: any) {
      console.error('Error updating memo with AI:', error);
      setError(`메모를 업데이트하는 중 오류가 발생했습니다: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 메모 직접 업데이트
  const updateMemoDirect = async (
    memoId: string,
    updateData: {
      title: string;
      tweet_main: string;
      thread: string[];
      category: string;
      keywords: string[];
      key_sentence: string;
      purpose: string;
    }
  ) => {
    if (!user_id) {
      throw new Error('로그인이 필요합니다.');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Supabase에 업데이트
      const { data, error } = await supabase
        .from('memos')
        .update({
          title: updateData.title,
          tweet_main: updateData.tweet_main,
          thread: updateData.thread,
          category: updateData.category,
          keywords: updateData.keywords,
          key_sentence: updateData.key_sentence,
          purpose: updateData.purpose || '일반',
          updated_at: new Date().toISOString(),
        })
        .eq('id', memoId)
        .eq('user_id', user_id)
        .select();

      if (error) {
        throw new Error(`메모 업데이트 오류: ${error.message}`);
      }

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) =>
          memo.id === memoId
            ? {
                ...memo,
                title: updateData.title,
                tweet_main: updateData.tweet_main,
                thread: updateData.thread,
                labeling: {
                  category: updateData.category,
                  keywords: updateData.keywords,
                  key_sentence: updateData.key_sentence,
                },
                time: formatTimeAgo(new Date()),
              }
            : memo
        )
      );

      return data && data[0] ? data[0] : null;
    } catch (error: any) {
      console.error('Error updating memo directly:', error);
      setError(`메모를 업데이트하는 중 오류가 발생했습니다: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 메모 삭제
  const deleteMemo = async (memoId: string) => {
    if (!user_id) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', memoId)
        .eq('user_id', user_id);

      if (error) {
        throw new Error(`메모 삭제 오류: ${error.message}`);
      }

      // 로컬 상태에서 메모 제거
      setMemos((prevMemos) => prevMemos.filter((memo) => memo.id !== memoId));

      return true;
    } catch (error: any) {
      console.error('Error deleting memo:', error);
      setError(`메모를 삭제하는 중 오류가 발생했습니다: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 좋아요 처리
  const likeMemo = async (memoId: string) => {
    if (!user_id) return;

    try {
      // 먼저 현재 좋아요 수 가져오기
      const { data, error: fetchError } = await supabase
        .from('memos')
        .select('likes')
        .eq('id', memoId)
        .single();

      if (fetchError) throw fetchError;

      const currentLikes = data.likes || 0;
      const newLikes = currentLikes + 1;

      // 좋아요 수 업데이트
      const { error: updateError } = await supabase
        .from('memos')
        .update({ likes: newLikes })
        .eq('id', memoId);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) => (memo.id === memoId ? { ...memo, likes: newLikes } : memo))
      );
    } catch (error) {
      console.error('좋아요 업데이트 오류:', error);
    }
  };

  // 리트윗 처리
  const retweetMemo = async (memoId: string) => {
    if (!user_id) return;

    try {
      // 먼저 현재 리트윗 수 가져오기
      const { data, error: fetchError } = await supabase
        .from('memos')
        .select('retweets')
        .eq('id', memoId)
        .single();

      if (fetchError) throw fetchError;

      const currentRetweets = data.retweets || 0;
      const newRetweets = currentRetweets + 1;

      // 리트윗 수 업데이트
      const { error: updateError } = await supabase
        .from('memos')
        .update({ retweets: newRetweets })
        .eq('id', memoId);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) => (memo.id === memoId ? { ...memo, retweets: newRetweets } : memo))
      );
    } catch (error) {
      console.error('리트윗 업데이트 오류:', error);
    }
  };

  // 댓글 처리
  const replyToMemo = async (memoId: string) => {
    if (!user_id) return;

    try {
      // 먼저 현재 댓글 수 가져오기
      const { data, error: fetchError } = await supabase
        .from('memos')
        .select('replies')
        .eq('id', memoId)
        .single();

      if (fetchError) throw fetchError;

      const currentReplies = data.replies || 0;
      const newReplies = currentReplies + 1;

      // 댓글 수 업데이트
      const { error: updateError } = await supabase
        .from('memos')
        .update({ replies: newReplies })
        .eq('id', memoId);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) => (memo.id === memoId ? { ...memo, replies: newReplies } : memo))
      );
    } catch (error) {
      console.error('댓글 업데이트 오류:', error);
    }
  };

  // 초기 로딩
  useEffect(() => {
    if (user_id) {
      console.log('검색 옵션 변경 감지 - 메모 다시 로드');

      // 1. 상태 직접 초기화 (중요)
      setPage(0); // 페이지 강제 초기화
      setMemos([]); // 메모 배열 비우기
      setHasMore(true); // hasMore 초기화

      // 2. 초기화 후 지연시켜 로드 (상태 업데이트가 완료되도록)
      setTimeout(() => {
        loadMemosWithFixedRange(); // 새 함수 호출 (아래 정의)
      }, 50);
    } else {
      setMemos([]);
    }
  }, [user_id, options.searchTerm, options.category, options.purpose, options.sortOption]);

  return {
    memos,
    isLoading,
    error,
    loadMemos,
    loadMoreMemos,
    hasMore,
    createMemo,
    updateMemoWithAI,
    updateMemoDirect,
    deleteMemo,
    likeMemo,
    retweetMemo,
    replyToMemo,
  };
};

export default useMemos;
