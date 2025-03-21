//app/(main)/memo/MemoPageContent.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  X,
  Search,
  MessageCirclePlus,
  ChevronsUp,
} from 'lucide-react';

// UI 컴포넌트 임포트
import Header from '../../ui/Header';
import MemoItem from '../../ui/MemoItem';
import Notification from '../../ui/Notification';
import BottomNavigation from '../../ui/BottomNavigation';
import ComposerModal, { ProcessingStep } from '../../ui/ComposerModal';
import SearchAndFilterBar from '../../ui/SearchAndFilterBar';
import PendingMemosList from '../../ui/PendingMemosList'; // 새로 추가한 컴포넌트

// 훅 임포트
import useMemos from '../../hooks/useMemos';
import useMemosState from '../../hooks/useMemosState';
import useNotification from '../../hooks/useNotification';
import usePendingMemos, { PendingMemoStatus } from '../../hooks/usePendingMemos';
import useBackgroundProcess from '../../hooks/useBackgroundProcess'; // 새로 추가한 훅
import AlertModal from '../../ui/AlertModal';
import { RequestTracker } from '../../utils/requestTracker';
import { extractAndAnalyze } from '../../utils/apiClient';
import { useUserStore } from '../../store/userStore';
import { useSearchStore } from '../../store/searchStore';
import { useCreditStore } from '@/app/store/creditStore';

// 상단 알림 인터페이스
interface TopAlert {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

const MemoPageContent: React.FC = () => {
  // 컴포저 모달 상태
  const [showComposer, setShowComposer] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'direct' | 'analyze'>('direct');

  // 검색 및 필터링 관련 상태 추가
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'latest' | 'oldest' | 'today'>('latest');
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);

  // 상단 알림 상태
  const [topAlert, setTopAlert] = useState<TopAlert>({
    show: false,
    message: '',
    type: 'info',
  });

  // 유저 정보
  const currentUser = useUserStore((state) => state.currentUser);

  // profile 객체 동적 생성
  const profile = {
    name: currentUser?.email ? currentUser.email.split('@')[0] : 'BrainLabel',
    username: currentUser?.username
      ? `@${currentUser.username}`
      : currentUser?.email
      ? `@${currentUser.email.split('@')[0]}`
      : '@brainlabel_ai',
    avatar: currentUser?.avatar_url || '/avatar_base.svg',
  };

  // 에러 관련 상태
  const [showGlobalAlert, setShowGlobalAlert] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', url: '' });

  // 메모 관련 훅 - 검색 옵션 추가
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
  });

  // 대기 중인 메모 관리 훅
  const {
    pendingMemos,
    addPendingMemo,
    updatePendingMemo,
    removePendingMemo,
    removeAllPendingMemos,
  } = usePendingMemos();

  // 백그라운드 처리 훅 (새로 추가)
  const { processUrl, cancelTask, cancelAllTasks } = useBackgroundProcess();

  // 검색어 변경 핸들러
  const handleSearch = (term: string) => {
    console.log('검색어 변경:', term);
    setSearchTerm(term);
  };

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: string | null) => {
    console.log('카테고리 선택:', category);
    setSelectedCategory(category);
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (option: 'latest' | 'oldest' | 'today') => {
    console.log('정렬 옵션 변경:', option);
    setSortOption(option);
  };

  // 상단 알림 표시 함수
  const showTopAlert = (
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
  };

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
  const handleBackgroundProcessWithAlert = async (data: any, alertMessage: string) => {
    console.log('백그라운드 처리 + 알림 함수 호출됨:', alertMessage);

    // 알림을 먼저 표시 (데이터 처리 전에)
    showTopAlert(alertMessage, 'success', 3000);

    // 백그라운드 처리 시작
    await handleBackgroundProcess({
      ...data,
      skipPendingCreation: true, // 중복 생성 방지 플래그
    });
  };

  // 글로벌 오류 알림 표시 함수
  const showGlobalExtractionAlert = (message: string, url: string) => {
    setAlertData({
      title: '콘텐츠 추출 실패',
      message: message,
      url: url,
    });
    setShowGlobalAlert(true);
  };

  // 오류 처리 함수
  const handleProcessError = (pendingId: string, error: any) => {
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
  };

  // 백그라운드 처리 함수
  const handleBackgroundProcess = async (data: any) => {
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

          // 메모 작업 완료 후 크레딧 정보 직접 가져오기
          // 메모 작업 완료 후 크레딧 정보 직접 가져오기
          try {
            const creditsResponse = await fetch('/api/credits');
            if (creditsResponse.ok) {
              const creditsData = await creditsResponse.json();
              console.log('직접 가져온 크레딧 정보:', creditsData);
              useCreditStore.getState().updateCredits(creditsData.remaining);
            }
          } catch (creditsError) {
            console.error('크레딧 정보 가져오기 실패:', creditsError);
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
  };

  // 무한 스크롤을 위한 옵저버
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
          loadMoreMemos();
        }
      });

      // 마지막 메모 요소 관찰 시작
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMoreMemos]
  );

  // 최상단으로 스크롤하는 함수 추가 (기존 함수들 사이에 추가)
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 메모 상태 훅
  const { memoStates, toggleThread, toggleLabeling, toggleOriginal } = useMemosState(memos);

  // 알림 훅
  const { notification, showNotification } = useNotification();

  // 모달 열기 핸들러
  const handleOpenComposer = (mode: 'direct' | 'analyze', memoId?: string) => {
    if (!memoId && mode === 'direct') {
      showNotification('새 메모는 AI 분석 모드로만 작성할 수 있습니다.', 'error');
      return;
    }

    setEditMode(mode);
    setEditingMemoId(memoId || null);
    setShowComposer(true);
  };

  // 모달 닫기 핸들러
  const handleCloseComposer = () => {
    setShowComposer(false);
    setEditingMemoId(null);
  };

  // 메모 제출 처리
  const handleSubmit = async (data: any) => {
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
  };

  // 메모 편집 핸들러
  const handleEdit = (memo: any) => {
    handleOpenComposer('direct', memo.id);
  };

  // 메모 분석 핸들러
  const handleAnalyze = (memo: any) => {
    handleOpenComposer('analyze', memo.id);
  };

  // 메모 삭제 핸들러
  const handleDelete = async (id: string) => {
    try {
      await deleteMemo(id);
      showNotification('메모가 삭제되었습니다.', 'success');
    } catch (error: any) {
      showNotification(`삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  const handlePurposeSelect = (purpose: string | null) => {
    console.log('목적 선택:', purpose);
    setSelectedPurpose(purpose);
  };

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
        <div className="max-w-md mx-auto w-full fixed bottom-8 right-0 left-0  md:-right-16  lg:right-16 flex justify-end pr-4 z-10">
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

      {/* 메모 작성/편집 모달 */}
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

      {/* 대기 중인 메모 목록 - 새 컴포넌트 사용 */}
      <PendingMemosList
        pendingMemos={pendingMemos}
        onRemove={removePendingMemo}
        onRemoveAll={removeAllPendingMemos}
        onHeaderDoubleClick={() => showTopAlert('모든 처리 중인 메모가 제거되었습니다.', 'info')}
      />

      {/* 메모 목록 */}
      <div className="divide-y divide-gray-200 ">
        {memos.length === 0 && !isLoading ? (
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
            {memos.map((memo, index) => (
              <div key={memo.id} ref={index === memos.length - 1 ? lastMemoRef : undefined}>
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

      {/* 글로벌 알림 모달 */}
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
      `}</style>
    </div>
  );
};

export default MemoPageContent;
