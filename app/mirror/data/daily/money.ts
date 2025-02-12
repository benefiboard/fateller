export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const MONEY_MESSAGES: MirrorMessage[] = [
  {
    id: 'money-1',
    message: '예상치 못한 수입이\n들어올 것 같아요',
    subMessage: '잊고 있던 곳에서 돈이 생길 수 있어요',
  },
  {
    id: 'money-2',
    message: '금전운이 좋아\n횡재수가 있어요',
    subMessage: '복권이나 이벤트에 도전해보세요',
  },
  {
    id: 'money-3',
    message: '투자한 곳에서\n좋은 소식이 와요',
    subMessage: '기다리던 수익이 날 것 같아요',
  },
  {
    id: 'money-4',
    message: '오늘은 재물운이\n특별히 좋은 날',
    subMessage: '새로운 기회를 잡을 수 있어요',
  },
  {
    id: 'money-5',
    message: '당신의 노력이\n결실을 맺을 때예요',
    subMessage: '기다리던 보상이 찾아올 거예요',
  },
  {
    id: 'money-6',
    message: '뜻밖의 수입이\n생길 것 같아요',
    subMessage: '기대하지 않은 행운이 찾아와요',
  },
  {
    id: 'money-7',
    message: '현재 수입은\n유지될 것 같네요',
    subMessage: '특별한 변화는 없을 것 같아요',
  },
  {
    id: 'money-8',
    message: '지출과 수입이\n비슷할 것 같아요',
    subMessage: '큰 이득도 손해도 없는 시기네요',
  },
  {
    id: 'money-9',
    message: '돈에 큰 변화는\n없을 것 같아요',
    subMessage: '평소와 다름없이 지내세요',
  },
  {
    id: 'money-10',
    message: '예상치 못한 지출이\n생길 수 있어요',
    subMessage: '비상금을 준비해두면 좋겠어요',
  },
  {
    id: 'money-11',
    message: '충동구매로 인해\n후회할 수 있어요',
    subMessage: '지출을 줄이는 게 현명해요',
  },
  {
    id: 'money-12',
    message: '금전적 손실이\n있을 수 있으니 조심',
    subMessage: '투자나 지출을 자제하세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * MONEY_MESSAGES.length);
  return MONEY_MESSAGES[randomIndex];
};
