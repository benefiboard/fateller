export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const MOOD_MESSAGES: MirrorMessage[] = [
  {
    id: 'mood-1',
    message: '오늘의 좋은 기분이\n특별한 행운이 될 거예요',
    subMessage: '긍정적인 에너지가 행운을 부를 거예요',
  },
  {
    id: 'mood-2',
    message: '설레는 마음이\n좋은 예감으로 이어질 거예요',
    subMessage: '기분 좋은 변화가 시작될 것 같아요',
  },
  {
    id: 'mood-3',
    message: '지금 이 기분\n오래 간직하세요',
    subMessage: '행복한 순간이 더 찾아올 거예요',
  },
  {
    id: 'mood-4',
    message: '기분 좋은 날\n행운도 함께할 거예요',
    subMessage: '기대하던 소식을 들을 수 있어요',
  },
  {
    id: 'mood-5',
    message: '즐거운 마음이\n좋은 인연을 이끌어요',
    subMessage: '새로운 만남이 기다리고 있어요',
  },
  {
    id: 'mood-6',
    message: '밝은 에너지가\n기회를 만들어요',
    subMessage: '당신의 긍정이 행운이 됩니다',
  },
  {
    id: 'mood-7',
    message: '오늘의 기분\n그저 그런 하루가 될 거예요',
    subMessage: '특별할 것 없는 평범한 하루네요',
  },
  {
    id: 'mood-8',
    message: '지금의 기분은\n일시적일 수 있어요',
    subMessage: '너무 들뜨지 말고 차분히 지내보세요',
  },
  {
    id: 'mood-9',
    message: '기분과는 다르게\n평범한 하루예요',
    subMessage: '과한 기대는 실망이 될 수 있어요',
  },
  {
    id: 'mood-10',
    message: '좋은 기분도 잠시\n곧 흐려질 수 있어요',
    subMessage: '현실적인 기대가 필요한 날이에요',
  },
  {
    id: 'mood-11',
    message: '기분과 달리\n안 좋은 일이 생길 수 있어요',
    subMessage: '방심하지 말고 조심하세요',
  },
  {
    id: 'mood-12',
    message: '과한 기대는\n실망으로 이어질 수 있어요',
    subMessage: '차분히 마음을 가라앉혀보세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * MOOD_MESSAGES.length);
  return MOOD_MESSAGES[randomIndex];
};
