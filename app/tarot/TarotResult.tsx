// components/TarotResult.tsx
'use client';

import React, { useState } from 'react';
import { CircleCheckBig, Plus, Star } from 'lucide-react';
import { SelectedCard } from './types/tarot';
import Image from 'next/image';

interface TarotResultProps {
  selectedCards: SelectedCard[];
  analyzedImageUrl?: string | null;
  filterType?: string;
}

const TarotResult = ({ selectedCards, analyzedImageUrl, filterType }: TarotResultProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // 별점 렌더링 헬퍼 함수
  const renderStars = (score: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ));
  };

  // 운세 유형별 카드 찾기
  const getCardByType = (type: string) => {
    return selectedCards.find((card) => card.type === type);
  };

  return (
    <div className=" flex flex-col bg-white pb-8">
      {/* 메시지 영역 */}
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">당신의 하루는 어떨까요?</h2>
        <p className="text-gray-600 text-center mt-1 text-sm">
          오늘의 사진과 선택하신 카드를 바탕으로 한 분석결과입니다.
        </p>
      </div>
      {/* <p>오늘의 사진과 선택하신 카드를 바탕으로 한 분석결과입니다.</p> */}
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

      {/* 카드별 결과 */}
      <div className="space-y-4">
        {['애정운', '재물운', '직업운'].map((type) => {
          const card = getCardByType(type);
          if (!card) return null;

          const isExpanded = expandedCard === card.id;

          return (
            <div
              key={type}
              className={`
                mx-4 p-4 rounded-xl border transition-all
                ${isExpanded ? '' : 'bg-white'}
              `}
            >
              <div className="flex gap-4">
                {/* 카드 이미지 */}
                <div className="w-28 shrink-0">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden">
                    <div className="relative w-full h-full">
                      <Image
                        src={card.imageUrl}
                        alt={card.name.ko}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 카드 정보 */}
                {card.selectedInterpretation && (
                  <div className="flex-1 tracking-tighter">
                    <h3 className="text-lg font-medium">{type}</h3>
                    {/* <div className="flex items-center gap-1 my-1">
                    {renderStars(card.defaultScore)}
                  </div> */}
                    <p className="text-sm">{card.name.en}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {card.selectedInterpretation.message}
                    </p>
                    <hr className="my-2"></hr>
                    <div className="flex flex-wrap gap-1 ">
                      {card.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className=" rounded-full text-xs tracking-tighter font-semibold text-violet-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full flex items-center justify-center mt-4 pb-2 border-b gap-1">
                <Plus
                  className="w-4 h-4 text-gray-600"
                  onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                />
                <p
                  className=" text-gray-600 text-xs tracking-tighter font-bold  "
                  onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                >
                  자세히 보기
                </p>
              </div>

              {/* 확장된 내용 */}
              {isExpanded && card.selectedInterpretation && (
                <div className="space-y-4">
                  {card.selectedInterpretation.advice && (
                    <div className="bg-white p-4  rounded-lg tracking-tighter">
                      {/* <p className="text-lg font-medium text-gray-900">조언</p> */}
                      <div className="mt-2 space-y-2 text-gray-600 tracking-tighter text-base">
                        {card.selectedInterpretation.advice
                          .split('.')
                          .filter((text) => text.trim())
                          .map(
                            (text, index) =>
                              text.trim() && (
                                <div key={index} className="flex">
                                  <span className="w-4 flex-shrink-0 text-sm flex ">
                                    <CircleCheckBig className="w-3 h-3 mt-1" />
                                  </span>
                                  <span className="flex-1">{text.trim()}.</span>
                                </div>
                              )
                          )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TarotResult;
