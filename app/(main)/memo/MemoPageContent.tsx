//app/(main)/memo/MemoPageContent.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  X,
  Search,
  MessageCirclePlus,
  ChevronsUp,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// UI 컴포넌트 임포트 - 필수 컴포넌트만 직접 임포트
import Header from '../../ui/Header';
import MemoItem from '../../ui/MemoItem';
import Notification from '../../ui/Notification';
import BottomNavigation from '../../ui/BottomNavigation';
import SearchAndFilterBar from '../../ui/SearchAndFilterBar';

// 지연 로딩할 컴포넌트들
const ComposerModal = dynamic(() => import('../../ui/ComposerModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-center mt-2">로딩 중...</p>
      </div>
    </div>
  ),
});

const PendingMemosList = dynamic(() => import('../../ui/PendingMemosList'), {
  ssr: false,
  loading: () => <div className="w-full h-8 animate-pulse bg-gray-100 rounded"></div>,
});

const AlertModal = dynamic(() => import('../../ui/AlertModal'), {
  ssr: false,
});

// 훅 임포트
import useMemos from '../../hooks/useMemos';
import useMemosState from '../../hooks/useMemosState';
import useNotification from '../../hooks/useNotification';
import usePendingMemos, { PendingMemoStatus } from '../../hooks/usePendingMemos';
import useBackgroundProcess from '../../hooks/useBackgroundProcess';
import { useUserStore } from '../../store/userStore';
import { useSearchStore } from '../../store/searchStore';
import { useCreditStore } from '@/app/store/creditStore';

// 상단 알림 인터페이스
interface TopAlert {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

// 초기 렌더링에 필요한 메모 수
const INITIAL_MEMO_COUNT = 5;

const MemoPageContent: React.FC = () => {
  // --- 상태 관리 최적화 ---
  // 필수 상태만 먼저, 그 외는 지연 초기화

  // 컴포저 모달 관련 상태 (사용자 상호작용 발생 시에만 필요)
  const [showComposer, setShowComposer] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'direct' | 'analyze'>('direct');

  // 검색 및 필터링 관련 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'today'>('latest');
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

  // 화면에 표시할 메모 수 제한 (성능 최적화)
  const [displayCount, setDisplayCount] = useState(INITIAL_MEMO_COUNT);

  // 상단 알림 상태
  const [topAlert, setTopAlert] = useState<TopAlert>({
    show: false,
    message: '',
    type: 'info',
  });

  // 알림 표시 여부 상태
  const [showNotificationState, setShowNotificationState] = useState(false);

  // 유저 정보 - 메모이제이션으로 불필요한 계산 방지
  const currentUser = useUserStore((state) => state.currentUser);

  // profile 객체 동적 생성 - 메모이제이션 적용
  const profile = useMemo(
    () => ({
      name: currentUser?.email ? currentUser.email.split('@')[0] : 'BrainLabel',
      username: currentUser?.username
        ? `@${currentUser.username}`
        : currentUser?.email
        ? `@${currentUser.email.split('@')[0]}`
        : '@brainlabel_ai',
      avatar: currentUser?.avatar_url || '/avatar_base.svg',
    }),
    [currentUser]
  );

  // 에러 관련 상태 - 필요시에만 사용
  const [showGlobalAlert, setShowGlobalAlert] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', url: '' });

  // 메모 관련 훅 - 검색 옵션만 전달
  const {
    memos,
    isLoading,
    error: memosError,
    createMemo,
    updateMemoWithAI,
    updateMemoDirect,
    deleteMemo,
    likeMemo,
    retweetMemo,
    replyToMemo,
    loadMoreMemos,
    hasMore,
  } = useMemos({
    searchTerm,
    category: selectedCategory,
    purpose: selectedPurpose,
    sortOption,
    // initialPageSize 속성 제거
  });

  // 화면에 표시할 메모 필터링 - 메모이제이션 적용
  const visibleMemos = useMemo(() => {
    return memos.slice(0, displayCount);
  }, [memos, displayCount]);

  // 대기 중인 메모 관리 훅
  const {
    pendingMemos,
    addPendingMemo,
    updatePendingMemo,
    removePendingMemo,
    removeAllPendingMemos,
  } = usePendingMemos();

  // 백그라운드 처리 훅
  const { processUrl, cancelTask, cancelAllTasks } = useBackgroundProcess();

  // 검색어 변경 핸들러
  const handleSearch = useCallback((term: string) => {
    console.log('검색어 변경:', term);
    setSearchTerm(term);
    setDisplayCount(INITIAL_MEMO_COUNT); // 검색 시 표시 개수 초기화
  }, []);

  // 카테고리 선택 핸들러
  const handleCategorySelect = useCallback((category: string | null) => {
    console.log('카테고리 선택:', category);
    setSelectedCategory(category);
    setDisplayCount(INITIAL_MEMO_COUNT); // 필터 변경 시 표시 개수 초기화
  }, []);

  // 정렬 옵션 변경 핸들러
  const handleSortChange = useCallback((option: 'latest' | 'oldest' | 'today') => {
    console.log('정렬 옵션 변경:', option);
    setSortOption(option);
    setDisplayCount(INITIAL_MEMO_COUNT); // 정렬 변경 시 표시 개수 초기화
  }, []);

  // 상단 알림 표시 함수
  const showTopAlert = useCallback(
    (
      message: string,
      type: 'success' | 'info' | 'warning' | 'error' = 'info',
      duration: number = 2000
    ) => {
      console.log('상단 알림 표시:', message, type);

      // 이전 타이머 정리
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }

      // 알림 상태 업데이트
      setTopAlert({
        show: true,
        message,
        type,
      });

      // 일정 시간 후 알림 숨기기
      alertTimerRef.current = setTimeout(() => {
        setTopAlert((prev) => ({
          ...prev,
          show: false,
        }));
      }, duration);
    },
    []
  );

