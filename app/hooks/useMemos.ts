import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/store/userStore';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { Memo } from '../utils/types';
import { formatTimeAgo } from '../utils/formatters';

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useUserStore((state) => state.currentUser);
  const supabase = createSupabaseBrowserClient();

  const user_id = currentUser?.id || '';

  // Supabase에서 메모 불러오기
  const loadMemos = async () => {
    if (!user_id) {
      console.warn('로그인된 사용자가 없습니다.');
      setMemos([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('메모 불러오기 오류:', error);
        throw error;
      }

      // Supabase에서 가져온 데이터를 애플리케이션 형식으로 변환
      const formattedMemos: Memo[] = data.map((memo: any) => ({
        id: memo.id,
        title: memo.title,
        tweet_main: memo.tweet_main,
        hashtags: memo.hashtags,
        thread: memo.thread,
        original_text: memo.original_text,
        original_url: memo.original_url,
        labeling: {
          category: memo.category,
          keywords: memo.keywords,
          key_sentence: memo.key_sentence,
        },
        time: formatTimeAgo(new Date(memo.created_at)),
        likes: memo.likes || 0,
        retweets: memo.retweets || 0,
        replies: memo.replies || 0,
      }));

      setMemos(formattedMemos);
    } catch (error: any) {
      console.error('메모 불러오기 중 오류가 발생했습니다:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // API 호출하여 트윗 분석하기
  const analyzeWithAI = async (text: string) => {
    try {
      const response = await fetch('/api/labeling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || '분석 중 오류가 발생했습니다.');
      }

      return responseData;
    } catch (error: any) {
      console.error('API 요청 오류:', error);
      throw new Error(`분석 실패: ${error.message}`);
    }
  };

  // 메모 임베딩 생성 함수
  const createEmbedding = async (memoId: string, memoData: any): Promise<boolean> => {
    try {
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

      // Supabase에 임베딩 저장
      const { error: upsertError } = await supabase.from('memo_embeddings').upsert(
        {
          id: memoId,
          embedding,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (upsertError) {
        console.error('임베딩 저장 오류:', upsertError);
        return false;
      }

      console.log('임베딩 생성 성공:', memoId, `(차원: ${embedding.length})`);
      return true;
    } catch (error) {
      console.error('임베딩 생성 중 오류:', error);
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
      // AI 분석 요청
      const aiResponse = await analyzeWithAI(text);

      // API 응답 확인
      if (aiResponse.error) {
        throw new Error(aiResponse.error);
      }

      // 응답 형식 확인 - 필수 필드가 있는지 검사
      if (!aiResponse.title || !aiResponse.tweet_main || !aiResponse.thread) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }

      // 저장할 원본 텍스트 결정 - URL이면 URL 자체를 저장, 아니면 추출된 텍스트
      const originalTextToSave = text; // 항상 추출된 텍스트나 사용자가 입력한 텍스트 저장
      const originalUrl = options.isUrl ? options.sourceUrl : null; // URL이면 URL 저장, 아니면 null

      // 새 메모 생성 (Supabase)
      const { data, error } = await supabase
        .from('memos')
        .insert({
          user_id: user_id,
          title: aiResponse.title,
          tweet_main: aiResponse.tweet_main,
          hashtags: aiResponse.hashtags || [],
          thread: aiResponse.thread || [],
          original_text: originalTextToSave,
          original_url: originalUrl || '', // URL 또는 원본 텍스트
          category: aiResponse.labeling?.category || '미분류',
          keywords: aiResponse.labeling?.keywords || [],
          key_sentence: aiResponse.labeling?.key_sentence || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes: 0,
          retweets: 0,
          replies: 0,
          has_embedding: false, // 임베딩 상태 추적을 위한 필드 추가
        })
        .select();

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
        labeling: {
          category: newMemo.category,
          keywords: newMemo.keywords,
          key_sentence: newMemo.key_sentence,
        },
        time: '방금',
        likes: 0,
        retweets: 0,
        replies: 0,
      };

      // 새 메모 추가
      setMemos((prevMemos) => [formattedNewMemo, ...prevMemos]);

      // 비동기로 임베딩 생성 (UI 흐름에 영향 없이 백그라운드에서 처리)
      setTimeout(async () => {
        const embeddingResult = await createEmbedding(newMemo.id, {
          title: aiResponse.title,
          tweet_main: aiResponse.tweet_main,
          key_sentence: aiResponse.labeling?.key_sentence,
          thread: aiResponse.thread,
          keywords: aiResponse.labeling?.keywords,
        });

        // 임베딩 상태 업데이트 (선택적)
        if (embeddingResult) {
          await supabase
            .from('memos')
            .update({ has_embedding: true })
            .eq('id', newMemo.id)
            .eq('user_id', user_id);
        }
      }, 100);

      return formattedNewMemo;
    } catch (error: any) {
      console.error('Error creating memo:', error);
      setError(`메모를 생성하는 중 오류가 발생했습니다: ${error.message}`);
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
      const aiResponse = await analyzeWithAI(text);

      const originalTextToSave = text; // 항상 추출된 텍스트나 사용자가 입력한 텍스트 저장
      const originalUrl = options.isUrl ? options.sourceUrl : null; // URL이면 URL 저장, 아니면 null

      // 기존 메모 업데이트 (Supabase)
      const { data, error } = await supabase
        .from('memos')
        .update({
          title: aiResponse.title,
          tweet_main: aiResponse.tweet_main,
          hashtags: aiResponse.hashtags || [],
          thread: aiResponse.thread || [],
          original_text: originalTextToSave,
          original_url: originalUrl || '',
          category: aiResponse.labeling?.category || '미분류',
          keywords: aiResponse.labeling?.keywords || [],
          key_sentence: aiResponse.labeling?.key_sentence || '',
          updated_at: new Date().toISOString(),
          has_embedding: false, // 업데이트 시 임베딩도 갱신 필요하므로 false로 설정
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
                title: aiResponse.title,
                tweet_main: aiResponse.tweet_main,
                hashtags: aiResponse.hashtags || [],
                thread: aiResponse.thread || [],
                original_text: text,
                labeling: {
                  category: aiResponse.labeling?.category || '미분류',
                  keywords: aiResponse.labeling?.keywords || [],
                  key_sentence: aiResponse.labeling?.key_sentence || '',
                },
                time: formatTimeAgo(new Date()),
              }
            : memo
        )
      );

      // 비동기로 임베딩 업데이트 (UI 흐름에 영향 없이 백그라운드에서 처리)
      setTimeout(async () => {
        const embeddingResult = await createEmbedding(memoId, {
          title: aiResponse.title,
          tweet_main: aiResponse.tweet_main,
          key_sentence: aiResponse.labeling?.key_sentence,
          thread: aiResponse.thread,
          keywords: aiResponse.labeling?.keywords,
        });

        // 임베딩 상태 업데이트 (선택적)
        if (embeddingResult) {
          await supabase
            .from('memos')
            .update({ has_embedding: true })
            .eq('id', memoId)
            .eq('user_id', user_id);
        }
      }, 100);

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
      loadMemos();
    } else {
      setMemos([]);
    }
  }, [user_id]);

  return {
    memos,
    isLoading,
    error,
    loadMemos,
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
