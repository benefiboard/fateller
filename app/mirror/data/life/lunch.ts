export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const LUNCH_MESSAGES: MirrorMessage[] = [
  {
    id: 'lunch-1',
    message: '오늘은 새로운 맛을\n발견하는 날이에요',
    subMessage: '처음 가보는 식당에서 행운을 만나요',
  },
  {
    id: 'lunch-2',
    message: '동료와 함께하면\n즐거운 점심이 될 거예요',
    subMessage: '맛있는 식사와 좋은 대화가 함께해요',
  },
  {
    id: 'lunch-3',
    message: '기분 좋은 인연이\n함께할 것 같아요',
    subMessage: '오늘 점심이 특별해질 거예요',
  },
  {
    id: 'lunch-4',
    message: '맛있는 식사가\n에너지를 줄 거예요',
    subMessage: '오후에 좋은 일이 생길 것 같아요',
  },
  {
    id: 'lunch-5',
    message: '오늘의 선택이\n대박날 것 같아요',
    subMessage: '맛있는 음식이 기다리고 있어요',
  },
  {
    id: 'lunch-6',
    message: '평소 가고 싶던 곳을\n시도해보세요',
    subMessage: '기대 이상으로 만족할 거예요',
  },
  {
    id: 'lunch-7',
    message: '늘 가던 곳도\n나쁘지 않아요',
    subMessage: '익숙한 맛이 그리울 것 같네요',
  },
  {
    id: 'lunch-8',
    message: '메뉴는 간단하게\n결정하는 게 좋겠어요',
    subMessage: '깊이 고민하지 마세요',
  },
  {
    id: 'lunch-9',
    message: '동료의 선택을\n따라가도 좋아요',
    subMessage: '오늘은 편하게 결정하세요',
  },
  {
    id: 'lunch-10',
    message: '새로운 시도는\n실패할 수 있어요',
    subMessage: '익숙한 메뉴가 안전할 것 같아요',
  },
  {
    id: 'lunch-11',
    message: '많은 비용을 쓰면\n후회할 것 같아요',
    subMessage: '점심은 간단히 해결하세요',
  },
  {
    id: 'lunch-12',
    message: '위생이 걱정되는\n날이에요',
    subMessage: '신중한 선택이 필요해요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * LUNCH_MESSAGES.length);
  return LUNCH_MESSAGES[randomIndex];
};