  // 알림 타이머 레퍼런스
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
    };
  }, []);

  // 백그라운드 처리 + 알림 함수
  const handleBackgroundProcessWithAlert = useCallback(
    async (data: any, alertMessage: string) => {
      console.log('백그라운드 처리 + 알림 함수 호출됨:', alertMessage);

      // 알림을 먼저 표시 (데이터 처리 전에)
      showTopAlert(alertMessage, 'success', 3000);

      // 백그라운드 처리 시작
      await handleBackgroundProcess({
        ...data,
        skipPendingCreation: true, // 중복 생성 방지 플래그
      });
    },
    [showTopAlert]
  );

  // 글로벌 오류 알림 표시 함수
  const showGlobalExtractionAlert = useCallback((message: string, url: string) => {
    setAlertData({
      title: '콘텐츠 추출 실패',
      message: message,
      url: url,
    });
    setShowGlobalAlert(true);
  }, []);

  // 알림 훅을 더 일찍 가져옵니다
  const { notification, showNotification } = useNotification();

  // 오류 처리 함수
  const handleProcessError = useCallback(
    (pendingId: string, error: any) => {
      let errorMessage = '알 수 없는 오류가 발생했습니다';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      updatePendingMemo(pendingId, {
        status: 'error',
        error: errorMessage,
      });
      showNotification(`오류가 발생했습니다: ${errorMessage}`, 'error');
    },
    [updatePendingMemo, showNotification]
  );

  // 백그라운드 처리 함수
  const handleBackgroundProcess = useCallback(
    async (data: any) => {
      console.log('백그라운드 처리 데이터:', data);

      try {
        // 추출 실패 플래그가 있는 경우 처리
        if (data.extractionFailed) {
          console.log('추출 실패 감지:', data.errorMessage);

          // 전역 알림 모달 표시
          setAlertData({
            title: '콘텐츠 추출 실패',
            message:
              data.errorMessage ||
              '콘텐츠를 추출할 수 없습니다. 직접 내용을 복사하여 붙여넣어 주세요.',
            url: data.originalUrl || data.text || '',
          });
          setShowGlobalAlert(true);

          // URL 추출 실패 알림 추가
          showNotification('콘텐츠 추출에 실패했습니다.', 'error');
          return;
        }

        // 중복 생성 방지 플래그 확인
        if (data.skipPendingCreation) {
          console.log('중복 생성 방지 플래그가 설정되어 있어 실제 API 호출은 하지 않습니다.');

          // 시뮬레이션된 처리 플로우 (실제 API 호출 없음)
          const pendingId = addPendingMemo(data.originalUrl || data.text || '');

          // extracting → processing → analyzing 상태 변환 시뮬레이션
          updatePendingMemo(pendingId, {
            status: 'extracting',
            extractedData: {
              title: '내용 추출 중...',
              content: data.originalUrl || data.text || '',
            },
          });

          setTimeout(() => {
            updatePendingMemo(pendingId, {
              status: 'processing',
              extractedData: {
                title: '데이터 정제 중...',
                content: data.originalUrl || data.text || '',
              },
            });

            setTimeout(() => {
              updatePendingMemo(pendingId, {
                status: 'analyzing',
                extractedData: {
                  title: 'AI 분석 중...',
                  content: data.originalUrl || data.text || '',
                },
              });

              setTimeout(() => {
                removePendingMemo(pendingId);
              }, 3000);
            }, 8000);
          }, 3000);

          return;
        }

        // URL 처리 (추출 단계)
        if (
          data.currentStep === 'extracting' &&
          data.originalUrl &&
          data.originalUrl.match(/^https?:\/\//i)
        ) {
          // 대기 메모 생성 (UI용)
          const pendingId = addPendingMemo(data.originalUrl);

          // 처리 시작
          processUrl(data.originalUrl, {
            taskId: pendingId,
            onStateChange: (id: string, status: string, stateData: any) => {
              // 상태 변경 시 UI 업데이트
              updatePendingMemo(id, {
                status: status as PendingMemoStatus,
                extractedData: stateData.extractData ||
                  stateData.extractedData || {
                    title: stateData.message || '처리 중...',
                    content: data.originalUrl,
                  },
              });
            },
            onComplete: async (id: string, extractData: any) => {
              // 완료 시 메모 생성 API 호출
              try {
                let responseData;
                if (data.id) {
                  responseData = await updateMemoWithAI(data.id, extractData.content, {
                    isUrl: true,
                    sourceUrl: extractData.sourceUrl || null,
                    originalTitle: extractData.title || '',
                    originalImage: extractData.imageUrl || '',
                    purpose: data.purpose || '일반',
                    sourceId: extractData.sourceId || null,
                  });
                } else {
                  responseData = await createMemo(extractData.content, {
                    isUrl: true,
                    sourceUrl: extractData.sourceUrl || null,
                    originalTitle: extractData.title || '',
                    originalImage: extractData.imageUrl || '',
                    purpose: data.purpose || '일반',
                    sourceId: extractData.sourceId || null,
                  });
                }

                // 크레딧 정보 처리 - 간소화
                if (
                  responseData &&
                  responseData.credits &&
                  responseData.credits.remaining !== undefined
                ) {
                  console.log('API 응답 크레딧 정보:', responseData.credits);
                  useCreditStore.getState().updateCredits(responseData.credits.remaining);
                }

                // UI 상태 업데이트
                updatePendingMemo(id, { status: 'completed' });
                showNotification('메모가 성공적으로 생성되었습니다.', 'success');
                setTimeout(() => removePendingMemo(id), 3000);
              } catch (error) {
                handleProcessError(id, error);
              }
            },
            onError: (id: string, errorMessage: string) => {
              updatePendingMemo(id, {
                status: 'error',
                error: errorMessage,
              });
              showNotification(`오류가 발생했습니다: ${errorMessage}`, 'error');

              // 오류 모달 표시
              setAlertData({
                title: '콘텐츠 추출 실패',
                message: errorMessage,
                url: data.originalUrl,
              });
              setShowGlobalAlert(true);
            },
          });
          return;
        }

        // 일반 메모 처리 (분석 단계)
        if (data.isOngoing || data.currentStep === 'analyzing' || !data.currentStep) {
          // 중복 생성 방지 플래그 확인
          if (data.skipPendingCreation) {
            console.log('중복 생성 방지 플래그가 설정되어 있어 pendingMemo를 생성하지 않습니다.');
            return;
          }

          // 대기 메모 생성
          const pendingId = addPendingMemo(data.text || data.content || '');

          // 분석 중 상태로 설정
          updatePendingMemo(pendingId, {
            status: 'analyzing',
            extractedData: {
              title: data.originalTitle || 'AI 분석 중...',
              imageUrl: data.originalImage || '',
              content: data.text || data.content || '',
              sourceUrl: data.sourceUrl || null,
            },
          });

          try {
            // OpenAI API 호출 및 메모 저장
            let responseData;
            if (data.id) {
              responseData = await updateMemoWithAI(data.id, data.text || data.content, {
                isUrl: data.isUrl,
                sourceUrl: data.sourceUrl || null,
                originalTitle: data.originalTitle || '',
                originalImage: data.originalImage || '',
                purpose: data.purpose || '일반',
                sourceId: data.sourceId || null,
              });
            } else {
              responseData = await createMemo(data.text || data.content, {
                isUrl: data.isUrl,
                sourceUrl: data.sourceUrl || null,
                originalTitle: data.originalTitle || '',
                originalImage: data.originalImage || '',
                purpose: data.purpose || '일반',
                sourceId: data.sourceId || null,
              });
            }

            // 크레딧 정보 처리 - 간소화
            if (
              responseData &&
              responseData.credits &&
              responseData.credits.remaining !== undefined
            ) {
              console.log('API 응답 크레딧 정보:', responseData.credits);
              useCreditStore.getState().updateCredits(responseData.credits.remaining);
            }

            // 완료 상태로 업데이트
            updatePendingMemo(pendingId, { status: 'completed' });
            showNotification('메모가 성공적으로 생성되었습니다.', 'success');
            setTimeout(() => removePendingMemo(pendingId), 3000);
          } catch (error) {
            handleProcessError(pendingId, error);
          }
        }
      } catch (finalError) {
        // 최종 오류 처리
        console.error('백그라운드 처리 중 예상치 못한 오류:', finalError);
        let finalErrorMessage = '알 수 없는 오류가 발생했습니다';
        if (finalError instanceof Error) {
          finalErrorMessage = finalError.message;
        }
        showNotification(`처리 중 오류가 발생했습니다: ${finalErrorMessage}`, 'error');
      }
    },
    [
      addPendingMemo,
      updatePendingMemo,
      removePendingMemo,
      processUrl,
      updateMemoWithAI,
      createMemo,
      showNotification,
      handleProcessError,
    ]
  );

  // 무한 스크롤을 위한 옵저버 - 최적화
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMemoRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;

      // 이전 observer 정리
      if (observer.current) observer.current.disconnect();

      // 새 observer 생성
      observer.current = new IntersectionObserver((entries) => {
        // 마지막 메모가 화면에 보이고 더 불러올 메모가 있으면 추가 로드
        if (entries[0].isIntersecting && hasMore) {
          // 화면에 표시할 메모 수를 먼저 늘리고
          setDisplayCount((prev) => prev + INITIAL_MEMO_COUNT);

          // 필요한 경우 추가 데이터 로드
          if (memos.length < displayCount + INITIAL_MEMO_COUNT) {
            loadMoreMemos();
          }
        }
      });

      // 마지막 메모 요소 관찰 시작
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMoreMemos, memos.length, displayCount]
  );

  // 최상단으로 스크롤하는 함수
  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 메모 상태 훅
  const { memoStates, toggleThread, toggleLabeling, toggleOriginal } = useMemosState(visibleMemos);

  // 모달 열기 핸들러
  const handleOpenComposer = useCallback(
    (mode: 'direct' | 'analyze', memoId?: string) => {
      if (!memoId && mode === 'direct') {
        showNotification('새 메모는 AI 분석 모드로만 작성할 수 있습니다.', 'error');
        return;
      }

      setEditMode(mode);
      setEditingMemoId(memoId || null);
      setShowComposer(true);
    },
    [showNotification]
  );

  // 모달 닫기 핸들러
  const handleCloseComposer = useCallback(() => {
    setShowComposer(false);
    setEditingMemoId(null);
  }, []);

  // 메모 제출 처리
  const handleSubmit = useCallback(
    async (data: any) => {
      try {
        if (data.mode === 'analyze') {
          if (editingMemoId) {
            await updateMemoWithAI(editingMemoId, data.text, {
              isUrl: data.isUrl,
              sourceUrl: data.sourceUrl,
              originalTitle: data.originalTitle || '',
              originalImage: data.originalImage || '',
              purpose: data.purpose || '일반',
            });
            showNotification('메모가 성공적으로 업데이트되었습니다.', 'success');
          } else {
            await createMemo(data.text, {
              isUrl: data.isUrl,
              sourceUrl: data.sourceUrl,
              originalTitle: data.originalTitle || '',
              originalImage: data.originalImage || '',
              purpose: data.purpose || '일반',
            });
            showNotification('새 메모가 성공적으로 생성되었습니다.', 'success');
          }
        } else if (data.mode === 'direct' && editingMemoId) {
          await updateMemoDirect(editingMemoId, {
            title: data.title,
            tweet_main: data.tweet_main,
            thread: data.thread,
            category: data.category,
            keywords: data.keywords,
            key_sentence: data.key_sentence,
            purpose: data.purpose || '일반',
          });
          showNotification('메모가 성공적으로 업데이트되었습니다.', 'success');
        }

        handleCloseComposer();
      } catch (error: any) {
        showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
      }
    },
    [
      createMemo,
      editingMemoId,
      handleCloseComposer,
      showNotification,
      updateMemoDirect,
      updateMemoWithAI,
    ]
  );

  // 메모 편집 핸들러
  const handleEdit = useCallback(
    (memo: any) => {
      handleOpenComposer('direct', memo.id);
    },
    [handleOpenComposer]
  );

  // 메모 분석 핸들러
  const handleAnalyze = useCallback(
    (memo: any) => {
      handleOpenComposer('analyze', memo.id);
    },
    [handleOpenComposer]
  );

  // 메모 삭제 핸들러
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMemo(id);
        showNotification('메모가 삭제되었습니다.', 'success');
      } catch (error: any) {
        showNotification(`삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    },
    [deleteMemo, showNotification]
  );

  const handlePurposeSelect = useCallback((purpose: string | null) => {
    console.log('목적 선택:', purpose);
    setSelectedPurpose(purpose);
    setDisplayCount(INITIAL_MEMO_COUNT); // 필터 변경 시 표시 개수 초기화
  }, []);

  const searchVisible = useSearchStore((state) => state.searchVisible);

  return (
    <div className="max-w-md mx-auto bg-white overflow-hidden shadow-md min-h-screen tracking-tighter leading-snug">
      {/* 상단 알림 */}
      {topAlert.show && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] p-2"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div className="mx-auto max-w-md shadow-md rounded-md overflow-hidden">
            <div
              className={`p-3 flex items-center ${
                topAlert.type === 'success'
                  ? 'bg-teal-500 text-white'
                  : topAlert.type === 'warning'
                  ? 'bg-amber-500 text-white'
                  : topAlert.type === 'error'
                  ? 'bg-rose-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <div className="flex-1">
                <div className="font-medium">백그라운드 처리 시작</div>
                <div className="text-sm opacity-90">{topAlert.message}</div>
              </div>
              <button
                onClick={() => setTopAlert((prev) => ({ ...prev, show: false }))}
                className="ml-2 text-white opacity-70 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <Header />

      {/* 검색 및 필터 바 */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          searchVisible ? 'max-h-64' : 'max-h-0'
        }`}
      >
        {searchVisible && (
          <SearchAndFilterBar
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            onPurposeSelect={handlePurposeSelect}
            onSortChange={handleSortChange}
            selectedCategory={selectedCategory}
            selectedPurpose={selectedPurpose}
            searchTerm={searchTerm}
            selectedSort={sortOption}
          />
        )}
      </div>

      {/* 알림 메시지 */}
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* 메모 작성 버튼 */}
      {!showComposer && (
        <div className="max-w-md mx-auto w-full fixed bottom-8 right-0 left-0 md:-right-16 lg:right-16 flex justify-end pr-4 z-10">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleScrollToTop}
              className="w-12 h-12 rounded-full bg-emerald-400 text-white flex items-center justify-center shadow-lg lg:w-14 lg:h-14"
            >
              <ChevronsUp size={24} className="lg:hidden" />
              <ChevronsUp size={32} className="hidden lg:block" />
            </button>
            <button
              onClick={() => handleOpenComposer('analyze')}
              className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg lg:w-14 lg:h-14"
            >
              <MessageCirclePlus size={24} className="lg:hidden" />
              <MessageCirclePlus size={32} className="hidden lg:block" />
            </button>
          </div>
        </div>
      )}

      {/* 메모 작성/편집 모달 - 동적 임포트된 컴포넌트 */}
      {showComposer && (
        <ComposerModal
          isOpen={showComposer}
          mode={editMode}
          editingMemo={editingMemoId ? memos.find((m) => m.id === editingMemoId) : undefined}
          onClose={handleCloseComposer}
          onSubmit={handleSubmit}
          onBackgroundProcess={handleBackgroundProcess}
          onBackgroundProcessWithAlert={handleBackgroundProcessWithAlert}
          profile={profile}
        />
      )}

      {/* 대기 중인 메모 목록 - 동적 임포트된 컴포넌트 */}
      <Suspense fallback={<div className="w-full h-8 animate-pulse bg-gray-100 rounded"></div>}>
        {pendingMemos.length > 0 && (
          <PendingMemosList
            pendingMemos={pendingMemos}
            onRemove={removePendingMemo}
            onRemoveAll={removeAllPendingMemos}
            onHeaderDoubleClick={() =>
              showTopAlert('모든 처리 중인 메모가 제거되었습니다.', 'info')
            }
          />
        )}
      </Suspense>

      {/* 메모 목록 - 최적화 버전 */}
      <div className="divide-y divide-gray-200">
        {visibleMemos.length === 0 && !isLoading ? (
          <div className="p-10 text-center text-gray-500">
            {searchTerm || selectedCategory ? (
              <>
                <Search size={48} className="mx-auto mb-4 opacity-30" />
                <p>검색 결과가 없습니다</p>
                <p className="text-sm text-gray-400 mt-2">다른 검색어나 필터를 시도해보세요</p>
              </>
            ) : (
              <>
                <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
                <p>아직 메모가 없습니다. 첫 번째 메모를 작성해보세요!</p>
              </>
            )}
          </div>
        ) : (
          <>
            {visibleMemos.map((memo, index) => (
              <div
                key={memo.id}
                ref={index === visibleMemos.length - 1 ? lastMemoRef : undefined}
                className="transition-opacity duration-300 opacity-100"
              >
                <MemoItem
                  memo={memo}
                  profile={profile}
                  memoState={
                    memo.id
                      ? memoStates[memo.id] || {
                          expanded: false,
                          showLabeling: false,
                          showOriginal: false,
                        }
                      : { expanded: false, showLabeling: false, showOriginal: false }
                  }
                  onToggleThread={toggleThread}
                  onToggleLabeling={toggleLabeling}
                  onToggleOriginal={toggleOriginal}
                  onEdit={handleEdit}
                  onAnalyze={handleAnalyze}
                  onDelete={handleDelete}
                />
              </div>
            ))}

            {/* 더 보기 버튼 - 메모가 더 있는 경우에만 표시 */}
            {memos.length > displayCount && (
              <div className="p-2 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + INITIAL_MEMO_COUNT)}
                  className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm hover:bg-emerald-100 transition-colors"
                >
                  더 보기 ({displayCount}/{memos.length})
                </button>
              </div>
            )}

            {/* 로딩 인디케이터 */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">메모를 불러오는 중...</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 글로벌 알림 모달 - 동적 임포트된 컴포넌트 */}
      {showGlobalAlert && (
        <AlertModal
          isOpen={showGlobalAlert}
          title={alertData.title}
          message={
            <>
              <p>{alertData.message}</p>
            </>
          }
          onConfirm={() => {
            setShowGlobalAlert(false);
            // 모달이 닫힐 때 추가 안내 알림 표시
            showNotification('콘텐츠 추출에 실패했습니다.', 'error');
          }}
        />
      )}

      {/* CSS 애니메이션 정의 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 추가: 이미지 로딩 최적화를 위한 속성 */
        img {
          content-visibility: auto;
        }
      `}</style>
    </div>
  );
};

export default MemoPageContent;
