//app/page.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, CheckCircle2, X } from 'lucide-react';

// UI 컴포넌트 임포트
import Header from './ui/Header';
import MemoItem from './ui/MemoItem';
import Notification from './ui/Notification';
import BottomNavigation from './ui/BottomNavigation';
import ComposerModal, { ProcessingStep } from './ui/ComposerModal';

// 훅 임포트
import useMemos from './hooks/useMemos';
import useMemosState from './hooks/useMemosState';
import useNotification from './hooks/useNotification';
import usePendingMemos, { PendingMemoStatus } from './hooks/usePendingMemos';
import AlertModal from './ui/AlertModal';
import { RequestTracker } from './utils/requestTracker';
import { extractAndAnalyze } from './utils/apiClient';

// 프로필 정보
const profile = {
  name: 'BrainLabel',
  username: '@brainlabel_ai',
  avatar: 'https://placehold.co/40x40',
  verified: true,
};

// 상단 알림 인터페이스
interface TopAlert {
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

const MemoPage: React.FC = () => {
  // 컴포저 모달 상태
  const [showComposer, setShowComposer] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'direct' | 'analyze'>('direct');

  // 상단 알림 상태
  const [topAlert, setTopAlert] = useState<TopAlert>({
    show: false,
    message: '',
    type: 'info',
  });

  // 에러 관련 상태
  const [showGlobalAlert, setShowGlobalAlert] = useState(false);
  const [alertData, setAlertData] = useState({ title: '', message: '', url: '' });

  // 메모 관련 훅
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
  } = useMemos();

