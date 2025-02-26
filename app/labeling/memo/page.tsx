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
} from 'lucide-react';
// 잘못된 import 제거
// import { analyzeWithAI } from '@/app/api/labeling/route';

// 타입 정의
interface MemoLabeling {
  category: string;
  keywords: string[];
  key_sentence: string;
}

interface Memo {
  id?: string; // 고유 ID
  title: string;
  tweet_main: string;
  hashtags: string[];
  thread: string[];
  labeling: MemoLabeling;
  time: string;
  likes: number;
  retweets: number;
  replies: number;
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
}

const TwitterStyleMemo: React.FC = () => {
  // 로컬 스토리지에서 메모 불러오기
  const loadMemosFromStorage = (): Memo[] => {
    if (typeof window !== 'undefined') {
      const savedMemos = localStorage.getItem('brainlabel_memos');
      return savedMemos ? JSON.parse(savedMemos) : initialMemos;
    }
    return initialMemos;
  };

  // 예시 데이터 목록 (최신순)
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
    {
      id: '2',
      title: '수면의 질을 높이는 7가지 습관',
      tweet_main:
        '불면증으로 고생하시나요? 연구에 따르면 수면의 질을 높이는 7가지 습관: 1) 규칙적인 수면 스케줄 2) 빛 조절 3) 저녁 루틴 4) 카페인 제한 5) 운동 6) 침실 환경 최적화 7) 스트레스 관리 #불면증 #수면건강',
      hashtags: ['불면증', '수면건강'],
      thread: [
        '1. 매일 같은 시간에 자고 일어나는 규칙적인 수면 스케줄은, 신체의 생체 시계를 조절하는 데 도움이 됩니다.',
        '2. 아침에는 밝은 빛을 충분히 쐬고, 저녁에는 블루라이트를 차단하세요. 일출/일몰 시간과 유사하게 생활하는 것이 중요합니다.',
        '3. 취침 전 1시간은 이완을 위한 저녁 루틴을 만드세요. 명상, 따뜻한 목욕, 독서 등이 도움이 됩니다.',
        '4. 오후 2시 이후에는 카페인 섭취를 피하고, 알코올과 니코틴도 수면의 질을 저하시키니 주의하세요.',
        '5. 규칙적인 운동은 숙면에 도움이 되지만, 취침 3시간 이내의 고강도 운동은 피하는 것이 좋습니다.',
        '6. 침실은 어둡고, 시원하고, 조용하게 유지하세요. 수면에 최적화된 환경을 만드는 것이 중요합니다.',
        '7. 스트레스 관리 기법(명상, 심호흡, 요가)을 배우고 실천하면 잠들기 전 마음을 안정시키는 데 도움이 됩니다.',
      ],
      labeling: {
        category: '건강/수면',
        keywords: ['수면', '불면증', '생체리듬', '수면위생', '명상'],
        key_sentence:
          '규칙적인 생활습관과 적절한 환경 조성을 통해 자연스러운 수면 패턴을 회복할 수 있습니다.',
      },
      time: '1시간',
      likes: 109,
      retweets: 45,
      replies: 18,
    },
    {
      id: '3',
      title: '노화를 늦추는 5가지 방법',
      tweet_main:
        '노화를 늦추고 싶다면? 1) 열량 제한 2) 간헐적 단식 3) 운동 4) 냉온 요법 5) NAD 보충제! 연구에 따르면, 이러한 방법들이 장수에 기여할 수 있습니다! #노화방지 #장수비결',
      hashtags: ['노화방지', '장수비결'],
      thread: [
        '1. 열량 제한은 장수에 도움을 줄 수 있습니다. 적게 먹으면 오히려 오래 살 수 있다는 연구 결과가 있습니다.',
        '2. 간헐적 단식을 통해 장수 유전자를 활성화할 수 있습니다. 16시간 공복을 유지해 보세요!',
        '3. HIIT와 같은 고강도 운동은 우리의 건강에 큰 도움이 되며 장수에도 긍정적인 영향을 미칩니다.',
        '4. 추위와 더위의 온도 자극은 장수 유전자를 자극할 수 있습니다. 주 3회 사우나나 찬물 샤워를 시도해 보세요.',
        '5. NAD 보충제를 통해 시르투인을 활성화하여 체내 NAD 농도를 증가시킬 수 있습니다.',
      ],
      labeling: {
        category: '의학/건강',
        keywords: ['장수', '노화', '운동', '식이요법', '건강'],
        key_sentence:
          '몸을 돌보는 다양한 방법을 통해 노화를 늦추고 건강한 삶을 유지할 수 있습니다.',
      },
      time: '3시간',
      likes: 142,
      retweets: 87,
      replies: 24,
    },
  ];

  // 프로필 정보
  const profile: Profile = {
    name: 'BrainLabel',
    username: '@brainlabel_ai',
    // 이미지 경로 수정
    avatar: 'https://placehold.co/40x40',
    verified: true,
  };

  // 상태 관리
  const [memos, setMemos] = useState<Memo[]>(initialMemos);
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

  // 각 메모에 대한 상태를 객체로 관리
  const [memoStates, setMemoStates] = useState<Record<string, MemoState>>({});

  // 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const loadedMemos = loadMemosFromStorage();
    setMemos(loadedMemos);

    // memoStates 초기화
    const initialStates: Record<string, MemoState> = {};
    loadedMemos.forEach((memo) => {
      if (memo.id) {
        initialStates[memo.id] = { expanded: false, showLabeling: true };
      }
    });
    setMemoStates(initialStates);
  }, []);

  // 메모가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && memos.length > 0) {
      localStorage.setItem('brainlabel_memos', JSON.stringify(memos));
    }
  }, [memos]);

  // 알림 타이머 설정
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 메모의 스레드 토글 함수
  const toggleThread = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], expanded: !prev[id].expanded },
    }));
  };

  // 메모의 AI 라벨링 토글 함수
  const toggleLabeling = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], showLabeling: !prev[id].showLabeling },
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
  };

  // 소요 시간 계산
  const getTimeAgo = () => {
    return '방금';
  };

  // 고유 ID 생성
  const generateId = () => {
    return Date.now().toString();
  };

  // API 호출하여 트윗 분석하기
  // API 호출하여 트윗 분석하기
  const analyzeWithAI = async (text: string) => {
    try {
      console.log('API 요청 전송:', text);

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

  // 메모 제출 처리
  // 메모 제출 처리
  const handleSubmit = async () => {
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // AI 분석 요청
      const aiResponse = await analyzeWithAI(inputText);

      // API 응답 확인 (디버깅용)
      console.log('API 응답:', aiResponse);

      // API가 오류 응답을 반환한 경우
      if (aiResponse.error) {
        throw new Error(aiResponse.error);
      }

      // 응답 형식 확인 - 필수 필드가 있는지 검사
      if (!aiResponse.title || !aiResponse.tweet_main || !aiResponse.thread) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }

      if (editingMemoId) {
        // 기존 메모 업데이트
        setMemos((prevMemos) =>
          prevMemos.map((memo) =>
            memo.id === editingMemoId
              ? {
                  ...memo,
                  title: aiResponse.title,
                  tweet_main: aiResponse.tweet_main,
                  hashtags: aiResponse.hashtags || [],
                  thread: aiResponse.thread || [],
                  labeling: aiResponse.labeling || {
                    category: '미분류',
                    keywords: [],
                    key_sentence: '',
                  },
                  time: getTimeAgo(),
                }
              : memo
          )
        );
        setNotification({
          message: '메모가 성공적으로 업데이트되었습니다.',
          type: 'success',
        });
      } else {
        // 새 메모 생성
        const newId = generateId();
        const newMemo: Memo = {
          id: newId,
          title: aiResponse.title,
          tweet_main: aiResponse.tweet_main,
          hashtags: aiResponse.hashtags || [],
          thread: aiResponse.thread || [],
          labeling: aiResponse.labeling || {
            category: '미분류',
            keywords: [],
            key_sentence: '',
          },
          time: getTimeAgo(),
          likes: 0,
          retweets: 0,
          replies: 0,
        };

        // 새 메모 추가
        setMemos((prevMemos) => [newMemo, ...prevMemos]);

        // 메모 상태 업데이트
        setMemoStates((prev) => ({
          ...prev,
          [newId]: { expanded: false, showLabeling: true },
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
  const handleDeleteMemo = (id: string) => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
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
    }
  };

  // 메모 수정 처리
  const handleEditMemo = (memo: Memo) => {
    if (memo.id) {
      setEditingMemoId(memo.id);
      setInputText(memo.thread.join('\n\n'));
      setCharacterCount(memo.thread.join('\n\n').length);
      setShowComposer(true);
    }
  };

  // 좋아요 처리
  const handleLike = (id: string) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) => (memo.id === id ? { ...memo, likes: memo.likes + 1 } : memo))
    );
  };

  // 리트윗 처리
  const handleRetweet = (id: string) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) => (memo.id === id ? { ...memo, retweets: memo.retweets + 1 } : memo))
    );
  };

  // 댓글 처리
  const handleReply = (id: string) => {
    setMemos((prevMemos) =>
      prevMemos.map((memo) => (memo.id === id ? { ...memo, replies: memo.replies + 1 } : memo))
    );
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 또는 Cmd+Enter로 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white overflow-hidden shadow-md min-h-screen">
      {/* 트위터 헤더 */}
      <div className="bg-indigo-500 p-2 flex justify-between items-center sticky top-0 z-20">
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
            onClick={() => setShowComposer(true)}
            className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}

      {/* 트윗 작성 영역 (모달) */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-3 border-b flex justify-between items-center">
              <button onClick={resetForm} className="text-indigo-500">
                <X size={20} />
              </button>
              <span className="font-semibold">{editingMemoId ? '메모 수정' : '새 메모 작성'}</span>
              <div className="w-5"></div>
            </div>

            <div className="p-4">
              <div className="flex">
                <div className="mr-3">
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
                    placeholder={
                      editingMemoId ? '메모를 수정하세요...' : '무슨 생각을 하고 계신가요?'
                    }
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    maxLength={1000}
                  ></textarea>

                  {error && (
                    <div className="mt-2 flex items-center text-red-500 text-sm">
                      <AlertCircle size={16} className="mr-1" />
                      {error}
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 text-indigo-500">
                        <button className="p-1">
                          <Image size={18} />
                        </button>
                        <button className="p-1">
                          <Video size={18} />
                        </button>
                        <button className="p-1">
                          <BarChart2 size={18} />
                        </button>
                        <button className="p-1">
                          <MapPin size={18} />
                        </button>
                      </div>

                      <div className="flex items-center">
                        <div
                          className={`text-xs mr-2 ${
                            characterCount > 280 ? 'text-red-500' : 'text-gray-500'
                          }`}
                        >
                          {characterCount}/1000
                        </div>
                        <button
                          className={`rounded-full px-4 py-1 text-white font-bold ${
                            !inputText.trim() || isSubmitting || characterCount > 1000
                              ? 'bg-indigo-300 cursor-not-allowed'
                              : 'bg-indigo-500 hover:bg-indigo-600'
                          }`}
                          onClick={handleSubmit}
                          disabled={!inputText.trim() || isSubmitting || characterCount > 1000}
                        >
                          {isSubmitting ? (
                            <Loader size={16} className="animate-spin" />
                          ) : editingMemoId ? (
                            '수정'
                          ) : (
                            '트윗'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                <div className="mr-3">
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
                      {profile.verified && (
                        <CheckCircle size={16} className="ml-1 text-indigo-500" />
                      )}
                      <span className="text-gray-500 ml-1 text-sm">
                        {profile.username} · {memo.time}
                      </span>
                    </div>

                    {/* 메모 관리 버튼 */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => memo.id && handleEditMemo(memo)}
                        className="text-gray-400 hover:text-indigo-500"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => memo.id && handleDeleteMemo(memo.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h2 className="font-bold text-lg mt-1">{memo.title}</h2>
                  <p className="mt-2 text-gray-700">{memo.tweet_main}</p>

                  {/* 버튼 영역 - 항상 같은 위치에 고정 */}
                  <div className="mt-3 flex space-x-4">
                    <button
                      onClick={() => memo.id && toggleThread(memo.id)}
                      className="text-indigo-500 text-sm font-medium"
                    >
                      {memo.id && memoStates[memo.id]?.expanded
                        ? '스레드 접기'
                        : '스레드 더보기...'}
                    </button>

                    <button
                      onClick={() => memo.id && toggleLabeling(memo.id)}
                      className="text-indigo-500 text-sm font-medium"
                    >
                      {memo.id && memoStates[memo.id]?.showLabeling
                        ? 'AI 라벨링 접기'
                        : 'AI 라벨링 보기...'}
                    </button>
                  </div>

                  {/* 스레드 표시 (토글 가능) */}
                  {memo.id && memoStates[memo.id]?.expanded && (
                    <div className="mt-4 border-l-2 border-gray-300 pl-3 space-y-3">
                      {memo.thread.map((tweet, tweetIndex) => (
                        <p key={tweetIndex} className="text-gray-700">
                          {tweet}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* AI 라벨링 표시 (토글 가능) */}
                  {memo.id && memoStates[memo.id]?.showLabeling && (
                    <div className="mt-4 border-l-2 border-gray-300 pl-3 space-y-3">
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <h3 className="text-sm font-medium text-indigo-700 mb-2">AI 라벨링</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-indigo-600">카테고리:</span>
                            <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                              {memo.labeling.category}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-indigo-600">키워드:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {memo.labeling.keywords.map((keyword, keywordIndex) => (
                                <span
                                  key={keywordIndex}
                                  className="text-xs bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-indigo-600">핵심 문장:</span>
                            <p className="text-sm text-indigo-800 mt-1 italic bg-indigo-100 p-2 rounded">
                              "{memo.labeling.key_sentence}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 트윗 액션 버튼 */}
                  <div className="flex justify-between mt-4 text-gray-500">
                    <button
                      className="flex items-center"
                      onClick={() => memo.id && handleReply(memo.id)}
                    >
                      <MessageCircle size={16} className="mr-1" />
                      <span className="text-xs">{memo.replies}</span>
                    </button>
                    <button
                      className="flex items-center"
                      onClick={() => memo.id && handleRetweet(memo.id)}
                    >
                      <Repeat size={16} className="mr-1" />
                      <span className="text-xs">{memo.retweets}</span>
                    </button>
                    <button
                      className="flex items-center"
                      onClick={() => memo.id && handleLike(memo.id)}
                    >
                      <Heart size={16} className="mr-1" />
                      <span className="text-xs">{memo.likes}</span>
                    </button>
                    <button className="flex items-center">
                      <Share size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 바텀 네비게이션 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around py-3 border-t border-gray-200 bg-white z-20">
        <button className="text-indigo-500">
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
