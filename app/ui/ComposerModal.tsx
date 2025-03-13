import React, { useState, useEffect } from 'react';
import { X, Image, Video, Loader, AlertCircle } from 'lucide-react';
import { Memo } from '../utils/types';
import LoadingModal from './LoadingModal';
import AlertModal from './AlertModal';
import { RequestTracker } from '../utils/requestTracker';
import { extractAndAnalyze } from '../utils/apiClient';
import { Textarea } from '@/components/ui/textarea';

// 처리 단계 타입 정의
export type ProcessingStep = 'idle' | 'extracting' | 'analyzing';

interface ComposerModalProps {
  isOpen: boolean;
  mode: 'direct' | 'analyze';
  editingMemo?: Memo;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  profile: {
    avatar: string;
  };
  onBackgroundProcess?: (data: any) => Promise<void>;
  onBackgroundProcessWithAlert?: (data: any, message: string) => void; // 알림 메시지를 위한 콜백 추가
}

const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  mode,
  editingMemo,
  onClose,
  onSubmit,
  profile,
  onBackgroundProcess,
  onBackgroundProcessWithAlert,
}) => {
  // 입력 상태
  const [inputText, setInputText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [extractedData, setExtractedData] = useState<{
    title?: string;
    imageUrl?: string;
    content?: string;
    sourceUrl?: string;
    sourceId?: string;
  } | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  // 목적 선택 상태 추가
  const [selectedPurpose, setSelectedPurpose] = useState<string>('일반');

  // 직접 수정 폼 데이터
  const [editFormData, setEditFormData] = useState<{
    title: string;
    tweet_main: string;
    thread: string[];
    category: string;
    keywords: string[];
    key_sentence: string;
    purpose: string; // purpose 필드 추가
  }>({
    title: '',
    tweet_main: '',
    thread: [''],
    category: '',
    keywords: [],
    key_sentence: '',
    purpose: '일반', // 기본값 설정
  });

  // 키워드 입력을 위한 별도의 상태
  const [keywordsInput, setKeywordsInput] = useState<string>('');

  // 오류 알람
  const [showExtractionAlert, setShowExtractionAlert] = useState(false);
  const [extractionAlertMessage, setExtractionAlertMessage] = useState('');
  const [isUrlExtracting, setIsUrlExtracting] = useState(false);

  // 목적 선택 핸들러 추가
  const handlePurposeSelect = (purpose: string) => {
    setSelectedPurpose(purpose);

    if (mode === 'direct') {
      setEditFormData((prev) => ({
        ...prev,
        purpose: purpose,
      }));
    }
  };

  // 모달이 열릴 때 초기 데이터 설정
  useEffect(() => {
    if (isOpen && editingMemo) {
      if (mode === 'direct') {
        // 직접 수정 모드일 때
        setEditFormData({
          title: editingMemo.title,
          tweet_main: editingMemo.tweet_main,
          thread: [...editingMemo.thread],
          category: editingMemo.labeling.category,
          keywords: [...editingMemo.labeling.keywords],
          key_sentence: editingMemo.labeling.key_sentence,
          purpose: editingMemo.purpose || '일반', // purpose 추가
        });
        setSelectedPurpose(editingMemo.purpose || '일반');
        setKeywordsInput(editingMemo.labeling.keywords.join(', '));
      } else {
        // AI 분석 모드일 때
        setSelectedPurpose(editingMemo.purpose || '일반');
        setInputText(editingMemo.original_text || editingMemo.thread.join('\n\n'));
        setCharacterCount((editingMemo.original_text || editingMemo.thread.join('\n\n')).length);
      }
    } else if (isOpen) {
      // 새 메모 작성 모드
      resetForm();
    }

    // 모달이 열릴 때마다 취소 상태 초기화
    setIsCancelled(false);
  }, [isOpen, editingMemo, mode]);

  // 폼 리셋
  const resetForm = () => {
    setInputText('');
    setCharacterCount(0);
    setError(null);
    setEditFormData({
      title: '',
      tweet_main: '',
      thread: [''],
      category: '',
      keywords: [],
      key_sentence: '',
      purpose: '일반',
    });
    setKeywordsInput('');
    setProcessingStep('idle');
    setExtractedData(null);
    setSelectedPurpose('일반'); // 선택된 목적 리셋
  };

  // 입력 텍스트 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setCharacterCount(text.length);
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

  // 키워드 입력 처리 함수
  const handleKeywordsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordsInput(e.target.value);
  };

  // 백그라운드 처리 핸들러
  const handleContinueInBackground = () => {
    console.log('배경 처리 버튼 클릭됨, 현재 단계:', processingStep);

    // 배경 처리 데이터 준비
    const processData = {
      text: extractedData?.content || inputText,
      originalUrl: inputText.trim(), // 원본 URL 추가
      mode: 'analyze',
      id: editingMemo?.id,
      isUrl: !!extractedData?.sourceUrl,
      sourceUrl: extractedData?.sourceUrl || null,
      originalTitle: extractedData?.title || '',
      originalImage: extractedData?.imageUrl || '',
      currentStep: processingStep, // 현재 진행 단계 전달
      isOngoing: true, // 백그라운드 처리 플래그
      purpose: selectedPurpose, // 선택된 목적 추가
      sourceId: extractedData?.sourceId, // 추가: 소스 ID 전달
    };

    // 알림 메시지 생성
    const stepText = processingStep === 'extracting' ? '추출' : '분석';
    const alertMessage = `${stepText} 작업을 백그라운드에서 계속 진행합니다.`;

    console.log('알림 메시지:', alertMessage);

    // 모달은 닫지 않고 로딩 상태 유지 (사용자가 버튼 클릭 시에만 모달 닫힘)
    setIsSubmitting(false);

    // 알림과 함께 백그라운드 처리 요청
    if (onBackgroundProcessWithAlert) {
      console.log('알림 콜백 함수 호출');
      onBackgroundProcessWithAlert(processData, alertMessage);
    } else if (onBackgroundProcess) {
      console.log('일반 백그라운드 처리 함수 호출');
      onBackgroundProcess(processData);
    }

    // 모달 즉시 닫기
    onClose();
  };

  // 제출 처리
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setProcessingStep('extracting');
    setError(null);

    try {
      if (mode === 'direct') {
        // 직접 수정 모드는 그대로 유지 (기존 코드)
        const keywordArray = keywordsInput
          .split(',')
          .map((keyword) => keyword.trim())
          .filter(Boolean);

        await onSubmit({
          ...editFormData,
          keywords: keywordArray,
          mode: 'direct',
          id: editingMemo?.id,
        });

        onClose();
      } else {
        // AI 분석 모드
        if (!inputText.trim()) {
          throw new Error('내용을 입력해주세요');
        }

        // URL 입력인지 확인 (http 또는 https로 시작하는지)
        const isUrl = inputText.trim().match(/^https?:\/\//i);

        // 1단계: URL 확인 및 콘텐츠 추출 (URL인 경우만)
        if (isUrl) {
          const url = inputText.trim();

          try {
            // 중복 요청 방지 기능이 내장된 API 클라이언트 사용
            const extractResponse = await fetch('/api/extract-and-analyze', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: url,
              }),
            });

            // 수정됨: 응답이 성공적이지 않은 경우의 처리 개선
            if (!extractResponse.ok) {
              // 응답 상태 및 텍스트 정보 가져오기 시도
              let errorMessage = `API 오류: ${extractResponse.status}`;
              let errorResponseText = '';

              try {
                errorResponseText = await extractResponse.text();
                // JSON인지 확인하여 파싱 시도
                try {
                  const errorData = JSON.parse(errorResponseText);
                  if (errorData.error) {
                    errorMessage = errorData.error;
                  }
                } catch (jsonError) {
                  // JSON 파싱 실패 - 텍스트 그대로 사용
                  if (errorResponseText && errorResponseText.length < 100) {
                    errorMessage = errorResponseText;
                  }
                }
              } catch (textError) {
                // 응답 텍스트 가져오기 실패 - 기본 메시지 사용
                console.error('응답 텍스트 가져오기 실패:', textError);
              }

              console.error('URL 추출 API 오류:', errorMessage);

              // 1. 알림 모달 표시
              setShowExtractionAlert(true);
              setExtractionAlertMessage(
                `오류가 발생했습니다: ${errorMessage}. 직접 내용을 복사하여 붙여넣어 주세요.`
              );

              // 2. onBackgroundProcess 호출하여 MemoPageContent에 추출 실패 알림
              if (onBackgroundProcess) {
                onBackgroundProcess({
                  extractionFailed: true, // 추출 실패 플래그
                  errorMessage: `추출 불가, 내용 직접 입력해주세요}`,
                  originalUrl: url,
                  text: url,
                  mode: 'analyze',
                });
              }

              // 상태 리셋
              setProcessingStep('idle');
              setIsSubmitting(false);

              throw new Error(errorMessage);
            }

            const extractData = await extractResponse.json();

            // 소스 ID 확인 (추가된 부분)
            const sourceId = extractData.sourceId;
            console.log('추출된 소스 ID:', sourceId);

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

            // 추출 데이터 유효성 검사 강화
            if (
              !extractData.content ||
              extractData.content.trim().length < 200 ||
              (hasPaywallIndicators && extractData.content.trim().length < 1000) ||
              (extractData.title &&
                (extractData.title.toLowerCase().includes('access denied') ||
                  extractData.title.toLowerCase().includes('error')))
            ) {
              let errorMessage = `URL(${url})에서 유효한 콘텐츠를 찾을 수 없습니다. 직접 내용을 복사하여 붙여넣어 주세요.`;

              // 페이월 발견 시 메시지 수정
              if (hasPaywallIndicators) {
                errorMessage = `이 콘텐츠는 구독이 필요한 페이지로 보입니다. 직접 내용을 복사하여 붙여넣어 주세요.`;
              }

              console.error('유효하지 않은 콘텐츠:', {
                contentLength: extractData.content?.length,
                hasPaywall: hasPaywallIndicators,
                preview: extractData.content?.substring(0, 100),
              });

              // 수정됨: onBackgroundProcess 호출 추가
              if (onBackgroundProcess) {
                onBackgroundProcess({
                  extractionFailed: true,
                  errorMessage: errorMessage,
                  originalUrl: url,
                  text: url,
                  mode: 'analyze',
                });
              }

              setShowExtractionAlert(true);
              setExtractionAlertMessage(errorMessage);
              setProcessingStep('idle');
              setIsSubmitting(false);
              return;
            }

            // 추출 데이터 저장 및 UI 업데이트
            setExtractedData({
              title: extractData.title || '',
              imageUrl: extractData.imageUrl || extractData.thumbnailUrl || '',
              content: extractData.content,
              sourceUrl: extractData.isExtracted ? extractData.sourceUrl : null,
              sourceId: extractData.sourceId, // 추가: 소스 ID 저장
            });

            // 분석 단계로 변경
            setProcessingStep('analyzing');

            // 백그라운드 처리를 위한 데이터 준비
            const processData = {
              text: extractData.content,
              originalUrl: url,
              mode: 'analyze',
              id: editingMemo?.id,
              isUrl: extractData.isExtracted,
              sourceUrl: extractData.isExtracted ? extractData.sourceUrl : null,
              originalTitle: extractData.title || '',
              originalImage: extractData.imageUrl || extractData.thumbnailUrl || '',
              currentStep: 'analyzing' as ProcessingStep,
              isOngoing: false, // 새로운 요청임을 표시
              purpose: selectedPurpose, // 선택된 목적 추가
              sourceId: extractData.sourceId, // 추가: 소스 ID 전달
            };

            // 백그라운드 처리 시작 (여기서 onSubmit 대신 onBackgroundProcess 사용)
            if (onBackgroundProcess) {
              // 모달은 닫지 않고 로딩 상태 유지 (사용자가 버튼 클릭 시에만 모달 닫힘)
              await onBackgroundProcess(processData);

              // 백그라운드 처리 완료 후 모달 닫기 (사용자가 기다리기로 선택한 경우)
              setIsSubmitting(false);
              onClose();
            }
          } catch (error) {
            // 수정됨: 추출 과정 예외 발생 시 처리 개선
            console.error('추출 과정 예외 발생:', error);

            // 에러 메시지 추출
            let errorMessage = '알 수 없는 오류가 발생했습니다';
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }

            // 1. 알림 모달 표시
            setShowExtractionAlert(true);
            setExtractionAlertMessage(
              `오류가 발생했습니다: ${errorMessage}. 직접 내용을 복사하여 붙여넣어 주세요.`
            );

            // 2. onBackgroundProcess 호출하여 MemoPageContent에 추출 실패 알림
            if (onBackgroundProcess) {
              onBackgroundProcess({
                extractionFailed: true, // 추출 실패 플래그
                errorMessage: `추출 불가, 내용 직접 입력해주세요`,
                originalUrl: inputText.trim(),
                text: inputText.trim(),
                mode: 'analyze',
              });
            }

            // 상태 리셋
            setProcessingStep('idle');
            setIsSubmitting(false);
          }
        } else {
          // URL이 아닌 일반 텍스트 - 바로 분석 단계로
          setProcessingStep('analyzing');

          // 백그라운드 처리 데이터 준비
          const processData = {
            text: inputText.trim(),
            mode: 'analyze',
            id: editingMemo?.id,
            isUrl: false,
            currentStep: 'analyzing' as ProcessingStep,
            isOngoing: false,
            purpose: selectedPurpose, // 선택된 목적 추가
            sourceId: null,
          };

          // 백그라운드 처리
          if (onBackgroundProcess) {
            await onBackgroundProcess(processData);
            setIsSubmitting(false);
            onClose();
          }
        }
      }
    } catch (error) {
      console.error('처리 오류:', error);

      // 에러 메시지 추출
      let errorMessage = '알 수 없는 오류가 발생했습니다';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // URL 추출 관련 오류는 전용 알림으로 표시
      if (
        inputText.trim().match(/^https?:\/\//i) &&
        (errorMessage.includes('추출') ||
          errorMessage.includes('URL') ||
          errorMessage.includes('웹') ||
          errorMessage.includes('접근') ||
          errorMessage.includes('권한'))
      ) {
        setShowExtractionAlert(true);
        setExtractionAlertMessage(`${errorMessage}. 직접 내용을 복사하여 붙여넣어 주세요.`);
      } else {
        // 일반 오류 메시지
        setError(`오류가 발생했습니다: ${errorMessage}`);
      }

      setProcessingStep('idle');
      setIsSubmitting(false);
    }
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 또는 Cmd+Enter로 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const placeholderText = `분석할 텍스트,
웹페이지 URL 또는
YouTube 링크를 입력하세요...`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      {/* 로딩 모달 추가 */}
      <LoadingModal
        isOpen={isSubmitting}
        step={processingStep === 'extracting' ? 'extracting' : 'analyzing'}
        extractedData={extractedData || undefined}
        onContinueInBackground={handleContinueInBackground} // 단계에 관계없이 항상 전달
      />

      {/* 수정됨: AlertModal onConfirm 핸들러 수정 */}
      <AlertModal
        isOpen={showExtractionAlert}
        title="콘텐츠 추출 실패"
        message={
          <>
            <p>{extractionAlertMessage}</p>
          </>
        }
        onConfirm={() => {
          setShowExtractionAlert(false);

          // 모달 닫을 때 오류 알림 표시 (선택 사항)
          if (onBackgroundProcess) {
            onBackgroundProcess({
              extractionFailed: true,
              errorMessage: extractionAlertMessage,
              originalUrl: inputText,
              text: inputText,
              mode: 'analyze',
            });
          }
        }}
      />

      {/* 기존 모달 내용 - isSubmitting이 아닐 때만 표시 */}
      {!isSubmitting && (
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center">
            <div className="w-5"></div>

            <span className="font-semibold">
              {editingMemo
                ? mode === 'direct'
                  ? '메모 직접 수정'
                  : '메모 재분석'
                : '새 메모 작성'}
            </span>
            <button onClick={onClose} className="text-emerald-600 ">
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {/* AI 분석 모드 UI */}
            {mode === 'analyze' && (
              <div className="flex">
                {/* <div className="mr-[6px]">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div> */}
                <div className="flex-1">
                  <textarea
                    className="w-full border-0 focus:ring-0 focus:outline-none resize-none p-2 min-h-[68vh]"
                    placeholder={placeholderText}
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
                    {/* 모바일 및 작은 화면에 대응하는 수직 레이아웃으로 변경 */}
                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between">
                      {/* 목적 버튼 그룹 - 작은 화면에서도 잘 보이도록 수정 */}
                      <div className="flex flex-wrap gap-2 text-emerald-600">
                        <button
                          className={`px-2 py-1 text-sm rounded ${
                            selectedPurpose === '일반'
                              ? 'bg-emerald-600 text-gray-100'
                              : 'bg-gray-100'
                          }`}
                          onClick={() => handlePurposeSelect('일반')}
                        >
                          일반
                        </button>
                        <button
                          className={`px-2 py-1 text-sm rounded ${
                            selectedPurpose === '업무' ? 'bg-teal-500 text-gray-100' : 'bg-gray-100'
                          }`}
                          onClick={() => handlePurposeSelect('업무')}
                        >
                          업무
                        </button>
                        <button
                          className={`px-2 py-1 text-sm rounded ${
                            selectedPurpose === '개인' ? 'bg-teal-500 text-gray-100' : 'bg-gray-100'
                          }`}
                          onClick={() => handlePurposeSelect('개인')}
                        >
                          개인
                        </button>
                        {/* <button
                          className={`px-2 py-1 text-sm rounded ${
                            selectedPurpose === '할일' ? 'bg-teal-500 text-gray-100' : 'bg-gray-100'
                          }`}
                          onClick={() => handlePurposeSelect('할일')}
                        >
                          할일
                        </button> */}
                        <button
                          className={`px-2 py-1 text-sm rounded ${
                            selectedPurpose === '학습' ? 'bg-teal-500 text-gray-100' : 'bg-gray-100'
                          }`}
                          onClick={() => handlePurposeSelect('학습')}
                        >
                          학습
                        </button>
                      </div>

                      {/* 카운터와 제출 버튼 - 작은 화면에서는 아래에 배치 */}
                      <div className="flex items-center justify-between sm:justify-end">
                        <div
                          className={`text-sm mr-3 ${
                            characterCount > 10000 ? 'text-red-500' : 'text-gray-500'
                          }`}
                        >
                          {characterCount}/10000
                        </div>
                        <button
                          className={`rounded-full px-4 py-1 text-white font-bold ${
                            !inputText.trim() || isSubmitting || characterCount > 10000
                              ? 'bg-emerald-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-teal-600'
                          }`}
                          onClick={handleSubmit}
                          disabled={!inputText.trim() || isSubmitting || characterCount > 10000}
                        >
                          {isSubmitting ? (
                            <Loader size={16} className="animate-spin" />
                          ) : editingMemo ? (
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
            {mode === 'direct' && (
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

                {/* 핵심 문장 수정 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">핵심 문장</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md min-h-12"
                    value={editFormData.key_sentence}
                    onChange={(e) => handleEditFormChange('key_sentence', e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">목적</label>
                  <div className="flex flex-wrap gap-2">
                    {['일반', '업무', '개인', '할일', '학습'].map((purpose) => (
                      <button
                        key={purpose}
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                          editFormData.purpose === purpose
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-teal-500'
                        }`}
                        onClick={() => handleEditFormChange('purpose', purpose)}
                      >
                        {purpose}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 트윗 내용 수정 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">트윗 내용</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md min-h-24"
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
                    <option value="역사">역사</option>
                    <option value="경영/경제">경영/경제</option>
                    <option value="언어">언어</option>
                    <option value="정치">정치</option>
                    <option value="사회">사회</option>
                    <option value="국제">국제</option>
                    <option value="과학/IT">과학/IT</option>
                    <option value="수학">수학</option>
                    <option value="기술/공학">기술/공학</option>
                    <option value="의학/건강">의학/건강</option>
                    <option value="예술/문화">예술/문화</option>
                    <option value="문학/창작">문학/창작</option>
                    <option value="개인">개인</option>
                    <option value="학습">학습</option>
                    <option value="업무">업무</option>
                  </select>
                </div>

                {/* 키워드 수정 */}
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
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader size={16} className="animate-spin" /> : '저장'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComposerModal;
