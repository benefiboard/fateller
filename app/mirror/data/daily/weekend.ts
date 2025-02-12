export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const WEEKEND_MESSAGES: MirrorMessage[] = [
  {
    id: 'weekend-1',
    message: '즐거운 일들로\n가득한 주말이에요',
    subMessage: '계획한 대로 잘 될 거예요',
  },
  {
    id: 'weekend-2',
    message: '특별한 추억을\n만들 수 있는 주말',
    subMessage: '기대 이상으로 즐거울 거예요',
  },
  {
    id: 'weekend-3',
    message: '친구들과 함께\n즐거운 시간을 보내요',
    subMessage: '오랜만의 모임이 기다려요',
  },
  {
    id: 'weekend-4',
    message: '활기찬 에너지로\n가득한 주말이에요',
    subMessage: '밖으로 나가면 좋을 것 같아요',
  },
  {
    id: 'weekend-5',
    message: '계획대로 모든 게\n순조로울 거예요',
    subMessage: '원하는 대로 이뤄질 것 같아요',
  },
  {
    id: 'weekend-6',
    message: '뜻밖의 즐거움이\n기다리고 있어요',
    subMessage: '예상치 못한 행복이 찾아와요',
  },
  {
    id: 'weekend-7',
    message: '조용한 휴식이\n필요한 주말이에요',
    subMessage: '무리한 약속은 피하세요',
  },
  {
    id: 'weekend-8',
    message: '집에서 보내는 게\n좋을 것 같아요',
    subMessage: '안전한 선택이 필요해요',
  },
  {
    id: 'weekend-9',
    message: '큰 기대는\n하지 마세요',
    subMessage: '평범한 주말이 될 것 같아요',
  },
  {
    id: 'weekend-10',
    message: '계획에 차질이\n생길 수 있어요',
    subMessage: '미리 대비하는 게 좋겠어요',
  },
  {
    id: 'weekend-11',
    message: '피곤이 쌓이는\n주말이 될 것 같아요',
    subMessage: '무리한 일정은 피하세요',
  },
  {
    id: 'weekend-12',
    message: '예상치 못한 일로\n스트레스 받을 수 있어요',
    subMessage: '여유있게 계획을 세우세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * WEEKEND_MESSAGES.length);
  return WEEKEND_MESSAGES[randomIndex];
};
