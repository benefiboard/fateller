export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const LOVE_MESSAGES: MirrorMessage[] = [
  {
    id: 'love-1',
    message: '곧 운명의 상대를\n만날 것 같아요',
    subMessage: '특별한 만남이 기다리고 있어요',
  },
  {
    id: 'love-2',
    message: '봄과 함께 새로운\n사랑이 찾아와요',
    subMessage: '설레는 만남이 시작될 거예요',
  },
  {
    id: 'love-3',
    message: '예상치 못한 곳에서\n인연이 다가와요',
    subMessage: '평소와 다른 곳을 둘러보세요',
  },
  {
    id: 'love-4',
    message: '이번 만남은\n특별할 것 같아요',
    subMessage: '오래 기다린 만큼 행복할 거예요',
  },
  {
    id: 'love-5',
    message: '당신의 매력이\n빛나는 시기예요',
    subMessage: '자신감을 가지고 시작해보세요',
  },
  {
    id: 'love-6',
    message: '진정한 사랑이\n시작될 것 같아요',
    subMessage: '기다림이 곧 보상받을 거예요',
  },
  {
    id: 'love-7',
    message: '조금 더 시간이\n필요할 것 같아요',
    subMessage: '천천히 준비하면서 기다리세요',
  },
  {
    id: 'love-8',
    message: '지금은 자기계발에\n집중해보세요',
    subMessage: '더 나은 나를 위한 시간이에요',
  },
  {
    id: 'love-9',
    message: '서두르지 말고\n차근차근 준비하세요',
    subMessage: '조급해하지 마세요',
  },
  {
    id: 'love-10',
    message: '지금 시작하면\n실패할 수 있어요',
    subMessage: '좀 더 기다리는 게 좋겠어요',
  },
  {
    id: 'love-11',
    message: '준비되지 않은\n시작은 위험해요',
    subMessage: '더 성장할 시간이 필요해요',
  },
  {
    id: 'love-12',
    message: '억지로 시작하면\n후회할 수 있어요',
    subMessage: '자연스러운 인연을 기다리세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * LOVE_MESSAGES.length);
  return LOVE_MESSAGES[randomIndex];
};
