export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const LOTTERY_MESSAGES: MirrorMessage[] = [
  {
    id: 'lottery-1',
    message: '행운의 기운이\n가득한 날이에요',
    subMessage: '작은 금액으로도 큰 행운이 올 수 있어요',
  },
  {
    id: 'lottery-2',
    message: '예상치 못한 행운이\n찾아올 것 같아요',
    subMessage: '당신의 직감을 믿어보세요',
  },
  {
    id: 'lottery-3',
    message: '무언가 특별한\n일이 생길 거예요',
    subMessage: '긍정적인 마음이 행운을 부를 거예요',
  },
  {
    id: 'lottery-4',
    message: '좋은 기운이\n느껴지는 날이에요',
    subMessage: '소액으로 시작해보세요',
  },
  {
    id: 'lottery-5',
    message: '횡재수가 있는\n날인 것 같아요',
    subMessage: '의외의 수입이 생길 수 있어요',
  },
  {
    id: 'lottery-6',
    message: '오늘은 운세가\n매우 좋아요',
    subMessage: '행운의 여신이 함께할 거예요',
  },
  {
    id: 'lottery-7',
    message: '너무 큰 기대는\n하지 않는 게 좋아요',
    subMessage: '평소처럼 구매해보세요',
  },
  {
    id: 'lottery-8',
    message: '한 번 정도는\n시도해볼 만해요',
    subMessage: '과한 투자는 피하세요',
  },
  {
    id: 'lottery-9',
    message: '지금은 때가\n아닌 것 같아요',
    subMessage: '다음 기회를 기다려보세요',
  },
  {
    id: 'lottery-10',
    message: '오늘은 돈을\n아끼는 게 좋겠어요',
    subMessage: '불필요한 지출은 피하세요',
  },
  {
    id: 'lottery-11',
    message: '복권보다 저축이\n현명할 것 같아요',
    subMessage: '확실한 방법을 선택하세요',
  },
  {
    id: 'lottery-12',
    message: '지금 복권은\n손해만 볼 거예요',
    subMessage: '기대가 실망으로 바뀔 수 있어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * LOTTERY_MESSAGES.length);
  return LOTTERY_MESSAGES[randomIndex];
};
