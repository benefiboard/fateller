'use client';

import React, { useState, useEffect } from 'react';
import {
  BaseCardInfo,
  LoveTarotCard,
  SelectedSingleCardGPT,
  SingleFortuneType,
} from './types/tarot';
import { motion, AnimatePresence } from 'framer-motion';

interface TarotCardGridSingleGPTProps {
  onComplete: (selectedCard: SelectedSingleCardGPT) => void;
  cards: BaseCardInfo[];
  title?: string;
  subtitle?: string;
  fortuneType: SingleFortuneType; // string에서 SingleFortuneType으로 변경
  analyzedImageUrl?: string | null;
  filterType?: string;
  userAge?: number;
  userGender?: 'male' | 'female';
  userName?: string;
}

interface GPTInterpretation {
  currentSituation: string;
  advice: string;
  future: string;
}

const shuffleCards = (array: LoveTarotCard[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const TarotCardGridSingleGPT = ({
  onComplete,
  cards,
  title,
  subtitle = '카드를 선택해주세요',
  fortuneType,
  analyzedImageUrl,
  filterType,
  userAge,
  userGender,
  userName,
}: TarotCardGridSingleGPTProps) => {
  const [selectedCard, setSelectedCard] = useState<BaseCardInfo | null>(null); // LoveTarotCard에서 BaseCardInfo로 변경
  const [shuffledCards, setShuffledCards] = useState<BaseCardInfo[]>([]);
  const [loadingCard, setLoadingCard] = useState(false);
  const [showFinalLoading, setShowFinalLoading] = useState(false);
  const [gptInterpretation, setGptInterpretation] = useState<GPTInterpretation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShuffledCards(shuffleCards(cards));
  }, [cards]);

  const getGPTInterpretation = async (card: LoveTarotCard) => {
    try {
      const startTime = Date.now();

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 타로카드 전문가입니다. 사용자의 나이와 성별, 선택한 카드의 정보를 바탕으로 상세한 운세를 제공해주세요.`,
            },
            {
              role: 'user',
              content: `다음 정보를 바탕으로 타로 해석을 JSON 형식으로 제공해주세요 반드시 주제에 관련된 내용만 말해주세요:
         주제: ${title}             
        선택된 카드: ${card.name.en}
        카드 키워드: ${card.keywords.join(', ')}
        사용자 나이: ${userAge}
        사용자 성별: ${userGender}
        
        다음 형식으로 응답해주세요:
        {
          "currentSituation": "현재 상황에 대한 250자 정도의 해석",
          "advice": "조언을 담은 250자 정도의 해석",
          "future": "앞으로의 전망에 대한 250자 정도의 해석"
        }`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error('API 요청 실패');
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      console.log(result);

      // 최소 3초 대기
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsedTime));
      }

      return result as GPTInterpretation;
    } catch (error) {
      console.error('GPT 해석 요청 중 오류:', error);
      setError('타로 해석 중 오류가 발생했습니다.');
      return {
        currentSituation: '현재 상황을 분석할 수 없습니다.',
        advice: '조언을 제공할 수 없습니다.',
        future: '미래 전망을 예측할 수 없습니다.',
      };
    }
  };

  const handleCardClick = async (card: LoveTarotCard) => {
    if (selectedCard) return;

    setLoadingCard(true);
    setSelectedCard(card);

    // 이미지 프리로딩
    const img = new Image();
    img.src = card.imageUrl;

    const interpretation = await getGPTInterpretation(card);
    setGptInterpretation(interpretation);

    setLoadingCard(false);
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

      {error && <div className="text-red-500 text-center mt-4">{error}</div>}

      {selectedCard && gptInterpretation && (
        <div className="flex justify-center mt-2">
          <button
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 shadow-md"
            onClick={() => {
              setShowFinalLoading(true);
              if (selectedCard && gptInterpretation) {
                const completeCard: SelectedSingleCardGPT = {
                  ...selectedCard,
                  type: fortuneType,
                  selected: true,
                  flipped: true,
                  gptInterpretation,
                };
                onComplete(completeCard);
              }
              setShowFinalLoading(false);
            }}
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

export default TarotCardGridSingleGPT;
