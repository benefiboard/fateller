import React, { useState, useEffect } from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';
import { Memo } from '../utils/types';

interface EditFormData {
  title: string;
  tweet_main: string;
  thread: string[];
  category: string;
  keywords: string[];
  key_sentence: string;
}

interface DirectEditFormProps {
  memo?: Memo;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (formData: EditFormData) => Promise<void>;
}

const DirectEditForm: React.FC<DirectEditFormProps> = ({ memo, isSubmitting, error, onSubmit }) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    tweet_main: '',
    thread: [''],
    category: '',
    keywords: [],
    key_sentence: '',
  });

  // 키워드 입력을 위한 별도의 상태
  const [keywordsInput, setKeywordsInput] = useState<string>('');

  // 메모가 제공되면 초기 데이터 설정
  useEffect(() => {
    if (memo) {
      setFormData({
        title: memo.title,
        tweet_main: memo.tweet_main,
        thread: [...memo.thread],
        category: memo.labeling.category,
        keywords: [...memo.labeling.keywords],
        key_sentence: memo.labeling.key_sentence,
      });
      setKeywordsInput(memo.labeling.keywords.join(', '));
    }
  }, [memo]);

  // 폼 필드 변경 처리 함수
  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 스레드 항목 변경 처리 함수
  const handleThreadItemChange = (index: number, value: string) => {
    const updatedThread = [...formData.thread];
    updatedThread[index] = value;
    setFormData((prev) => ({
      ...prev,
      thread: updatedThread,
    }));
  };

  // 스레드 항목 추가 함수
  const handleAddThreadItem = () => {
    setFormData((prev) => ({
      ...prev,
      thread: [...prev.thread, ''],
    }));
  };

  // 스레드 항목 삭제 함수
  const handleRemoveThreadItem = (index: number) => {
    if (formData.thread.length <= 1) return; // 최소한 하나는 유지

    const updatedThread = [...formData.thread];
    updatedThread.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      thread: updatedThread,
    }));
  };

  // 키워드 입력 처리 함수
  const handleKeywordsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordsInput(e.target.value);
  };

  // 제출 처리
  const handleSubmit = () => {
    if (isSubmitting) return;

    // 키워드 입력을 배열로 변환
    const keywordArray = keywordsInput
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    onSubmit({
      ...formData,
      keywords: keywordArray,
    });
  };

  return (
    <div className="space-y-4">
      {/* 제목 수정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.title}
          onChange={(e) => handleFormChange('title', e.target.value)}
        />
      </div>

      {/* 핵심 문장 수정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">핵심 문장</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md min-h-12"
          value={formData.key_sentence}
          onChange={(e) => handleFormChange('key_sentence', e.target.value)}
        ></textarea>
      </div>

      {/* 트윗 내용 수정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">트윗 내용</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md min-h-12"
          value={formData.tweet_main}
          onChange={(e) => handleFormChange('tweet_main', e.target.value)}
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

        {formData.thread.map((item, index) => (
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
              disabled={formData.thread.length <= 1}
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
          value={formData.category}
          onChange={(e) => handleFormChange('category', e.target.value)}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">키워드 (쉼표로 구분)</label>
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
            isSubmitting ? 'bg-teal-300 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'
          }`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader size={16} className="animate-spin" /> : '저장'}
        </button>
      </div>
    </div>
  );
};

export default DirectEditForm;
