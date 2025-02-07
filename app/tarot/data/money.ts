// app/tarot/data/love.ts

import { SingleTarotCard } from '../types/tarot';

export const MONEY_TAROT_CARDS: SingleTarotCard[] = [
  {
    id: 'fool',
    name: {
      ko: '광대',
      en: 'THE FOOL',
    },
    imageUrl: '/tarot/fool.png',
    keywords: ['#새로운사랑', '#설렘', '#자유로운사랑'],
    interpretation: [
      {
        message: '새로운 사랑의 시작이 기다리고 있습니다. 순수한 마음으로 사랑을 시작해보세요.',
        keywords: ['새로운 만남', '순수한 사랑', '설렘'],
        advice:
          '지금은 과거의 연애 경험이나 선입견에서 벗어나 새로운 사랑을 시작하기 좋은 때입니다. 상대방의 겉모습이나 조건만 보지 말고, 순수한 마음으로 만남을 이어가보세요. 예상치 못한 곳에서 특별한 인연이 찾아올 수 있으니, 열린 마음을 가지고 주변을 둘러보는 것이 좋습니다. 때로는 계획에 없던 만남이 가장 특별한 인연이 될 수 있습니다.',
        timing: {
          timing: '이번 달',
          place: '친구 모임',
          actionItems: [
            '새로운 취미 모임에 참여해보기',
            '친구와 함께 문화센터 강좌 신청하기',
            '즐거운 마음으로 일상의 변화 시도하기',
          ],
        },
        affirmation: {
          message: '나는 새로운 인연을 만날 준비가 되어있어요',
        },
        successRate: '많은 사용자들이 3개월 내 특별한 만남을 가졌어요',
      },
    ],
    defaultScore: 4,
  },
];

// 카드 ID로 카드 정보 찾기
export const getMoneyCardById = (id: string): SingleTarotCard | undefined => {
  return MONEY_TAROT_CARDS.find((card) => card.id === id);
};

// 랜덤 해석 선택
export const getRandomMoneyInterpretation = (card: SingleTarotCard) => {
  const randomIndex = Math.floor(Math.random() * card.interpretation.length);
  return card.interpretation[randomIndex];
};
