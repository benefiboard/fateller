'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Search,
  Bell,
  Mail,
  MessageCircle,
  Repeat,
  Heart,
  Share,
  Twitter,
  CheckCircle,
  Image,
  Video,
  BarChart2,
  Calendar,
  MapPin,
  X,
  Loader,
  Trash2,
  Edit,
  AlertCircle,
  RefreshCw, // 재분석 아이콘 추가
} from 'lucide-react';
import { useUserStore } from '@/app/store/userStore';
import createSupabaseBrowserClient from '@/lib/supabse/client';

// 타입 정의
interface MemoLabeling {
  category: string;
  keywords: string[];
  key_sentence: string;
}

interface Profile {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
}

interface MemoState {
  expanded: boolean;
  showLabeling: boolean;
  showOriginal: boolean; // 원문 표시 여부를 위한 새 상태
}

// Memo 인터페이스에 original_text 필드 추가
interface Memo {
  id?: string;
  title: string;
  tweet_main: string;
  hashtags: string[];
  thread: string[];
  labeling: MemoLabeling;
  time: string;
  likes: number;
  retweets: number;
  replies: number;
  original_text?: string; // 사용자가 입력한 원문 텍스트
}

const TwitterStyleMemo: React.FC = () => {
  const currentUser = useUserStore((state) => state.currentUser);
  const supabase = createSupabaseBrowserClient();

  const user_id = currentUser?.id || '';

  // 예시 데이터 목록 (최신순) - Supabase 연동 시 초기 데이터로 사용될 수 있음
  const initialMemos: Memo[] = [
    {
      id: '1',
      title: '효과적인 학습을 위한 5가지 과학적 방법',
      tweet_main:
        '공부 효율을 높이고 싶다면? 과학이 입증한 학습법 5가지: 1)분산 학습 2)자기 테스트 3)인출 연습 4)듀얼 코딩 5)메타인지 활용. 암기식 반복 학습은 이제 그만! #학습법 #공부효율',
      hashtags: ['학습법', '공부효율'],
      thread: [
        '1. 분산 학습: 한 번에 몰아서 공부하는 것보다 여러 날에 걸쳐 동일한 시간을 분배하는 것이 장기 기억에 효과적입니다.',
        '2. 자기 테스트: 단순히 내용을 읽는 것보다 스스로 퀴즈를 풀며 학습하는 것이 기억 강화에 도움이 됩니다.',
        '3. 인출 연습: 배운 내용을 자신의 말로 설명하거나 적어보는 과정을 통해 기억이 강화됩니다.',
        '4. 듀얼 코딩: 언어와 시각적 정보를 함께 사용하면 (텍스트+이미지) 학습 효과가 증가합니다.',
        '5. 메타인지 활용: 자신의 학습 과정을 모니터링하고 조절하는 능력을 키우면 효율적인 학습이 가능합니다.',
      ],
      labeling: {
        category: '교육/학습',
        keywords: ['학습법', '기억력', '인지심리학', '공부전략', '교육'],
        key_sentence:
          '효과적인 학습은 단순 반복이 아닌 과학적으로 검증된 방법을 활용할 때 이루어집니다.',
      },
      time: '10분',
      likes: 78,
      retweets: 23,
      replies: 12,
    },
    // 추가 예시 데이터는 생략
  ];

  // 프로필 정보
  const profile: Profile = {
    name: 'BrainLabel',
    username: '@brainlabel_ai',
    avatar: 'https://placehold.co/40x40',
    verified: true,
  };

  // 상태 관리
  const [memos, setMemos] = useState<Memo[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [showComposer, setShowComposer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);

  // 추가: 수정 모드 상태 (직접 수정 또는 AI 분석)
  const [editMode, setEditMode] = useState<'direct' | 'analyze'>('direct');

  // 추가: 직접 수정 폼 데이터
  const [editFormData, setEditFormData] = useState<{
    title: string;
    tweet_main: string;
    thread: string[];
    category: string;
    keywords: string[];
    key_sentence: string;
  }>({
    title: '',
    tweet_main: '',
    thread: [''],
    category: '',
    keywords: [],
    key_sentence: '',
  });

  // 키워드 입력을 위한 별도의 상태 추가
  const [keywordsInput, setKeywordsInput] = useState<string>('');

  // 각 메모에 대한 상태를 객체로 관리
  const [memoStates, setMemoStates] = useState<Record<string, MemoState>>({});

  // Supabase에서 메모 불러오기
  const loadMemosFromSupabase = async () => {
    try {
      if (!user_id) {
        console.warn('로그인된 사용자가 없습니다.');
        return [];
      }

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

      // memoStates 초기화
      const initialStates: Record<string, MemoState> = {};
      formattedMemos.forEach((memo) => {
        if (memo.id) {
          initialStates[memo.id] = {
            expanded: false,
            showLabeling: true,
            showOriginal: false,
          };
        }
      });
      setMemoStates(initialStates);

      return formattedMemos;
    } catch (error) {
      console.error('메모 불러오기 중 오류가 발생했습니다:', error);
      return [];
    }
  };

  // 시간 포맷팅 함수
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // 초 단위 차이

    if (diff < 60) return '방금';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;

    // 1달 이상이면 날짜 표시
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  };

  // 컴포넌트 마운트 시 Supabase에서 데이터 로드
  useEffect(() => {
    if (user_id) {
      loadMemosFromSupabase();
    } else {
      setMemos([]);
      setMemoStates({});
    }
  }, [user_id]);

  // 알림 타이머 설정
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 메모의 주요내용 토글 함수
  const toggleThread = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], expanded: !prev[id].expanded },
    }));
  };

  // 메모의 요약 토글 함수
  const toggleLabeling = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], showLabeling: !prev[id].showLabeling },
    }));
  };

  // 원문 토글 함수
  const toggleOriginal = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], showOriginal: !prev[id].showOriginal },
    }));
  };

  // 입력 텍스트 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setCharacterCount(text.length);
  };

  // 폼 리셋
  const resetForm = () => {
    setInputText('');
    setCharacterCount(0);
    setShowComposer(false);
    setError(null);
    setEditingMemoId(null);
    setEditMode('direct');
    setEditFormData({
      title: '',
      tweet_main: '',
      thread: [''],
      category: '',
      keywords: [],
      key_sentence: '',
    });
    setKeywordsInput(''); // 추가된 부분
  };

  // 직접 수정 모달 열기 함수
  const handleOpenDirectEdit = (memo: Memo) => {
    if (!user_id) {
      setNotification({
        message: '로그인 후 이용해주세요.',
        type: 'error',
      });
      return;
    }

    if (memo.id) {
      setEditingMemoId(memo.id);
      setEditMode('direct');

      // 현재 메모 데이터로 폼 초기화
      setEditFormData({
        title: memo.title,
        tweet_main: memo.tweet_main,
        thread: [...memo.thread], // 배열 복사
        category: memo.labeling.category,
        keywords: [...memo.labeling.keywords], // 배열 복사
        key_sentence: memo.labeling.key_sentence,
      });

      // 키워드 입력 상태 초기화
      setKeywordsInput(memo.labeling.keywords.join(', '));

      setShowComposer(true);
    }
  };

  // AI 재분석 모달 열기 함수
  const handleOpenAnalyzeEdit = (memo: Memo) => {
    if (!user_id) {
      setNotification({
        message: '로그인 후 이용해주세요.',
        type: 'error',
      });
      return;
    }

    if (memo.id) {
      setEditingMemoId(memo.id);
      setEditMode('analyze');
      setInputText(memo.original_text || memo.thread.join('\n\n'));
      setCharacterCount((memo.original_text || memo.thread.join('\n\n')).length);
      setShowComposer(true);
    }
  };

  // 폼 필드 변경 처리 함수
  const handleEditFormChange = (field: string, value: string | string[]) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 스레드 항목 변경 처리 함수
  const handleThreadItemChange = (index: number, value: string) => {
    const updatedThread = [...editFormData.thread];
    updatedThread[index] = value;
    setEditFormData((prev) => ({
      ...prev,
      thread: updatedThread,
    }));
  };

  // 스레드 항목 추가 함수
  const handleAddThreadItem = () => {
    setEditFormData((prev) => ({
      ...prev,
      thread: [...prev.thread, ''],
    }));
  };

  // 스레드 항목 삭제 함수
  const handleRemoveThreadItem = (index: number) => {
    if (editFormData.thread.length <= 1) return; // 최소한 하나는 유지

    const updatedThread = [...editFormData.thread];
    updatedThread.splice(index, 1);
    setEditFormData((prev) => ({
      ...prev,
      thread: updatedThread,
    }));
  };

  // 키워드 입력 처리 함수 (수정됨)
  const handleKeywordsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 사용자 입력을 그대로 상태에 저장
    setKeywordsInput(e.target.value);
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
      console.log('API 응답 수신:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || '분석 중 오류가 발생했습니다.');
      }

      return responseData;
    } catch (error: any) {
      console.error('API 요청 오류:', error);
      throw new Error(`분석 실패: ${error.message}`);
    }
  };

  // 직접 수정 저장 함수 (수정됨)
  const handleSaveDirectEdit = async () => {
    if (!editingMemoId || !user_id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 키워드 입력을 배열로 변환
      const keywordArray = keywordsInput
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean);

      // 수정된 데이터 객체 생성
      const updateData = {
        title: editFormData.title,
        tweet_main: editFormData.tweet_main,
        thread: editFormData.thread,
        category: editFormData.category,
        keywords: keywordArray, // 변환된 배열 사용
        key_sentence: editFormData.key_sentence,
        updated_at: new Date().toISOString(),
      };

      // Supabase에 업데이트
      const { error } = await supabase
        .from('memos')
        .update(updateData)
        .eq('id', editingMemoId)
        .eq('user_id', user_id);

      if (error) {
        throw new Error(`메모 업데이트 오류: ${error.message}`);
      }

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) =>
          memo.id === editingMemoId
            ? {
                ...memo,
                title: editFormData.title,
                tweet_main: editFormData.tweet_main,
                thread: editFormData.thread,
                labeling: {
                  category: editFormData.category,
                  keywords: keywordArray, // 변환된 배열 사용
                  key_sentence: editFormData.key_sentence,
                },
                time: formatTimeAgo(new Date()),
              }
            : memo
        )
      );

      setNotification({
        message: '메모가 성공적으로 업데이트되었습니다.',
        type: 'success',
      });

      // 폼 초기화
      resetForm();
    } catch (error: any) {
      console.error('Error updating memo:', error);
      setError(`메모를 업데이트하는 중 오류가 발생했습니다: ${error.message}`);
      setNotification({
        message: '메모 업데이트 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 메모 제출 처리 (AI 분석 모드)
  const handleSubmit = async () => {
    // 직접 수정 모드인 경우
    if (editMode === 'direct' && editingMemoId) {
      return handleSaveDirectEdit();
    }

    // 기존 AI 분석 모드 (원래 로직)
    if (!inputText.trim() || isSubmitting) return;

    // 로그인 상태 확인
    if (!user_id) {
      setError('로그인이 필요합니다.');
      setNotification({
        message: '로그인 후 이용해주세요.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // AI 분석 요청
      const aiResponse = await analyzeWithAI(inputText);

      // API 응답 확인
      if (aiResponse.error) {
        throw new Error(aiResponse.error);
      }

      // 응답 형식 확인 - 필수 필드가 있는지 검사
      if (!aiResponse.title || !aiResponse.tweet_main || !aiResponse.thread) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }

      if (editingMemoId) {
        // 기존 메모 업데이트 (Supabase)
        const { data, error } = await supabase
          .from('memos')
          .update({
            title: aiResponse.title,
            tweet_main: aiResponse.tweet_main,
            hashtags: aiResponse.hashtags || [],
            thread: aiResponse.thread || [],
            original_text: inputText,
            category: aiResponse.labeling?.category || '미분류',
            keywords: aiResponse.labeling?.keywords || [],
            key_sentence: aiResponse.labeling?.key_sentence || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMemoId)
          .eq('user_id', user_id)
          .select();

        if (error) {
          throw new Error(`메모 업데이트 오류: ${error.message}`);
        }

        const updatedMemo = data?.[0];

        // 로컬 상태 업데이트
        setMemos((prevMemos) =>
          prevMemos.map((memo) =>
            memo.id === editingMemoId
              ? {
                  ...memo,
                  title: aiResponse.title,
                  tweet_main: aiResponse.tweet_main,
                  hashtags: aiResponse.hashtags || [],
                  thread: aiResponse.thread || [],
                  original_text: inputText,
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

        setNotification({
          message: '메모가 성공적으로 업데이트되었습니다.',
          type: 'success',
        });
      } else {
        // 새 메모 생성 (Supabase)
        const { data, error } = await supabase
          .from('memos')
          .insert({
            user_id: user_id,
            title: aiResponse.title,
            tweet_main: aiResponse.tweet_main,
            hashtags: aiResponse.hashtags || [],
            thread: aiResponse.thread || [],
            original_text: inputText,
            category: aiResponse.labeling?.category || '미분류',
            keywords: aiResponse.labeling?.keywords || [],
            key_sentence: aiResponse.labeling?.key_sentence || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            likes: 0,
            retweets: 0,
            replies: 0,
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

        // 메모 상태 업데이트
        setMemoStates((prev) => ({
          ...prev,
          [formattedNewMemo.id!]: { expanded: false, showLabeling: true, showOriginal: false },
        }));

        setNotification({
          message: '새 메모가 성공적으로 생성되었습니다.',
          type: 'success',
        });
      }

      // 폼 초기화
      resetForm();
    } catch (error: any) {
      console.error('Error processing memo:', error);
      setError(`메모를 처리하는 중 오류가 발생했습니다: ${error.message}`);
      setNotification({
        message: '메모 처리 중 오류가 발생했습니다.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 메모 삭제 처리
  const handleDeleteMemo = async (id: string) => {
    if (!user_id) {
      setNotification({
        message: '로그인 후 이용해주세요.',
        type: 'error',
      });
      return;
    }

    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase.from('memos').delete().eq('id', id).eq('user_id', user_id);

        if (error) {
          throw new Error(`메모 삭제 오류: ${error.message}`);
        }

        // 로컬 상태에서 메모 제거
        setMemos((prevMemos) => prevMemos.filter((memo) => memo.id !== id));

        // memoStates에서도 해당 메모 상태 제거
        setMemoStates((prev) => {
          const newStates = { ...prev };
          delete newStates[id];
          return newStates;
        });

        setNotification({
          message: '메모가 삭제되었습니다.',
          type: 'success',
        });
      } catch (error: any) {
        console.error('메모 삭제 중 오류:', error);
        setNotification({
          message: `메모 삭제 중 오류가 발생했습니다: ${error.message}`,
          type: 'error',
        });
      }
    }
  };

  // 좋아요 처리
  const handleLike = async (id: string) => {
    if (!user_id) return;

    try {
      // 먼저 현재 좋아요 수 가져오기
      const { data, error: fetchError } = await supabase
        .from('memos')
        .select('likes')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentLikes = data.likes || 0;
      const newLikes = currentLikes + 1;

      // 좋아요 수 업데이트
      const { error: updateError } = await supabase
        .from('memos')
        .update({ likes: newLikes })
        .eq('id', id);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) => (memo.id === id ? { ...memo, likes: newLikes } : memo))
      );
    } catch (error) {
      console.error('좋아요 업데이트 오류:', error);
    }
  };

  // 리트윗 처리
  const handleRetweet = async (id: string) => {
    if (!user_id) return;

    try {
      // 먼저 현재 리트윗 수 가져오기
      const { data, error: fetchError } = await supabase
        .from('memos')
        .select('retweets')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentRetweets = data.retweets || 0;
      const newRetweets = currentRetweets + 1;

      // 리트윗 수 업데이트
      const { error: updateError } = await supabase
        .from('memos')
        .update({ retweets: newRetweets })
        .eq('id', id);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) => (memo.id === id ? { ...memo, retweets: newRetweets } : memo))
      );
    } catch (error) {
      console.error('리트윗 업데이트 오류:', error);
    }
  };

  // 댓글 처리
  const handleReply = async (id: string) => {
    if (!user_id) return;

    try {
      // 먼저 현재 댓글 수 가져오기
      const { data, error: fetchError } = await supabase
        .from('memos')
        .select('replies')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentReplies = data.replies || 0;
      const newReplies = currentReplies + 1;

      // 댓글 수 업데이트
      const { error: updateError } = await supabase
        .from('memos')
        .update({ replies: newReplies })
        .eq('id', id);

      if (updateError) throw updateError;

      // 로컬 상태 업데이트
      setMemos((prevMemos) =>
        prevMemos.map((memo) => (memo.id === id ? { ...memo, replies: newReplies } : memo))
      );
    } catch (error) {
      console.error('댓글 업데이트 오류:', error);
    }
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 또는 Cmd+Enter로 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white overflow-hidden shadow-md min-h-screen tracking-tighter leading-snug">
      {/* 트위터 헤더 */}
      <div className="bg-teal-500 p-2 flex justify-between items-center sticky top-0 z-20">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <Twitter size={20} color="#1DA1F2" />
        </div>
        <div className="text-white font-semibold">BrainLabeling</div>
        <div className="w-8 h-8"></div>
      </div>

      {/* 알림 메시지 */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      {/* 트윗 작성 버튼 (모바일 UI) */}
      {!showComposer && (
        <div className="fixed bottom-20 right-4 z-10">
          <button
            onClick={() => {
              setShowComposer(true);
              setEditMode('analyze'); // 새 메모 작성은 항상 AI 분석 모드
              setEditingMemoId(null);
            }}
            className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}

      {/* 트윗 작성/수정 모달 - 조건부 렌더링으로 모드에 따라 다른 UI 표시 */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-3 border-b flex justify-between items-center">
              <button onClick={resetForm} className="text-teal-500">
                <X size={20} />
              </button>
              <span className="font-semibold">
                {editingMemoId
                  ? editMode === 'direct'
                    ? '메모 직접 수정'
                    : '메모 재분석'
                  : '새 메모 작성'}
              </span>
              <div className="w-5"></div>
            </div>

            <div className="p-4">
              {/* AI 분석 모드 UI */}
              {editMode === 'analyze' && (
                <div className="flex">
                  <div className="mr-[6px]">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <textarea
                      className="w-full border-0 focus:ring-0 focus:outline-none resize-none p-2 min-h-24"
                      placeholder="분석할 내용을 입력하세요..."
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      maxLength={10000}
                    ></textarea>

                    {error && (
                      <div className="mt-2 flex items-center text-red-500 text-sm">
                        <AlertCircle size={16} className="mr-1" />
                        {error}
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2 text-teal-500">
                          <button className="p-1">
                            <Image size={18} />
                          </button>
                          <button className="p-1">
                            <Video size={18} />
                          </button>
                        </div>

                        <div className="flex items-center">
                          <div
                            className={`text-sm mr-2 ${
                              characterCount > 10000 ? 'text-red-500' : 'text-gray-500'
                            }`}
                          >
                            {characterCount}/10000
                          </div>
                          <button
                            className={`rounded-full px-4 py-1 text-white font-bold ${
                              !inputText.trim() || isSubmitting || characterCount > 10000
                                ? 'bg-teal-300 cursor-not-allowed'
                                : 'bg-teal-500 hover:bg-teal-600'
                            }`}
                            onClick={handleSubmit}
                            disabled={!inputText.trim() || isSubmitting || characterCount > 10000}
                          >
                            {isSubmitting ? (
                              <Loader size={16} className="animate-spin" />
                            ) : editingMemoId ? (
                              '재분석 및 저장'
                            ) : (
                              '작성'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 직접 수정 모드 UI */}
              {editMode === 'direct' && (
                <div className="space-y-4">
                  {/* 제목 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editFormData.title}
                      onChange={(e) => handleEditFormChange('title', e.target.value)}
                    />
                  </div>

                  {/* 트윗 내용 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      트윗 내용
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md min-h-12"
                      value={editFormData.tweet_main}
                      onChange={(e) => handleEditFormChange('tweet_main', e.target.value)}
                    ></textarea>
                  </div>

                  {/* 스레드 수정 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">스레드</label>
                      <button
                        type="button"
                        className="text-xs bg-teal-500 text-white px-2 py-1 rounded-md"
                        onClick={handleAddThreadItem}
                      >
                        + 항목 추가
                      </button>
                    </div>

                    {editFormData.thread.map((item, index) => (
                      <div key={index} className="flex mb-2">
                        <textarea
                          className="flex-1 p-2 border border-gray-300 rounded-md min-h-12"
                          value={item}
                          onChange={(e) => handleThreadItemChange(index, e.target.value)}
                        ></textarea>

                        <button
                          type="button"
                          className="ml-2 text-red-500"
                          onClick={() => handleRemoveThreadItem(index)}
                          disabled={editFormData.thread.length <= 1}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 카테고리 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={editFormData.category}
                      onChange={(e) => handleEditFormChange('category', e.target.value)}
                    >
                      <option value="">카테고리 선택</option>
                      <option value="인문/철학">인문/철학</option>
                      <option value="경영/경제">경영/경제</option>
                      <option value="사회과학">사회과학</option>
                      <option value="자연과학">자연과학</option>
                      <option value="기술/공학">기술/공학</option>
                      <option value="의학/건강">의학/건강</option>
                      <option value="예술/문화">예술/문화</option>
                      <option value="문학/창작">문학/창작</option>
                      <option value="자기계발">자기계발</option>
                      <option value="할 일/액션">할 일/액션</option>
                      <option value="일기/성찰">일기/성찰</option>
                    </select>
                  </div>

                  {/* 키워드 수정 (수정됨) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      키워드 (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={keywordsInput}
                      onChange={handleKeywordsInputChange}
                      placeholder="키워드1, 키워드2, 키워드3"
                    />
                  </div>

                  {/* 핵심 문장 수정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      핵심 문장
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md min-h-12"
                      value={editFormData.key_sentence}
                      onChange={(e) => handleEditFormChange('key_sentence', e.target.value)}
                    ></textarea>
                  </div>

                  {error && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertCircle size={16} className="mr-1" />
                      {error}
                    </div>
                  )}

                  {/* 저장 버튼 */}
                  <div className="flex justify-end pt-2">
                    <button
                      className={`rounded-full px-4 py-1 text-white font-bold ${
                        isSubmitting
                          ? 'bg-teal-300 cursor-not-allowed'
                          : 'bg-teal-500 hover:bg-teal-600'
                      }`}
                      onClick={handleSaveDirectEdit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader size={16} className="animate-spin" /> : '저장'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 트윗 타임라인 */}
      <div className="divide-y divide-gray-200">
        {memos.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
            <p>아직 메모가 없습니다. 첫 번째 메모를 작성해보세요!</p>
          </div>
        ) : (
          memos.map((memo) => (
            <div key={memo.id} className="p-4">
              <div className="flex">
                <div className="mr-[6px]">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900">{profile.name}</span>
                      <span className="text-teal-500 ml-1 text-sm font-semibold">
                        @{memo.labeling.category}
                      </span>
                      <span className="text-gray-500 ml-1 text-sm">· {memo.time}</span>
                    </div>

                    {/* 메모 관리 버튼 */}
                    <div className="flex space-x-2">
                      {/* 일반 수정 버튼 */}
                      <button
                        onClick={() => memo.id && handleOpenDirectEdit(memo)}
                        className="text-gray-400 hover:text-teal-500 flex items-center text-xs"
                        title="직접 수정"
                      >
                        <Edit size={16} className="mr-1" />
                        <span>수정</span>
                      </button>

                      {/* AI 재분석 버튼 */}
                      <button
                        onClick={() => memo.id && handleOpenAnalyzeEdit(memo)}
                        className="text-gray-400 hover:text-blue-500 flex items-center text-xs"
                        title="AI 재분석"
                      >
                        <RefreshCw size={16} className="mr-1" />
                        <span>재분석</span>
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => memo.id && handleDeleteMemo(memo.id)}
                        className="text-gray-400 hover:text-red-500 flex items-center text-xs"
                        title="삭제"
                      >
                        <Trash2 size={16} className="mr-1" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                  <h2 className="font-bold text-lg mt-1">{memo.title}</h2>
                  <p className="mt-2 text-gray-700">{memo.tweet_main}</p>
                  <hr className="border-1 border-gray-200 my-2" />
                  {/* 버튼 영역 - 항상 같은 위치에 고정 */}
                  <div className=" flex space-x-4">
                    <button
                      onClick={() => memo.id && toggleLabeling(memo.id)}
                      className="text-gray-400 text-sm font-medium"
                    >
                      요약
                    </button>

                    <p className="text-gray-400">|</p>

                    <button
                      onClick={() => memo.id && toggleThread(memo.id)}
                      className="text-gray-400 text-sm font-medium"
                    >
                      주요 내용
                    </button>

                    <p className="text-gray-400">|</p>

                    <button
                      onClick={() => memo.id && toggleOriginal(memo.id)}
                      className="text-gray-400 text-sm font-medium"
                    >
                      원문
                    </button>
                  </div>
                  <hr className="border-1 border-gray-200 mt-2" />
                  {/* 요약 표시 (토글 가능) */}
                  {memo.id && memoStates[memo.id]?.showLabeling && (
                    <>
                      <div className="mt-2 border-l-2 border-gray-300 pl-3 space-y-3">
                        <div className="rounded-lg">
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => memo.id && toggleLabeling(memo.id)}
                          >
                            <span className="text-teal-500 mr-2">
                              {memo.id && memoStates[memo.id]?.showLabeling ? '▼' : '▲'}
                            </span>
                            <h3 className="text-sm font-medium text-teal-700">요약</h3>
                          </div>
                          <div className="space-y-2 mt-2">
                            <div>
                              <span className="text-sm font-medium text-teal-600">카테고리:</span>
                              <span className="ml-2 text-sm bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                                {memo.labeling.category}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-teal-600">키워드:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {memo.labeling.keywords.map((keyword, keywordIndex) => (
                                  <span
                                    key={keywordIndex}
                                    className="text-sm bg-teal-200 text-teal-700 px-2 py-0.5 rounded"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-teal-600">핵심 문장:</span>
                              <p className="text-sm text-teal-800 mt-1 italic bg-teal-100 p-2 rounded">
                                "{memo.labeling.key_sentence}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr className="border-1 border-gray-200 mt-4 mb-2" />
                    </>
                  )}

                  {memo.id && memoStates[memo.id]?.expanded && (
                    <>
                      <div className="mt-2 border-l-2 border-gray-300 pl-3 space-y-3">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => memo.id && toggleThread(memo.id)}
                        >
                          <span className="text-teal-500 mr-2">
                            {memo.id && memoStates[memo.id]?.expanded ? '▼' : '▲'}
                          </span>
                          <h3 className="text-sm font-medium text-teal-700">주요내용</h3>
                        </div>
                        <div className="mt-2">
                          {memo.thread.map((tweet, tweetIndex) => (
                            <p key={tweetIndex} className="text-gray-700 text-sm mb-2">
                              {tweet}
                            </p>
                          ))}
                        </div>
                      </div>
                      <hr className="border-1 border-gray-200 mt-4 mb-2" />
                    </>
                  )}

                  {memo.id && memoStates[memo.id]?.showOriginal && (
                    <>
                      <div className="mt-2 border-l-2 border-gray-300 pl-3 space-y-3">
                        <div className="rounded-lg">
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => memo.id && toggleOriginal(memo.id)}
                          >
                            <span className="text-teal-500 mr-2">
                              {memo.id && memoStates[memo.id]?.showOriginal ? '▼' : '▲'}
                            </span>
                            <h3 className="text-sm font-medium text-teal-700">원문</h3>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
                            {memo.original_text || '원문이 없습니다.'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 바텀 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around py-3 border-t border-gray-200 bg-white z-20">
        <button className="text-teal-500">
          <Home size={24} />
        </button>
        <button className="text-gray-500">
          <Search size={24} />
        </button>
        <button className="text-gray-500">
          <Bell size={24} />
        </button>
        <button className="text-gray-500">
          <Mail size={24} />
        </button>
      </div>
    </div>
  );
};

export default TwitterStyleMemo;
