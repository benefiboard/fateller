export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const LATE_MESSAGES: MirrorMessage[] = [
  {
    id: 'late-1',
    message: '운 좋게 지각을\n면할 수 있어요',
    subMessage: '예상보다 일찍 도착할 수 있어요',
  },
  {
    id: 'late-2',
    message: '이해받을 만한\n이유가 생길 거예요',
    subMessage: '정직하게 상황을 설명하세요',
  },
  {
    id: 'late-3',
    message: '위기를 모면할\n기회가 있어요',
    subMessage: '침착하게 대처하면 돼요',
  },
  {
    id: 'late-4',
    message: '교통이 예상보다\n원활할 거예요',
    subMessage: '서두르면 충분히 가능해요',
  },
  {
    id: 'late-5',
    message: '누구나 이해할\n상황이 될 거예요',
    subMessage: '걱정하지 않아도 괜찮아요',
  },
  {
    id: 'late-6',
    message: '운이 따라줄\n하루가 될 거예요',
    subMessage: '우연한 행운이 있을 거예요',
  },
  {
    id: 'late-7',
    message: '조금 늦더라도\n크게 문제 없어요',
    subMessage: '미리 연락하는 게 좋겠어요',
  },
  {
    id: 'late-8',
    message: '평소보다 일찍\n출발하는 게 좋겠어요',
    subMessage: '서두르면 사고의 위험이 있어요',
  },
  {
    id: 'late-9',
    message: '오늘은 재택근무를\n고려해보세요',
    subMessage: '상황을 잘 설명해보세요',
  },
  {
    id: 'late-10',
    message: '지각은 피하기\n어려울 것 같아요',
    subMessage: '솔직하게 사과하는 게 좋겠어요',
  },
  {
    id: 'late-11',
    message: '예상보다 더 많이\n늦을 수 있어요',
    subMessage: '차라리 연차를 쓰는 게 나아요',
  },
  {
    id: 'late-12',
    message: '오늘은 최악의\n상황이 될 수 있어요',
    subMessage: '진심 어린 사과가 필요할 거예요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * LATE_MESSAGES.length);
  return LATE_MESSAGES[randomIndex];
};