  // 대기 중인 메모 관리 훅
  const {
    pendingMemos,
    addPendingMemo,
    updatePendingMemo,
    removePendingMemo,
    removeAllPendingMemos,
  } = usePendingMemos();

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
        return; // 더 이상 처리하지 않음
      }

      // 백그라운드 계속 버튼을 클릭한 경우 (isOngoing=true)
      if (data.isOngoing) {
        // 추출 단계일 때도 처리 중인 메모에 추가
        if (data.currentStep === 'extracting') {
          console.log('추출 단계 처리 시작');

          // 중복 생성 방지 플래그 확인
          if (data.skipPendingCreation) {
            console.log('중복 생성 방지 플래그가 설정되어 있어 pendingMemo를 생성하지 않습니다.');
            // 알림은 이미 표시되었으므로 추가 처리 없이 return
            return;
          }

          // 추출 단계에서도 처리 중인 메모에 추가
          const pendingId = addPendingMemo(data.originalUrl || data.text || '');

          // 상태 및 데이터 업데이트
          updatePendingMemo(pendingId, {
            status: 'extracting',
            extractedData: {
              title: '내용 추출 중...',
              content: data.originalUrl || data.text || '',
            },
          });

          // 추출 단계에서 백그라운드 처리 요청의 경우에도 URL 유효성 체크
          try {
            // 원본 URL이 있는 경우 추출 시도
            if (data.originalUrl && data.originalUrl.match(/^https?:\/\//i)) {
              console.log('백그라운드에서 URL 추출 시도:', data.originalUrl);

              // 중복 요청 방지 기능이 내장된 API 클라이언트 사용
              const extractData = await extractAndAnalyze(data.originalUrl);

              // 페이월 콘텐츠 검사 추가
              const lowerContent = (extractData.content || '').toLowerCase();
              const paywallKeywords = [
                'subscribe',
                'subscription',
                'sign in',
                'log in',
                'member',
                'verify access',
              ];
              const hasPaywallIndicators = paywallKeywords.some((keyword) =>
                lowerContent.includes(keyword)
              );

              // 추출된 콘텐츠 유효성 검사
              if (
                !extractData.content ||
                extractData.content.trim().length < 200 ||
                (hasPaywallIndicators && extractData.content.trim().length < 1000) ||
                (extractData.title &&
                  (extractData.title.toLowerCase().includes('access denied') ||
                    extractData.title.toLowerCase().includes('error')))
              ) {
                let errorMessage = `URL에서 유효한 콘텐츠를 찾을 수 없습니다. 직접 내용을 복사하여 붙여넣어 주세요.`;

                // 페이월 발견 시 메시지 수정
                if (hasPaywallIndicators) {
                  errorMessage = `이 콘텐츠는 구독이 필요한 페이지로 보입니다. 직접 내용을 복사하여 붙여넣어 주세요.`;
                }

                // 오류 상태로 업데이트
                updatePendingMemo(pendingId, {
                  status: 'error',
                  error: errorMessage,
                });

                setAlertData({
                  title: '콘텐츠 추출 실패',
                  message: errorMessage,
                  url: data.originalUrl,
                });
                setShowGlobalAlert(true);
                return;
              }

              // 유효한 콘텐츠가 있는 경우 처리 계속
              // 분석 단계로 상태 업데이트
              updatePendingMemo(pendingId, {
                status: 'analyzing',
                extractedData: {
                  title: extractData.title || '분석 중...',
                  imageUrl: extractData.imageUrl || '',
                  content: extractData.content,
                  sourceUrl: extractData.sourceUrl || null,
                },
              });

              data.text = extractData.content;
              data.isUrl = true;
              data.sourceUrl = extractData.sourceUrl || data.originalUrl;
              data.originalTitle = extractData.title || '';
              data.originalImage = extractData.imageUrl || '';
              data.currentStep = 'analyzing';

              // API 호출 및 메모 저장
              try {
                if (data.id) {
                  await updateMemoWithAI(data.id, data.text, {
                    isUrl: data.isUrl,
                    sourceUrl: data.sourceUrl || null,
                    originalTitle: data.originalTitle || '',
                    originalImage: data.originalImage || '',
                  });
                } else {
                  await createMemo(data.text, {
                    isUrl: data.isUrl,
                    sourceUrl: data.sourceUrl || null,
                    originalTitle: data.originalTitle || '',
                    originalImage: data.originalImage || '',
                  });
                }

                // 완료 상태로 업데이트 후 제거
                updatePendingMemo(pendingId, { status: 'completed' });
                setTimeout(() => removePendingMemo(pendingId), 3000);
              } catch (error) {
                // 오류 발생 시 상태 업데이트
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
              }
            } else {
              // URL이 아닌 경우 오류 상태로 업데이트
              updatePendingMemo(pendingId, {
                status: 'error',
                error: '유효한 URL이 아닙니다.',
              });
            }
          } catch (error) {
            console.error('백그라운드 URL 추출 오류:', error);
            let errorMessage = '알 수 없는 오류가 발생했습니다';
            if (error instanceof Error) {
              errorMessage = error.message;
            }

            // 오류 상태로 업데이트
            updatePendingMemo(pendingId, {
              status: 'error',
              error: errorMessage,
            });

            setAlertData({
              title: '콘텐츠 추출 실패',
              message: `오류가 발생했습니다: ${errorMessage}. 직접 내용을 복사하여 붙여넣어 주세요.`,
              url: data.originalUrl || '',
            });
            setShowGlobalAlert(true);
          }
          return;
        }

        // 중복 생성 방지 플래그 확인
        if (data.skipPendingCreation) {
          console.log('중복 생성 방지 플래그가 설정되어 있어 pendingMemo를 생성하지 않습니다.');
          return;
        }

        // 분석 단계일 때 처리 중인 메모에 추가
        const pendingId = addPendingMemo(data.text || data.content || '');

        // 상태 및 추출 데이터 업데이트
        updatePendingMemo(pendingId, {
          status: 'analyzing', // 항상 분석 중 상태로 추가
          extractedData: {
            title: data.originalTitle || '',
            imageUrl: data.originalImage || '',
            content: data.text || data.content || '',
            sourceUrl: data.sourceUrl || null,
          },
        });

        // 백그라운드 처리에도 API 호출 및 완료 처리 추가
        try {
          // OpenAI API 호출 및 메모 저장
          if (data.id) {
            await updateMemoWithAI(data.id, data.text || data.content, {
              isUrl: data.isUrl,
              sourceUrl: data.sourceUrl || null,
              originalTitle: data.originalTitle || '',
              originalImage: data.originalImage || '',
            });
          } else {
            await createMemo(data.text || data.content, {
              isUrl: data.isUrl,
              sourceUrl: data.sourceUrl || null,
              originalTitle: data.originalTitle || '',
              originalImage: data.originalImage || '',
            });
          }

          // 완료 상태로 업데이트 후 제거
          updatePendingMemo(pendingId, { status: 'completed' });
          setTimeout(() => removePendingMemo(pendingId), 3000);
        } catch (error) {
          // 오류 발생 시 상태 업데이트
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
        }

        return;
      }

      // 새로운 요청인 경우 (handleSubmit에서 호출된 경우)
      const pendingId = addPendingMemo(data.text);

      try {
        // 상태 및 추출 데이터 업데이트
        const status: PendingMemoStatus =
          data.currentStep === 'extracting' ? 'extracting' : 'analyzing';

        updatePendingMemo(pendingId, {
          status: status,
          extractedData: {
            title: data.originalTitle || '',
            imageUrl: data.originalImage || '',
            content: data.text,
            sourceUrl: data.sourceUrl || null,
          },
        });

        // OpenAI API 호출 및 메모 저장
        if (data.id) {
          await updateMemoWithAI(data.id, data.text, {
            isUrl: data.isUrl,
            sourceUrl: data.sourceUrl || null,
            originalTitle: data.originalTitle || '',
            originalImage: data.originalImage || '',
          });
        } else {
          await createMemo(data.text, {
            isUrl: data.isUrl,
            sourceUrl: data.sourceUrl || null,
            originalTitle: data.originalTitle || '',
            originalImage: data.originalImage || '',
          });
        }

        // 완료 상태로 업데이트 후 알림
        updatePendingMemo(pendingId, { status: 'completed' });
        showNotification('메모가 성공적으로 생성되었습니다.', 'success');

        // 잠시 후 목록에서 제거 (UI에서 처리 완료 표시를 보여주기 위해)
        setTimeout(() => removePendingMemo(pendingId), 3000);
      } catch (error) {
        // 오류 발생 시 상태 업데이트
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
          });
          showNotification('메모가 성공적으로 업데이트되었습니다.', 'success');
        } else {
          await createMemo(data.text, {
            isUrl: data.isUrl,
            sourceUrl: data.sourceUrl,
            originalTitle: data.originalTitle || '',
            originalImage: data.originalImage || '',
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

  // 더블 탭 감지를 위한 상태와 타이머
  const [lastTap, setLastTap] = useState<number>(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 대기 중인 메모 헤더 클릭 처리 (더블 탭으로 모든 메모 정리)
  const handlePendingHeaderClick = () => {
    const now = new Date().getTime();
    const DOUBLE_TAP_DELAY = 300; // 더블 탭 인식 시간 (ms)

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // 더블 탭 감지됨
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }

      // 모든 대기 메모 제거
      removeAllPendingMemos();
      showTopAlert('모든 처리 중인 메모가 제거되었습니다.', 'info');
    } else {
      // 첫 번째 탭
      setLastTap(now);

      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }

      tapTimerRef.current = setTimeout(() => {
        // 단일 탭 처리 (필요한 경우)
        tapTimerRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

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

      {/* 알림 메시지 */}
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* 메모 작성 버튼 */}
      {!showComposer && (
        <div className="fixed bottom-20 right-4 z-10">
          <button
            onClick={() => handleOpenComposer('analyze')}
            className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg"
          >
            <MessageCircle size={24} />
          </button>
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

      {/* 대기 중인 메모 목록 - 모든 단계 메모 표시 */}
      {pendingMemos.length > 0 && (
        <div className="p-2 bg-gray-50">
          <h3
            className="text-sm font-medium text-gray-700 mb-2 px-2 flex justify-between items-center"
            onClick={handlePendingHeaderClick}
          >
            <span>처리 중인 메모</span>
            <span className="text-xs text-gray-400">({pendingMemos.length})</span>
          </h3>
          <div className="space-y-2">
            {/* filter 제거하고 모든 상태 표시 */}
            {pendingMemos.map((pendingMemo) => (
              <div
                key={pendingMemo.id}
                className="p-3 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center">
                  {/* 상태에 따른 아이콘 */}
                  <div className="mr-3">
                    {pendingMemo.status === 'extracting' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {/* 추출 아이콘 */}
                        <span className="animate-pulse">⬇️</span>
                      </div>
                    )}
                    {pendingMemo.status === 'analyzing' && (
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="animate-pulse">🧠</span>
                      </div>
                    )}
                    {pendingMemo.status === 'completed' && (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span>✅</span>
                      </div>
                    )}
                    {pendingMemo.status === 'error' && (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <span>❌</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {pendingMemo.status === 'extracting'
                        ? '내용 추출 중...'
                        : pendingMemo.extractedData?.title || '처리 중인 메모'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pendingMemo.status === 'extracting' && 'URL에서 콘텐츠를 추출하는 중...'}
                      {pendingMemo.status === 'analyzing' && 'AI 분석 중...'}
                      {pendingMemo.status === 'completed' && (
                        <span className="text-green-500">처리 완료!</span>
                      )}
                      {pendingMemo.status === 'error' && (
                        <span className="text-red-500">{pendingMemo.error || '오류 발생'}</span>
                      )}
                    </p>

                    {/* 추출 중일 때 입력 텍스트 표시 */}
                    {pendingMemo.status === 'extracting' && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                        {pendingMemo.inputText}
                      </p>
                    )}
                  </div>

                  {/* 이미지 미리보기 (있는 경우) */}
                  {pendingMemo.extractedData?.imageUrl && (
                    <div className="ml-2 w-12 h-12">
                      <img
                        src={pendingMemo.extractedData.imageUrl}
                        alt="미리보기"
                        className="w-full h-full object-cover rounded"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* 개별 메모 제거 버튼 */}
                  <button
                    className="ml-2 p-1 text-gray-400 hover:text-red-500"
                    onClick={() => removePendingMemo(pendingMemo.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 메모 목록 */}
      <div className="divide-y divide-gray-200">
        {memos.length === 0 && !isLoading ? (
          <div className="p-10 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
            <p>아직 메모가 없습니다. 첫 번째 메모를 작성해보세요!</p>
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
                  //onLike={likeMemo}
                  //onRetweet={retweetMemo}
                  //onReply={replyToMemo}
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

      {/* 바텀 네비게이션 */}
      <BottomNavigation />

      {/* 글로벌 알림 모달 */}
      <AlertModal
        isOpen={showGlobalAlert}
        title={alertData.title}
        message={
          <>
            <p>{alertData.message}</p>
            {alertData.url && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                <code>{alertData.url}</code>
              </div>
            )}
          </>
        }
        onConfirm={() => setShowGlobalAlert(false)}
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

export default MemoPage;
