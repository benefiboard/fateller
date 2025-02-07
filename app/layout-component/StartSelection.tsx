// app/components/StartSelection.tsx
import React from 'react';

interface StartSelectionProps {
  onSelectMode: (mode: 'face' | 'quick') => void;
  title: string;
  subtitle?: string; // 선택적 부제목
}

const StartSelection = ({ onSelectMode, title, subtitle }: StartSelectionProps) => {
  return (
    <div className=" flex flex-col bg-white tracking-tighter">
      {/* 메시지 영역 */}
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">{title}</h2>
        {subtitle && <p className="text-gray-600 text-center mt-1 text-sm">{subtitle}</p>}
      </div>

      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="w-full flex flex-col items-center justify-center ">
          <div className="w-full aspect-[2/1] bg-red-200"></div>
          <button
            onClick={() => onSelectMode('face')}
            className="w-full max-w-sm p-4 bg-violet-600 text-white rounded-lg shadow-md"
          >
            얼굴 + 사주 분석으로 시작하기
          </button>
        </div>
        <hr className="w-full border-1 border-gray-300" />
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full aspect-[2/1] bg-red-200"></div>
          <button
            onClick={() => onSelectMode('quick')}
            className="w-full max-w-sm p-4 bg-violet-600 text-white rounded-lg shadow-md"
          >
            사주로 빠른 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartSelection;
