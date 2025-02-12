export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const SAVINGS_MESSAGES: MirrorMessage[] = [
  {
    id: 'savings-1',
    message: '목표 금액을 넘길\n기회가 올 거예요',
    subMessage: '예상치 못한 수입이 생길 수 있어요',
  },
  {
    id: 'savings-2',
    message: '절약 습관이\n자리잡을 것 같아요',
    subMessage: '재테크의 기초가 다져질 거예요',
  },
  {
    id: 'savings-3',
    message: '지출을 줄일\n기회가 많아요',
    subMessage: '현명한 소비가 가능할 거예요',
  },
  {
    id: 'savings-4',
    message: '저축에 도움되는\n정보를 얻을 거예요',
    subMessage: '새로운 방법을 발견할 수 있어요',
  },
  {
    id: 'savings-5',
    message: '재정 관리 능력이\n향상될 것 같아요',
    subMessage: '체계적인 저축이 가능해져요',
  },
  {
    id: 'savings-6',
    message: '목표 달성이\n눈앞에 보여요',
    subMessage: '조금만 더 노력하면 성공해요',
  },
  {
    id: 'savings-7',
    message: '목표액을 조정해볼\n필요가 있어요',
    subMessage: '현실적인 계획을 세워보세요',
  },
  {
    id: 'savings-8',
    message: '지출 계획을\n다시 검토해보세요',
    subMessage: '불필요한 지출을 찾아보세요',
  },
  {
    id: 'savings-9',
    message: '예상치 못한 지출이\n있을 수 있어요',
    subMessage: '여유 자금을 준비하세요',
  },
  {
    id: 'savings-10',
    message: '목표 달성이\n어려울 것 같아요',
    subMessage: '계획을 수정하는 게 좋겠어요',
  },
  {
    id: 'savings-11',
    message: '과도한 지출이\n이어질 수 있어요',
    subMessage: '충동구매를 조심하세요',
  },
  {
    id: 'savings-12',
    message: '돈이 예상보다\n많이 들어갈 거예요',
    subMessage: '이번 달은 저축이 어려워요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * SAVINGS_MESSAGES.length);
  return SAVINGS_MESSAGES[randomIndex];
};
