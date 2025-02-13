'use client';

import React, { useState } from 'react';
import { CircleCheckBig, Plus } from 'lucide-react';
import { SelectedSingleCardGPT } from './types/tarot';

interface TarotResultSingleGPTProps {
  selectedCard: SelectedSingleCardGPT;
  title?: string;
  subtitle?: string;
  analyzedImageUrl?: string | null;
  filterType?: string;
  userName?: string;
}

const TarotResultSingleGPT = ({
  selectedCard,
  title = '당신의 운세는 어떨까요?',
  subtitle = '선택하신 카드를 바탕으로 한 분석결과입니다.',
  analyzedImageUrl,
  filterType,
  userName,
}: TarotResultSingleGPTProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="flex flex-col bg-white pb-8">
      {/* 메시지 영역 */}
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">{title}</h2>
        <p className="text-gray-600 text-center mt-1 text-sm">{subtitle}</p>
      </div>

      {analyzedImageUrl && (
        <div className="flex justify-center items-center mb-4">
          <div
            className={`border-2 border-violet-400 w-32 h-32 rounded-full overflow-hidden ${
              filterType !== 'none' ? `filter-${filterType}` : ''
            }`}
          >
            <img
              src={analyzedImageUrl}
              alt="Analyzed face"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      )}

      {/* 카드 결과 */}
      <div className="mx-4 p-4 rounded-xl border transition-all">
        <div className="flex gap-4">
          {/* 카드 이미지 */}
          <div className="w-28 shrink-0">
            <div className="aspect-[3/4] rounded-lg overflow-hidden">
              <img
                src={selectedCard.imageUrl}
                alt={selectedCard.name.ko}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 카드 정보 */}
          <div className="flex-1 tracking-tighter">
            <h3 className="text-lg font-medium">{selectedCard.type}</h3>
            <p className="text-sm">{selectedCard.name.en}</p>
            <p className="text-sm text-gray-600 mt-2">
              {selectedCard.gptInterpretation.currentSituation}
            </p>
            <hr className="my-2" />
            <div className="flex flex-wrap gap-1">
              {selectedCard.keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="rounded-full text-xs font-semibold text-violet-600 tracking-tighter"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center mt-4 pb-2 border-b gap-1">
          <Plus className="w-4 h-4 text-gray-600" onClick={() => setIsExpanded(!isExpanded)} />
          <p
            className="text-gray-600 text-xs tracking-tighter font-bold"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            자세히 보기
          </p>
        </div>

        {/* 확장된 내용 */}
        {isExpanded && (
          <div className="space-y-4 mt-4">
            {/* 조언 섹션 */}
            <div className="bg-white p-4 rounded-lg tracking-tighter">
              <p className="text-lg font-medium text-gray-900">조언</p>
              <div className="mt-2 space-y-2 text-gray-600 tracking-tighter text-base">
                {selectedCard.gptInterpretation.advice
                  .split('.')
                  .filter((text) => text.trim())
                  .map(
                    (text, index) =>
                      text.trim() && (
                        <div key={index} className="flex">
                          <span className="w-4 flex-shrink-0 text-sm flex">
                            <CircleCheckBig className="w-3 h-3 mt-1" />
                          </span>
                          <span className="flex-1">{text.trim()}.</span>
                        </div>
                      )
                  )}
              </div>
            </div>

            {/* 조언 섹션 */}
            <div className="bg-white p-4 pt-2 rounded-lg tracking-tighter">
              <p className="text-sm font-medium text-gray-900">조언</p>
              <p className="text-sm text-gray-600 mt-1">{selectedCard.gptInterpretation.advice}</p>
            </div>

            {/* 현재상황 */}
            <div className="bg-white p-4 pt-2 rounded-lg tracking-tighter">
              <p className="text-sm font-medium text-gray-900">현재상황</p>
              <p className="text-sm text-gray-600 mt-1">
                {selectedCard.gptInterpretation.currentSituation}
              </p>
            </div>

            {/* 미래 전망 섹션 */}
            <div className="bg-white p-4 pt-2 rounded-lg tracking-tighter">
              <p className="text-sm font-medium text-gray-900">미래 전망</p>
              <p className="text-sm text-gray-600 mt-1">{selectedCard.gptInterpretation.future}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TarotResultSingleGPT;
