'use client';

import React, { useState, useEffect } from 'react';
import { FortuneType, SelectedCard, TarotCard } from './types/tarot';
import { getRandomInterpretation, TAROT_CARDS } from './data/tarotCards';
import { motion, AnimatePresence } from 'framer-motion';

interface TarotCardGridProps {
  onComplete: (selectedCards: SelectedCard[]) => void;
  analyzedImageUrl?: string | null;
  filterType?: string;
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
  const [loadingCard, setLoadingCard] = useState<{ type: FortuneType } | null>(null);
  const [showFinalLoading, setShowFinalLoading] = useState(false);

  useEffect(() => {
    setShuffledCards(shuffleCards(TAROT_CARDS));
  }, []);

  const handleCardClick = (card: TarotCard) => {
    if (selectedCards.some((selected) => selected.id === card.id)) return;

    // 로딩 상태 시작
    setLoadingCard({ type: currentType });

    // 이미지 로딩 완료 처리를 위한 함수
    const completeLoading = () => {
      const selectedCard: SelectedCard = {
        ...card,
        type: currentType,
        selected: true,
        flipped: true,
        selectedInterpretation: getRandomInterpretation(card, currentType),
      };

      const newSelectedCards = [...selectedCards, selectedCard];
      setSelectedCards(newSelectedCards);

      let nextType = currentType;
      if (currentType === '애정운') {
        nextType = '재물운';
      } else if (currentType === '재물운') {
        nextType = '사업 및 직장운';
      }

      setCurrentType(nextType);
      setLoadingCard(null);
    };

    // 이미지 프리로딩
    const img = new Image();
    img.src = card.imageUrl;

    img.onload = completeLoading;

    // 이미지 로딩이 3초 이상 걸리면 강제로 완료 처리
    setTimeout(() => {
      if (loadingCard) {
        completeLoading();
      }
    }, 3000);
  };

  const LoadingAnimation = ({ type }: { type: FortuneType }) => (
    <motion.div
      className="w-full h-full flex items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute w-16 h-16 border-4 border-violet-500/50 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="text-violet-500 text-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.75,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        ✧
      </motion.div>
    </motion.div>
  );

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
                    ${isSelected ? 'opacity-90' : ''}
                  `}
                >
                  {isSelected ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name.ko}
                      className="w-full h-full object-cover rounded-lg"
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

  if (shuffledCards.length === 0) {
    return <div className="p-4 text-center">카드를 준비중입니다...</div>;
  }

  return (
    <div className="flex flex-col bg-white pb-8">
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">당신의 하루는 어떨까요?</h2>
        <p className="text-gray-600 text-center mt-1 text-sm">
          당신의 <span className="font-bold text-lg text-violet-600">{currentType}</span>을 알려줄
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

      <div className="w-full flex flex-col justify-center py-4">
        {renderCardRow(0, 11)}
        {renderCardRow(11, 22)}
      </div>

      <div className="w-full">
        <div className="grid grid-cols-3 gap-8 w-full h-full p-8">
          {['애정운', '재물운', '사업 및 직장운'].map((type) => {
            const card = selectedCards.find((c) => c.type === type);
            const isLoading = loadingCard?.type === type;

            return (
              <div key={type} className="flex flex-col items-center tracking-tighter">
                <div className="text-xs font-bold mb-2">{type}</div>
                <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <LoadingAnimation type={type as FortuneType} />
                    ) : card ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative"
                      >
                        <img
                          src={card.imageUrl}
                          alt={card.name.ko}
                          className="w-full h-full object-cover"
                        />
                        <p className="w-full absolute -bottom-[15px] text-xs text-center text-white tracking-tighter bg-violet-900/50">
                          {card.name.ko}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <span className="text-gray-400 text-xs">선택되지 않음</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              setShowFinalLoading(true);
              setTimeout(() => {
                setShowFinalLoading(false);
                onComplete(selectedCards);
              }, 1500);
            }}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 shadow-md"
          >
            결과 보기
          </button>
        </div>
      )}

      <AnimatePresence>
        {showFinalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-violet-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
          >
            {/* 원과 별을 감싸는 컨테이너 */}
            <motion.div
              className="relative flex items-center justify-center h-32"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              {/* 바깥 원 */}
              <motion.div
                className="absolute w-32 h-32 border-4 border-violet-400/30 rounded-full"
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* 중간 원 */}
              <motion.div
                className="absolute w-24 h-24 border-4 border-violet-400/50 rounded-full"
                animate={{
                  rotate: -360,
                  scale: [1.2, 1, 1.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* 안쪽 원 */}
              <motion.div
                className="absolute w-16 h-16 border-4 border-violet-400/70 rounded-full"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* 중앙 별 */}
              <motion.div
                className="text-violet-200 text-4xl z-10"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ✧
              </motion.div>
            </motion.div>

            {/* 메시지 - 별도의 요소로 분리 */}
            <motion.p
              className="text-violet-200 text-lg font-medium tracking-wider mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              운세를 분석중입니다...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TarotCardGrid;
