// app/components/StartSelection.tsx
import { Rocket, ScanFace, Star } from 'lucide-react';
import React from 'react';

interface StartSelectionProps {
  onSelectMode: (mode: 'face' | 'quick') => void;
  category?: string; // 카테고리 이름
  title: string;
  subtitle?: string; // 선택적 부제목
}

const StartSelection = ({ onSelectMode, title, subtitle, category }: StartSelectionProps) => {
  return (
    <div className=" flex flex-col bg-white tracking-tighter">
      {/* 메시지 영역 */}
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">{title}</h2>
        {subtitle && <p className="text-gray-600 text-center mt-1 text-sm">{subtitle}</p>}
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-6">
        <div
          className="w-full flex flex-col items-center justify-center "
          onClick={() => onSelectMode('face')}
        >
          <div className="w-full aspect-[2/1]  flex items-center justify-center gap-2 text-violet-600  tracking-tighter border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-violet-200 rounded-xl shadow-lg">
            <ScanFace className="w-20 h-20 " />
            <p className="text-sm  text-gray-600 w-36">
              <span className="text-violet-600 text-2xl font-semibold">얼굴+{category}</span>로 분석
            </p>
          </div>
        </div>

        <div className="w-full grid grid-cols-10 items-center">
          <hr className="col-span-4 w-full border-1 border-gray-300" />
          <p className="col-span-2 text-center  text-lg">or</p>
          <hr className="col-span-4 w-full border-1 border-gray-300" />
        </div>

        <div
          className="w-full flex flex-col items-center justify-center "
          onClick={() => onSelectMode('quick')}
        >
          <div className="w-full aspect-[2/1] flex items-center justify-center gap-2 text-violet-600  tracking-tighter border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-violet-200 rounded-xl shadow-lg">
            <Rocket className="w-20 h-20 " />
            <p className="text-sm  text-gray-600 w-36">
              <span className="text-violet-600 text-2xl font-semibold">{category}</span>로 빠른
              시작하기
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSelection;
