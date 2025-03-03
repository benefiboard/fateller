//app/memo/ui/ComposerModal.tsx

import React, { useState, useEffect } from 'react';
import { X, Image, Video, Loader, AlertCircle } from 'lucide-react';
import { Memo } from '../utils/types';

interface ComposerModalProps {
  isOpen: boolean;
  mode: 'direct' | 'analyze';
  editingMemo?: Memo;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  profile: {
    avatar: string;
  };
}

const ComposerModal: React.FC<ComposerModalProps> = ({
  isOpen,
  mode,
  editingMemo,
  onClose,
  onSubmit,
  profile,
}) => {
  // 입력 상태
  const [inputText, setInputText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 제출 처리
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'direct') {
        // 직접 수정 모드 (기존 코드 유지)
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
      } else {
        // AI 분석 모드
        if (!inputText.trim()) {
          throw new Error('내용을 입력해주세요');
        }

        // 1단계: URL 확인 및 콘텐츠 추출
        const extractResponse = await fetch('/api/extract-and-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText.trim() }),
        });

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json();
          throw new Error(errorData.error || '추출 중 오류가 발생했습니다');
        }

        const extractData = await extractResponse.json();
        const textToAnalyze = extractData.content;

        // URL 추출 성공 메시지 표시 (선택 사항)
        if (extractData.isExtracted) {
          // URL에서 추출 성공 시 알림 (선택 사항)
          console.log('URL에서 콘텐츠 추출 성공:', extractData.sourceUrl);
        }

        // 2단계: 추출된 콘텐츠로 메모 생성 (기존 방식 그대로)
        await onSubmit({
          text: textToAnalyze,
          mode: 'analyze',
          id: editingMemo?.id,
          isUrl: extractData.isExtracted, // 추가: URL에서 추출된 것인지 여부
          sourceUrl: extractData.sourceUrl, // 추가: 원본 URL
        });
      }

      onClose();
    } catch (error: any) {
      setError(`오류가 발생했습니다: ${error.message}`);
    } finally {
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
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-3 border-b flex justify-between items-center">
          <button onClick={onClose} className="text-teal-500">
            <X size={20} />
          </button>
          <span className="font-semibold">
            {editingMemo ? (mode === 'direct' ? '메모 직접 수정' : '메모 재분석') : '새 메모 작성'}
          </span>
          <div className="w-5"></div>
        </div>

        <div className="p-4">
          {/* AI 분석 모드 UI */}
          {mode === 'analyze' && (
            <div className="flex">
              <div className="mr-[6px]">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
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
    </div>
  );
};

export default ComposerModal;
