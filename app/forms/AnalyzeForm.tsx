import React, { useState } from 'react';
import { Image, Video, Loader, AlertCircle } from 'lucide-react';

interface AnalyzeFormProps {
  initialText?: string;
  profileAvatar: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (text: string) => Promise<void>;
  maxLength?: number;
}

const AnalyzeForm: React.FC<AnalyzeFormProps> = ({
  initialText = '',
  profileAvatar,
  isSubmitting,
  error,
  onSubmit,
  maxLength = 10000,
}) => {
  // 입력 상태
  const [inputText, setInputText] = useState(initialText);
  const [characterCount, setCharacterCount] = useState(initialText.length);

  // 입력 텍스트 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setCharacterCount(text.length);
  };

  // 제출 처리
  const handleSubmit = () => {
    if (!inputText.trim() || isSubmitting || characterCount > maxLength) return;
    onSubmit(inputText);
  };

  // 키보드 단축키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter 또는 Cmd+Enter로 제출
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex">
      <div className="mr-[6px]">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          <img src={profileAvatar} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex-1">
        <textarea
          className="w-full border-0 focus:ring-0 focus:outline-none resize-none p-2 min-h-24"
          placeholder="분석할 내용을 입력하세요..."
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
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
                  characterCount > maxLength ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {characterCount}/{maxLength}
              </div>
              <button
                className={`rounded-full px-4 py-1 text-white font-bold ${
                  !inputText.trim() || isSubmitting || characterCount > maxLength
                    ? 'bg-teal-300 cursor-not-allowed'
                    : 'bg-teal-500 hover:bg-teal-600'
                }`}
                onClick={handleSubmit}
                disabled={!inputText.trim() || isSubmitting || characterCount > maxLength}
              >
                {isSubmitting ? (
                  <Loader size={16} className="animate-spin" />
                ) : initialText ? (
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
  );
};

export default AnalyzeForm;
