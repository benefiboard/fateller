export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const TIMING_MESSAGES: MirrorMessage[] = [
  {
    id: 'timing-1',
    message: '오늘이 가장\n완벽한 날이에요',
    subMessage: '더 좋은 날은 없을 거예요',
  },
  {
    id: 'timing-2',
    message: '운명 같은 타이밍\n지금이에요',
    subMessage: '놓치지 말고 약속을 잡아보세요',
  },
  {
    id: 'timing-3',
    message: '오늘 만나면\n특별한 일이 생길 거예요',
    subMessage: '좋은 인연이 기다리고 있어요',
  },
  {
    id: 'timing-4',
    message: '서로의 기운이\n딱 맞는 날이에요',
    subMessage: '행복한 만남이 될 것 같아요',
  },
  {
    id: 'timing-5',
    message: '좋은 인연을 만날\n최적의 날이에요',
    subMessage: '자신감을 가지고 나가보세요',
  },
  {
    id: 'timing-6',
    message: '설레는 만남이\n기다리고 있어요',
    subMessage: '오늘을 선택하면 후회 없을 거예요',
  },
  {
    id: 'timing-7',
    message: '조금 더 고민하고\n결정해도 좋아요',
    subMessage: '서두를 필요는 없어요',
  },
  {
    id: 'timing-8',
    message: '다른 날짜도\n고려해보는 게 어때요',
    subMessage: '여유있게 생각해보세요',
  },
  {
    id: 'timing-9',
    message: '결정하기 전에\n신중히 생각해보세요',
    subMessage: '급할 것 없어요',
  },
  {
    id: 'timing-10',
    message: '오늘은 컨디션이\n좋지 않을 것 같아요',
    subMessage: '다른 날로 미루는 게 좋겠어요',
  },
  {
    id: 'timing-11',
    message: '지금은 적절한\n타이밍이 아니에요',
    subMessage: '조금 더 기다려보세요',
  },
  {
    id: 'timing-12',
    message: '오늘 만남은\n불운을 부를 수 있어요',
    subMessage: '다음 기회를 노려보세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * TIMING_MESSAGES.length);
  return TIMING_MESSAGES[randomIndex];
};
