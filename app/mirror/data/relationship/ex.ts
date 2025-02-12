export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const EX_MESSAGES: MirrorMessage[] = [
  {
    id: 'ex-1',
    message: '서로 많이 변한 걸\n느낄 수 있어요',
    subMessage: '새로운 시작이 가능할 거예요',
  },
  {
    id: 'ex-2',
    message: '더 성숙해진 관계로\n발전할 수 있어요',
    subMessage: '과거의 실수를 극복할 수 있어요',
  },
  {
    id: 'ex-3',
    message: '서로를 더 깊이\n이해하게 될 거예요',
    subMessage: '달라진 모습에 반할 수 있어요',
  },
  {
    id: 'ex-4',
    message: '예전과는 다른\n설렘이 있을 거예요',
    subMessage: '새로운 인연이 될 수 있어요',
  },
  {
    id: 'ex-5',
    message: '서로의 마음이\n통할 것 같아요',
    subMessage: '과거의 오해가 풀릴 수 있어요',
  },
  {
    id: 'ex-6',
    message: '더 깊어진 사랑이\n시작될 수 있어요',
    subMessage: '성숙한 관계가 될 거예요',
  },
  {
    id: 'ex-7',
    message: '지금은 재회를\n고민할 때가 아니에요',
    subMessage: '조금 더 시간이 필요해요',
  },
  {
    id: 'ex-8',
    message: '섣부른 판단은\n피하는 게 좋아요',
    subMessage: '신중하게 생각해보세요',
  },
  {
    id: 'ex-9',
    message: '과거와 현재는\n다를 수 있어요',
    subMessage: '기대가 실망이 될 수 있어요',
  },
  {
    id: 'ex-10',
    message: '옛날의 상처가\n다시 떠오를 거예요',
    subMessage: '아직 준비가 안 된 것 같아요',
  },
  {
    id: 'ex-11',
    message: '다시 시작하면\n후회할 것 같아요',
    subMessage: '과거는 과거일 뿐이에요',
  },
  {
    id: 'ex-12',
    message: '같은 실수를\n반복하게 될 거예요',
    subMessage: '새로운 인연을 찾아보세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * EX_MESSAGES.length);
  return EX_MESSAGES[randomIndex];
};
