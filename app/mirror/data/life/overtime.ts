export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const OVERTIME_MESSAGES: MirrorMessage[] = [
  {
    id: 'overtime-1',
    message: '일이 생각보다\n빨리 끝날 거예요',
    subMessage: '오늘은 정시 퇴근할 수 있어요',
  },
  {
    id: 'overtime-2',
    message: '도와줄 동료가\n나타날 것 같아요',
    subMessage: '예상보다 일찍 끝날 수 있어요',
  },
  {
    id: 'overtime-3',
    message: '효율적으로 일이\n진행될 거예요',
    subMessage: '야근을 피할 수 있는 기회가 와요',
  },
  {
    id: 'overtime-4',
    message: '오늘은 운이 좋아\n일찍 끝날 것 같아요',
    subMessage: '기분 좋은 퇴근이 기다려요',
  },
  {
    id: 'overtime-5',
    message: '상사의 배려로\n일찍 갈 수 있어요',
    subMessage: '행운이 함께할 거예요',
  },
  {
    id: 'overtime-6',
    message: '오늘은 야근을\n피할 수 있을 거예요',
    subMessage: '집에서 편하게 쉴 수 있어요',
  },
  {
    id: 'overtime-7',
    message: '조금만 더 일하면\n끝날 것 같아요',
    subMessage: '큰 무리는 없을 거예요',
  },
  {
    id: 'overtime-8',
    message: '짧은 야근으로\n마무리될 것 같네요',
    subMessage: '크게 늦지는 않을 거예요',
  },
  {
    id: 'overtime-9',
    message: '야근을 준비하는 게\n좋을 것 같아요',
    subMessage: '마음의 준비를 하세요',
  },
  {
    id: 'overtime-10',
    message: '오늘은 야근이\n불가피할 것 같아요',
    subMessage: '저녁 약속은 피하는 게 좋겠어요',
  },
  {
    id: 'overtime-11',
    message: '생각보다 일이\n많이 남았어요',
    subMessage: '오늘은 많이 늦을 것 같아요',
  },
  {
    id: 'overtime-12',
    message: '밤늦게까지\n남아야 할 것 같아요',
    subMessage: '체력 관리가 필요한 날이에요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * OVERTIME_MESSAGES.length);
  return OVERTIME_MESSAGES[randomIndex];
};
