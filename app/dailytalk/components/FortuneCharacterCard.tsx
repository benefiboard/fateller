//app>dailytalk>components>FortuneCard.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ShareButtons } from '@/app/layout-component/ShareButtons';
import {
  CardType,
  FORTUNE_CARD_LABELS,
  FORTUNE_CARD_TYPES,
  FortuneCardData,
  FortuneLevel,
  FortuneResultType,
} from '../data/types';
import { NavigationButton } from '@/app/layout-component/CarouselCard/NavigationButton';
import { cardVariants } from '@/app/layout-component/CarouselCard/animationVariants';
import { AnimatedCard } from '@/app/layout-component/CarouselCard/AnimatedCard';

export const FortuneCharacterCard = ({
  fortuneData,
  onSave,
}: {
  fortuneData: FortuneResultType;
  onSave: (imageUrl: string, description: string) => void;
}) => {
  const [currentType, setCurrentType] = useState<CardType>('character');
  const [direction, setDirection] = useState(0);

  const { comprehensive_solution_summary } = fortuneData.fortune_content;
  const fortuneLevel: FortuneLevel =
    comprehensive_solution_summary.fortune_score >= 81
      ? 'positive'
      : comprehensive_solution_summary.fortune_score >= 61
      ? 'neutral'
      : 'negative';

  const getCurrentCardData = (): FortuneCardData => {
    if (currentType === 'character') {
      return {
        title: '데일리 운세 캐릭터',
        image: comprehensive_solution_summary.background_image_url,
        description: comprehensive_solution_summary.content,
        score: comprehensive_solution_summary.fortune_score,
      };
    }

    // 저장된 fortune_cards 사용
    if (comprehensive_solution_summary.fortune_cards) {
      const savedCard =
        comprehensive_solution_summary.fortune_cards[currentType as Exclude<CardType, 'character'>];
      if (savedCard) {
        return savedCard;
      }
    }

    // 이 부분은 실제로는 실행되지 않아야 하지만, 타입 안전성을 위해 유지
    return {
      title: FORTUNE_CARD_LABELS[currentType],
      description: '카드 정보를 불러올 수 없습니다.',
      image: '',
    };
  };

  const handleCardChange = (newDirection: number) => {
    setDirection(newDirection);
    const currentIndex = FORTUNE_CARD_TYPES.indexOf(currentType);
    let newIndex = currentIndex + newDirection;

    if (newIndex < 0) newIndex = FORTUNE_CARD_TYPES.length - 1;
    if (newIndex >= FORTUNE_CARD_TYPES.length) newIndex = 0;

    setCurrentType(FORTUNE_CARD_TYPES[newIndex]);
  };

  const getFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/);
    return match ? match[0] : text;
  };

  const currentCard = getCurrentCardData();

  return (
    <Card className="border-brand-100 overflow-hidden">
      <CardContent className="pt-6 space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <h2 className="text-2xl font-bold text-gradient-brand">
              {FORTUNE_CARD_LABELS[currentType]}
            </h2>
            <Sparkles className="absolute -top-2 -right-6 w-5 h-5 text-brand-400" />
          </div>
          <p className="text-sm text-gray-500">
            {currentType === 'character'
              ? '당신의 오늘 하루는? 스와이프 고고 스크롤 고고'
              : ' 스와이프 고고 스크롤 고고'}
          </p>
        </div>

        {/* 카드 네비게이션과 포토카드 */}
        <div className="relative">
          <NavigationButton direction="left" offset="left-0" onClick={() => handleCardChange(-1)} />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <AnimatedCard
              key={currentType}
              direction={direction}
              variants={cardVariants}
              onDragEnd={(e, info) => {
                const swipe = Math.abs(info.offset.x) * info.velocity.x;
                if (swipe < -100) handleCardChange(1);
                else if (swipe > 100) handleCardChange(-1);
              }}
              className="w-full max-w-[400px] mx-auto px-4"
            >
              <div
                id="daily-care-card"
                className="aspect-[10/16] w-full rounded-3xl overflow-hidden relative bg-gradient-to-br from-brand-50 to-pastel-50"
              >
                {/* 이미지 배경 */}
                <div className="absolute inset-0">
                  {currentCard.image && (
                    <img
                      src={currentCard.image}
                      alt={currentCard.title}
                      className={`w-full h-full object-cover ${
                        currentType === 'crystal' ? 'opacity-75' : ''
                      }`}
                    />
                  )}
                  {/* <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      currentType === 'crystal'
                        ? 'from-brand-600/40 via-transparent to-brand-600/20'
                        : 'from-brand-600/70 via-transparent to-brand-600/30'
                    }`}
                  /> */}
                </div>

                {/* 상단 포인트 */}
                <div className="relative z-10 p-4 flex flex-col items-start">
                  <p className="p-2 px-6 bg-white/80 text-brand-600 rounded-full text-sm font-bold shadow-sm tracking-tighter">
                    {currentType === 'character'
                      ? comprehensive_solution_summary.background_image_description
                      : currentCard.title}
                  </p>
                </div>

                {/* 크리스탈 카드의 행운의 숫자와 색상 표시 */}
                {/* 크리스탈 카드의 행운의 숫자와 색상 표시 */}
                {currentType === 'crystal' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center animate-none ">
                    {/* 3D 크리스탈 SVG */}
                    <div className="relative w-48 h-48">
                      <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full absolute "
                        style={{
                          filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
                        }}
                      >
                        {/* 메인 크리스탈 구조 */}
                        <g transform="translate(100 100)">
                          {/* 왼쪽 면 */}
                          <path
                            d="M-40,-60 L-60,0 L-40,60 L0,40 L0,-40 Z"
                            fill={`${comprehensive_solution_summary.lucky_color.hex}90`}
                            className="crystal-face"
                          />
                          {/* 오른쪽 면 */}
                          <path
                            d="M40,-60 L60,0 L40,60 L0,40 L0,-40 Z"
                            fill={`${comprehensive_solution_summary.lucky_color.hex}70`}
                            className="crystal-face"
                          />
                          {/* 상단 면 */}
                          <path
                            d="M-40,-60 L0,-80 L40,-60 L0,-40 Z"
                            fill={`${comprehensive_solution_summary.lucky_color.hex}50`}
                            className="crystal-face"
                          />
                          {/* 하단 면 */}
                          <path
                            d="M-40,60 L0,80 L40,60 L0,40 Z"
                            fill={`${comprehensive_solution_summary.lucky_color.hex}60`}
                            className="crystal-face"
                          />
                          {/* 빛나는 하이라이트 */}
                          <path
                            d="M-10,-50 L10,-50 L5,-20 L-5,-20 Z"
                            fill="rgba(255,255,255,0.4)"
                            className="crystal-highlight"
                          />
                        </g>
                      </svg>

                      {/* 행운의 숫자 */}
                      <div className="absolute inset-0 flex items-center justify-center ">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            background: `${comprehensive_solution_summary.lucky_color.hex}90`,
                            boxShadow: `0 0 20px ${comprehensive_solution_summary.lucky_color.hex}`,
                          }}
                        >
                          <span className="text-4xl font-bold text-white drop-shadow-glow">
                            {comprehensive_solution_summary.lucky_number}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <style jsx>{`
                  .crystal-face {
                    stroke: rgba(255, 255, 255, 0.3);
                    stroke-width: 1;
                  }
                  .crystal-highlight {
                    opacity: 0.7;
                  }
                  .drop-shadow-glow {
                    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
                  }
                `}</style>

                {/* 하단 설명 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col gap-1">
                  {currentType === 'character' && (
                    <div className="flex items-end gap-1">
                      <div className="bg-gray-50/50 p-2 rounded-full h-16 w-16 flex items-center justify-center border-4 border-white/75">
                        <h3 className="text-2xl font-bold tracking-tighter text-violet-600">
                          {comprehensive_solution_summary.fortune_score}
                        </h3>
                      </div>
                      <h3 className="text-lg font-bold text-white/75 tracking-tighter">
                        : today point
                      </h3>
                    </div>
                  )}

                  {/* 타임 영역 */}
                  {'timeRange' in currentCard && (
                    <div className="bg-white/20 p-2 rounded-xl mb-2 text-white text-sm text-center">
                      {currentCard.timeRange}
                    </div>
                  )}
                  <p className="text-white tracking-tight text-sm bg-brand-600/60 p-2 rounded-xl backdrop-blur-sm whitespace-pre-line">
                    {currentType === 'character'
                      ? getFirstSentence(currentCard.description)
                      : currentCard.description}
                  </p>
                  <p className="text-xs mt-2 text-center text-white">
                    {new Date().toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </AnimatedCard>
          </AnimatePresence>

          <NavigationButton
            direction="right"
            offset="right-0"
            onClick={() => handleCardChange(1)}
          />
        </div>

        {/* 카드 타입 인디케이터 */}
        <div className="flex justify-center gap-2">
          {FORTUNE_CARD_TYPES.map((type) => (
            <div
              key={type}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentType === type ? 'bg-brand-400' : 'bg-brand-100'
              }`}
            />
          ))}
        </div>

        {/* 공유 버튼 */}
        <div className="flex justify-center mx-4">
          <ShareButtons
            targetElementId="daily-care-card"
            title={`${FORTUNE_CARD_LABELS[currentType]} - ${
              currentType === 'character'
                ? comprehensive_solution_summary.background_image_description
                : currentCard.title
            }`}
            content={
              currentType === 'character'
                ? getFirstSentence(currentCard.description)
                : currentCard.description
            }
            fileName="daily-care"
            className="w-full"
            isReady={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};
