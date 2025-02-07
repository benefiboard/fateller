'use client';

import React, { useState, useEffect } from 'react';
import { FortuneType, SelectedCard, TarotCard } from './types/tarot';
import { getRandomInterpretation, TAROT_CARDS } from './data/tarotCards';

interface TarotCardGridProps {
  onComplete: (selectedCards: SelectedCard[]) => void;
  analyzedImageUrl?: string | null;
  filterType?: string;
}

interface CardItemProps {
  card: TarotCard;
  isSelected: boolean;
  onClick: () => void;
}

const shuffleCards = (array: TarotCard[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TarotCardGrid = ({ onComplete, analyzedImageUrl, filterType }: TarotCardGridProps) => {
  const [currentType, setCurrentType] = useState<FortuneType>('애정운');
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [shuffledCards, setShuffledCards] = useState<TarotCard[]>([]);

  useEffect(() => {
    setShuffledCards(shuffleCards(TAROT_CARDS));
  }, []);

  const handleCardClick = (card: TarotCard) => {
    if (selectedCards.some((selected) => selected.id === card.id)) return;

    const selectedCard: SelectedCard = {
      ...card,
      type: currentType,
      selected: true,
      flipped: true,
      selectedInterpretation: getRandomInterpretation(card, currentType),
    };

    const newSelectedCards = [...selectedCards, selectedCard];

    // currentType을 먼저 업데이트
    let nextType = currentType;
    if (currentType === '애정운') {
      nextType = '재물운';
    } else if (currentType === '재물운') {
      nextType = '사업 및 직장운';
    }

    // 두 state를 동시에 업데이트
    setSelectedCards(newSelectedCards);
    setCurrentType(nextType);
  };

  const renderCardRow = (startIndex: number, endIndex: number) => {
    const cards = shuffledCards.slice(startIndex, endIndex);
    return (
      <div className="w-full flex justify-center mb-2">
        <div className="flex justify-center">
          {cards.map((card, index) => {
            const isSelected = selectedCards.some((selected) => selected.id === card.id);
            return (
              <div
                key={card.id}
                className="first:ml-0"
                style={{
                  marginLeft: index === 0 ? '0' : '-88px',
                  position: 'relative',
                }}
              >
                <div
                  onClick={!isSelected ? () => handleCardClick(card) : undefined}
                  className={`
                    rotate-6
                    w-16 aspect-[2/3] rounded-lg cursor-pointer
                    border border-white/20
                    shadow-[4px_4px_10px_rgba(0,0,0,0.1)]
                    transition-all duration-300
                    hover:translate-y-[-4px]
                    hover:shadow-[4px_8px_12px_rgba(0,0,0,0.2)]
                    ${isSelected ? 'opacity-90 ' : ''}
                  `}
                >
                  {isSelected ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name.ko}
                      className="w-full h-full object-cover rounded-lg "
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-lg flex items-center justify-center">
                      <div className="text-yellow-300 text-lg">✧</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getMessage = () => {
    switch (currentType) {
      case '애정운':
        return '애정운';
      case '재물운':
        return '재물운';
      case '사업 및 직장운':
        return '사업 및 직장운';
    }
  };

  if (shuffledCards.length === 0) {
    return <div className="p-4 text-center">카드를 준비중입니다...</div>;
  }

  console.log('ft : ', filterType);

  return (
    <div className=" flex flex-col bg-white pb-8">
      {/* 메시지 영역 */}
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">당신의 하루는 어떨까요?</h2>
        <p className="text-gray-600 text-center mt-1 text-sm">
          당신의 <span className="font-bold text-lg text-violet-600">{getMessage()}</span>을 알려줄
          카드를 선택하세요.
        </p>
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

      {/* 카드 선택 영역 - 상단 50% */}
      <div className=" w-full flex flex-col justify-center py-4">
        {renderCardRow(0, 11)}
        {renderCardRow(11, 22)}
      </div>

      {/* 선택된 카드 표시 영역 - 하단 50% */}
      <div className=" w-full">
        <div className="grid grid-cols-3 gap-8 w-full h-full p-8">
          {['애정운', '재물운', '사업 및 직장운'].map((type) => {
            const card = selectedCards.find((c) => c.type === type);
            return (
              <div key={type} className="flex flex-col items-center tracking-tighter">
                <div className="text-xs font-bold mb-2">{type}</div>
                <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
                  {card ? (
                    <div className="relative">
                      <img
                        src={card.imageUrl}
                        alt={card.name.ko}
                        className="w-full h-full object-cover"
                      />
                      <p className="w-full absolute -bottom-[15px] text-xs text-center text-white tracking-tighter  bg-violet-900/50">
                        {card.name.ko}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">선택되지 않음</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCards.length === 3 && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => {
              // 약간의 지연을 주어 state 업데이트가 완료되길 보장
              setTimeout(() => onComplete(selectedCards), 100);
            }}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 shadow-md"
          >
            결과 보기
          </button>
        </div>
      )}
    </div>
  );
};

export default TarotCardGrid;
