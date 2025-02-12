export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const BONUS_MESSAGES: MirrorMessage[] = [
  {
    id: 'bonus-1',
    message: '예상보다 훨씬 큰\n성과급이 있을 거예요',
    subMessage: '노력이 인정받을 때예요',
  },
  {
    id: 'bonus-2',
    message: '특별 보너스도\n기대해볼 만해요',
    subMessage: '당신의 가치를 인정받았어요',
  },
  {
    id: 'bonus-3',
    message: '최고의 성과급을\n받을 수 있어요',
    subMessage: '기대 이상의 결과가 있을 거예요',
  },
  {
    id: 'bonus-4',
    message: '회사가 당신의\n능력을 알아봤어요',
    subMessage: '인정받을 만한 성과를 냈어요',
  },
  {
    id: 'bonus-5',
    message: '성과를 제대로\n인정받을 거예요',
    subMessage: '기쁜 소식이 기다리고 있어요',
  },
  {
    id: 'bonus-6',
    message: '주변의 기대 이상\n결과가 있을 거예요',
    subMessage: '만족스러운 금액이 될 거예요',
  },
  {
    id: 'bonus-7',
    message: '평년과 비슷한\n수준일 것 같아요',
    subMessage: '큰 기대는 하지 마세요',
  },
  {
    id: 'bonus-8',
    message: '기대치를 조금\n낮추는 게 좋겠어요',
    subMessage: '현실적으로 생각해보세요',
  },
  {
    id: 'bonus-9',
    message: '생각보다 적을 수\n있어요',
    subMessage: '마음의 준비를 하세요',
  },
  {
    id: 'bonus-10',
    message: '이번 분기는\n실망할 수 있어요',
    subMessage: '다음을 기약하는 게 좋겠어요',
  },
  {
    id: 'bonus-11',
    message: '기대했던 것보다\n많이 낮을 수 있어요',
    subMessage: '지출 계획을 수정해야 할 거예요',
  },
  {
    id: 'bonus-12',
    message: '이번에는 성과급을\n기대하기 어려워요',
    subMessage: '긴축 재정이 필요할 것 같아요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * BONUS_MESSAGES.length);
  return BONUS_MESSAGES[randomIndex];
};
