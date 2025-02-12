export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const CHALLENGE_MESSAGES: MirrorMessage[] = [
  {
    id: 'challenge-1',
    message: '도전의 결과는\n성공적일 거예요',
    subMessage: '용기 있는 선택이 행운을 부를 거예요',
  },
  {
    id: 'challenge-2',
    message: '새로운 길에서\n빛날 수 있어요',
    subMessage: '당신의 재능이 꽃필 거예요',
  },
  {
    id: 'challenge-3',
    message: '변화는 성장의\n기회가 될 거예요',
    subMessage: '더 나은 미래가 기다리고 있어요',
  },
  {
    id: 'challenge-4',
    message: '두려움을 떨치면\n길이 보일 거예요',
    subMessage: '용기를 내볼 만한 때예요',
  },
  {
    id: 'challenge-5',
    message: '도전이 큰 성취로\n이어질 것 같아요',
    subMessage: '지금의 선택을 후회하지 않을 거예요',
  },
  {
    id: 'challenge-6',
    message: '새로운 시작이\n행운을 가져올 거예요',
    subMessage: '걱정했던 것보다 잘될 거예요',
  },
  {
    id: 'challenge-7',
    message: '조금 더 고민이\n필요할 것 같아요',
    subMessage: '신중하게 결정하는 게 좋겠어요',
  },
  {
    id: 'challenge-8',
    message: '지금은 때를\n기다려야 할 것 같아요',
    subMessage: '조급해하지 마세요',
  },
  {
    id: 'challenge-9',
    message: '현실적인 계획이\n필요할 것 같아요',
    subMessage: '준비가 더 필요해 보여요',
  },
  {
    id: 'challenge-10',
    message: '지금 도전은\n시기상조일 수 있어요',
    subMessage: '더 많은 준비가 필요해요',
  },
  {
    id: 'challenge-11',
    message: '실패의 위험이\n너무 커 보여요',
    subMessage: '안정적인 길을 선택하세요',
  },
  {
    id: 'challenge-12',
    message: '지금 변화는\n위험할 수 있어요',
    subMessage: '현재 위치를 지키는 게 현명해요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * CHALLENGE_MESSAGES.length);
  return CHALLENGE_MESSAGES[randomIndex];
};
