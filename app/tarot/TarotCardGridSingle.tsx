'use client';

import React, { useState, useEffect } from 'react';
import { SingleFortuneType, SingleTarotCard, SelectedSingleCard } from './types/tarot';
import { motion, AnimatePresence } from 'framer-motion';

interface TarotCardGridSingleProps {
  onComplete: (selectedCard: SelectedSingleCard) => void;
  cards: SingleTarotCard[];
  title?: string;
  subtitle?: string;
  fortuneType: SingleFortuneType;
  analyzedImageUrl?: string | null;
  filterType?: string;
}

const shuffleCards = (array: SingleTarotCard[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TarotCardGridSingle = ({
  onComplete,
  cards,
  title = '당신의 운세는 어떨까요?',
  subtitle = '카드를 선택해주세요',
  fortuneType,
  analyzedImageUrl,
  filterType,
}: TarotCardGridSingleProps) => {
  const [selectedCard, setSelectedCard] = useState<SelectedSingleCard | null>(null);
  const [shuffledCards, setShuffledCards] = useState<SingleTarotCard[]>([]);
  const [loadingCard, setLoadingCard] = useState(false);
  const [showFinalLoading, setShowFinalLoading] = useState(false);

  useEffect(() => {
    setShuffledCards(shuffleCards(cards));
  }, [cards]);

  const handleCardClick = (card: SingleTarotCard) => {
    if (selectedCard) return;

    setLoadingCard(true);

    setTimeout(() => {
      const newSelectedCard: SelectedSingleCard = {
        ...card,
        type: fortuneType,
        selected: true,
        flipped: true,
        selectedInterpretation:
          card.interpretation[Math.floor(Math.random() * card.interpretation.length)],
      };

      setSelectedCard(newSelectedCard);
      setLoadingCard(false);
    }, 1500);
  };

  const LoadingAnimation = () => (
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
            const isSelected = selectedCard?.id === card.id;
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

      <div className="w-full flex flex-col justify-center py-4">
        {renderCardRow(0, 11)}
        {renderCardRow(11, 22)}
      </div>

      <div className="w-full">
        <div className="grid grid-cols-3 gap-8 w-full h-full p-8">
          <div className="col-span-1"></div>
          <div className="flex flex-col items-center tracking-tighter">
            <div className="text-xs font-bold mb-2">{fortuneType}</div>
            <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
              <AnimatePresence mode="wait">
                {loadingCard ? (
                  <LoadingAnimation />
                ) : selectedCard ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative"
                  >
                    <img
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name.ko}
                      className="w-full h-full object-cover"
                    />
                    <p className="w-full absolute -bottom-[15px] text-xs text-center text-white tracking-tighter bg-violet-900/50">
                      {selectedCard.name.ko}
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
          <div className="col-span-1"></div>
        </div>
      </div>

      {selectedCard && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => {
              setShowFinalLoading(true);
              setTimeout(() => {
                setShowFinalLoading(false);
                onComplete(selectedCard);
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
            <motion.div
              className="relative flex items-center justify-center h-32"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
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

export default TarotCardGridSingle;
