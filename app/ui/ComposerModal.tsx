//app/memo/ui/ComposerModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Image, Video, Loader, AlertCircle } from 'lucide-react';
import { Memo } from '../utils/types';
import LoadingModal from './LoadingModal';
import AlertModal from './AlertModal';

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
  } | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  // 직접 수정 폼 데이터
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

  // 키워드 입력을 위한 별도의 상태
  const [keywordsInput, setKeywordsInput] = useState<string>('');

  // 오류 알람
  const [showExtractionAlert, setShowExtractionAlert] = useState(false);
  const [extractionAlertMessage, setExtractionAlertMessage] = useState('');
  const [isUrlExtracting, setIsUrlExtracting] = useState(false);

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
        });
        setKeywordsInput(editingMemo.labeling.keywords.join(', '));
      } else {
        // AI 분석 모드일 때
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
    });
    setKeywordsInput('');
    setProcessingStep('idle');
    setExtractedData(null);
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
    };

    // 알림 메시지 생성
    const stepText = processingStep === 'extracting' ? '추출' : '분석';
    const alertMessage = `${stepText} 작업을 백그라운드에서 계속 진행합니다.`;

    console.log('알림 메시지:', alertMessage);

    // 모달 닫기 및 백그라운드 처리 시작
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
          // 이미 추출 중이면 중복 요청 방지
          if (isUrlExtracting) {
            console.log('이미 URL 추출 중입니다, 중복 요청 방지');
            return;
          }

          setIsUrlExtracting(true);
          try {
            const extractResponse = await fetch('/api/extract-and-analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: inputText.trim() }),
            });

            // 디버깅을 위한 로그 추가
            console.log('추출 응답 상태:', extractResponse.status);
            const contentType = extractResponse.headers.get('content-type');
            console.log('응답 콘텐츠 타입:', contentType);

            // 추출 API 응답 처리 개선 (에러 처리 강화)
            if (!extractResponse.ok) {
              let errorData;
              try {
                errorData = await extractResponse.json();
                console.log('추출 API 에러 데이터:', errorData);
              } catch (e) {
                console.error('에러 응답 파싱 실패:', e);
                errorData = { error: '콘텐츠 추출 중 오류가 발생했습니다.' };
              }

              // 알림 메시지 설정 및 로깅
              const errorMessage =
                errorData.error ||
                `URL(${inputText.trim()})에서 콘텐츠를 추출할 수 없습니다. 직접 내용을 복사하여 붙여넣어 주세요.`;

              console.log('알림 메시지 설정:', errorMessage);

              // 모달 내 알림 표시 (명시적으로 상태 설정)
              setShowExtractionAlert(true);
              setExtractionAlertMessage(errorMessage);
              console.log('알림 모달 표시 요청됨:', errorMessage);

              setProcessingStep('idle');
              setIsSubmitting(false);
              return;
            }

            const extractData = await extractResponse.json();

            // 추출 데이터 유효성 검사 강화
            if (
              !extractData.content ||
              extractData.content.trim().length < 200 ||
              (extractData.title &&
                (extractData.title.toLowerCase().includes('access denied') ||
                  extractData.title.toLowerCase().includes('error')))
            ) {
              const errorMessage = `URL(${inputText.trim()})에서 유효한 콘텐츠를 찾을 수 없습니다. 직접 내용을 복사하여 붙여넣어 주세요.`;
              console.error('유효하지 않은 콘텐츠:', errorMessage);

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
            });

            // 분석 단계로 변경
            setProcessingStep('analyzing');

            // 백그라운드 처리를 위한 데이터 준비
            const processData = {
              text: extractData.content,
              originalUrl: inputText.trim(),
              mode: 'analyze',
              id: editingMemo?.id,
              isUrl: extractData.isExtracted,
              sourceUrl: extractData.isExtracted ? extractData.sourceUrl : null,
              originalTitle: extractData.title || '',
              originalImage: extractData.imageUrl || extractData.thumbnailUrl || '',
              currentStep: 'analyzing' as ProcessingStep,
              isOngoing: false, // 새로운 요청임을 표시
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
            console.error('추출 과정 예외 발생:', error);

            // 에러 메시지 추출
            let errorMessage = '알 수 없는 오류가 발생했습니다';
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }

            setShowExtractionAlert(true);
            setExtractionAlertMessage(
              `오류가 발생했습니다: ${errorMessage}. 직접 내용을 복사하여 붙여넣어 주세요.`
            );
            setProcessingStep('idle');
            setIsSubmitting(false);
            return;
          } finally {
            // 성공 또는 실패와 관계없이 플래그 해제
            setIsUrlExtracting(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* 로딩 모달 추가 */}
      <LoadingModal
        isOpen={isSubmitting}
        step={processingStep === 'extracting' ? 'extracting' : 'analyzing'}
        extractedData={extractedData || undefined}
        onContinueInBackground={handleContinueInBackground} // 단계에 관계없이 항상 전달
      />

      {/* 오류 렌더링 부분 내에 추가 */}
      <AlertModal
        isOpen={showExtractionAlert}
        title="콘텐츠 추출 실패"
        message={
          <>
            <p>{extractionAlertMessage}</p>
            {inputText && inputText.startsWith('http') && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                <code>{inputText}</code>
              </div>
            )}
          </>
        }
        onConfirm={() => setShowExtractionAlert(false)}
      />

      {/* 기존 모달 내용 - isSubmitting이 아닐 때만 표시 */}
      {!isSubmitting && (
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center">
            <button onClick={onClose} className="text-teal-500">
              <X size={20} />
            </button>
            <span className="font-semibold">
              {editingMemo
                ? mode === 'direct'
                  ? '메모 직접 수정'
                  : '메모 재분석'
                : '새 메모 작성'}
            </span>
            <div className="w-5"></div>
          </div>

          <div className="p-4">
            {/* AI 분석 모드 UI */}
            {mode === 'analyze' && (
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

                {/* 트윗 내용 수정 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">트윗 내용</label>
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

                {/* 핵심 문장 수정 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">핵심 문장</label>
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
