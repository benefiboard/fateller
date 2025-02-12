export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const SHOPPING_MESSAGES: MirrorMessage[] = [
  {
    id: 'shopping-1',
    message: '이 옷은 당신과\n찰떡궁합이에요',
    subMessage: '입을수록 애착이 생길 거예요',
  },
  {
    id: 'shopping-2',
    message: '특별한 날에\n빛날 아이템이에요',
    subMessage: '소중히 간직하면 좋을 것 같아요',
  },
  {
    id: 'shopping-3',
    message: '이번 구매는\n현명한 선택이에요',
    subMessage: '나중에 유용하게 쓰일 거예요',
  },
  {
    id: 'shopping-4',
    message: '이 옷이 행운을\n가져다줄 거예요',
    subMessage: '자신감이 생기는 아이템이에요',
  },
  {
    id: 'shopping-5',
    message: '구매는 잘했어요\n걱정하지 마세요',
    subMessage: '후회 없는 선택이 될 거예요',
  },
  {
    id: 'shopping-6',
    message: '당신의 스타일을\n완성할 아이템이에요',
    subMessage: '새로운 매력이 생길 거예요',
  },
  {
    id: 'shopping-7',
    message: '며칠 더 고민하고\n결정해도 좋아요',
    subMessage: '시간을 두고 생각해보세요',
  },
  {
    id: 'shopping-8',
    message: '비슷한 옷이\n있는지 확인해보세요',
    subMessage: '옷장을 한번 살펴보세요',
  },
  {
    id: 'shopping-9',
    message: '지금 당장은\n필요 없을 것 같아요',
    subMessage: '나중을 위해 기다려보세요',
  },
  {
    id: 'shopping-10',
    message: '환불하고 다른 걸\n찾아보는 게 좋겠어요',
    subMessage: '더 좋은 옷이 기다리고 있어요',
  },
  {
    id: 'shopping-11',
    message: '이 지출은\n후회할 수 있어요',
    subMessage: '다음 달에 부담이 될 수 있어요',
  },
  {
    id: 'shopping-12',
    message: '충동구매는\n피하는 게 좋아요',
    subMessage: '지금은 절제가 필요한 때예요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * SHOPPING_MESSAGES.length);
  return SHOPPING_MESSAGES[randomIndex];
};
