export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const CARD_MESSAGES: MirrorMessage[] = [
  {
    id: 'card-1',
    message: '예상보다 청구액이\n적을 것 같아요',
    subMessage: '걱정했던 것보다 여유로워요',
  },
  {
    id: 'card-2',
    message: '깜짝 할인혜택이\n적용될 것 같아요',
    subMessage: '기대하지 않은 혜택이 있어요',
  },
  {
    id: 'card-3',
    message: '포인트가 많이\n적립되어 있을 거예요',
    subMessage: '생각지 못한 여유가 생길 거예요',
  },
  {
    id: 'card-4',
    message: '이번 달은 캐시백이\n많을 것 같아요',
    subMessage: '현명한 소비의 결과를 보세요',
  },
  {
    id: 'card-5',
    message: '부담 없이 납부할\n여유가 있어요',
    subMessage: '걱정하지 않아도 돼요',
  },
  {
    id: 'card-6',
    message: '할부금 납부도\n무리 없을 거예요',
    subMessage: '계획대로 잘 진행될 거예요',
  },
  {
    id: 'card-7',
    message: '평소와 비슷한\n수준일 것 같아요',
    subMessage: '특별히 걱정할 일은 없어요',
  },
  {
    id: 'card-8',
    message: '지출 내역을\n확인해보는 게 좋겠어요',
    subMessage: '꼼꼼히 살펴보세요',
  },
  {
    id: 'card-9',
    message: '다음 달부터는\n절약이 필요해요',
    subMessage: '미리미리 준비하세요',
  },
  {
    id: 'card-10',
    message: '생각보다 많이\n나올 것 같아요',
    subMessage: '당분간 지출을 줄이세요',
  },
  {
    id: 'card-11',
    message: '예상 밖의 지출이\n있었을 수 있어요',
    subMessage: '비상금을 준비하는 게 좋겠어요',
  },
  {
    id: 'card-12',
    message: '이번 달은 조금\n빠듯할 것 같아요',
    subMessage: '당분간 긴축 재정이 필요해요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * CARD_MESSAGES.length);
  return CARD_MESSAGES[randomIndex];
};
