'use client';

import React, { useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { SelectedSingleCard } from './types/tarot';

interface TarotResultSingleProps {
  selectedCard: SelectedSingleCard;
  title?: string;
  subtitle?: string;
}

const TarotResultSingle = ({
  selectedCard,
  title = '당신의 운세는 어떨까요?',
  subtitle = '선택하신 카드를 바탕으로 한 분석결과입니다.',
}: TarotResultSingleProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  return (
    <div className="flex flex-col bg-white pb-8">
      {/* 메시지 영역 */}
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">{title}</h2>
        <p className="text-gray-600 text-center mt-1 text-sm">{subtitle}</p>
      </div>

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
          {selectedCard.selectedInterpretation && (
            <div className="flex-1 tracking-tighter">
              <h3 className="text-lg font-medium">{selectedCard.type}</h3>
              <p className="text-sm">{selectedCard.name.en}</p>
              <p className="text-sm text-gray-600 mt-2">
                {selectedCard.selectedInterpretation.message}
              </p>
              <hr className="my-2" />
              <div className="flex flex-wrap gap-1">
                {selectedCard.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className=" rounded-full text-xs font-semibold text-violet-600 tracking-tighter"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
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
        {/* 확장된 내용 */}
        {isExpanded && selectedCard.selectedInterpretation && (
          <div className="space-y-4 mt-4">
            {/* 기존 조언 섹션 */}
            {selectedCard.selectedInterpretation.advice && (
              <div className="bg-white p-4 pt-2 rounded-lg tracking-tighter">
                <p className="text-sm font-medium text-gray-900">조언</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCard.selectedInterpretation.advice}
                </p>
              </div>
            )}

            {/* 타이밍 & 액션 아이템 섹션 */}
            {selectedCard.selectedInterpretation.timing && (
              <div className="bg-white p-4 pt-2 rounded-lg tracking-tighter">
                <p className="text-sm font-medium text-gray-900">추천하는 시기와 장소</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="text-violet-600">시기:</span>{' '}
                    {selectedCard.selectedInterpretation.timing.timing}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="text-violet-600">추천 장소:</span>{' '}
                    {selectedCard.selectedInterpretation.timing.place}
                  </p>
                </div>

                {selectedCard.selectedInterpretation.timing.actionItems && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">추천하는 행동</p>
                    <ul className="mt-2 space-y-2">
                      {selectedCard.selectedInterpretation.timing.actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-violet-400 rounded-full shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 긍정적 자기 암시 섹션 */}
            {selectedCard.selectedInterpretation.affirmation && (
              <div className="bg-white p-4 pt-2 rounded-lg tracking-tighter">
                <p className="text-sm font-medium text-gray-900">오늘의 긍정 메시지</p>
                <p className="text-sm text-gray-600 mt-1 italic">
                  "{selectedCard.selectedInterpretation.affirmation.message}"
                </p>
              </div>
            )}

            {/* 성공률 섹션 */}
            {selectedCard.selectedInterpretation.successRate && (
              <div className="bg-white p-4 pt-2 rounded-lg tracking-tighter">
                <p className="text-sm text-violet-600 font-medium">
                  {selectedCard.selectedInterpretation.successRate}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TarotResultSingle;
