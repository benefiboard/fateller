export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const CAREER_COWORKER_MESSAGES: MirrorMessage[] = [
  {
    id: 'career-coworker-1',
    message: '먼저 사과하면\n관계가 더 좋아질 거예요',
    subMessage: '갈등이 오히려 기회가 될 수 있어요',
  },
  {
    id: 'career-coworker-2',
    message: '한 걸음 물러서면\n두 걸음 전진할 수 있어요',
    subMessage: '현명한 판단이 될 거예요',
  },
  {
    id: 'career-coworker-3',
    message: '배려하는 모습이\n좋은 평가를 받을 거예요',
    subMessage: '큰 사람이 되는 기회예요',
  },
  {
    id: 'career-coworker-4',
    message: '먼저 다가가면\n서로 이해하게 될 거예요',
    subMessage: '대화로 풀 수 있어요',
  },
  {
    id: 'career-coworker-5',
    message: '화해의 시도가\n인정받을 거예요',
    subMessage: '동료의 마음도 열릴 거예요',
  },
  {
    id: 'career-coworker-6',
    message: '용기 있는 선택이\n관계 개선의 열쇠예요',
    subMessage: '지금이 사과하기 좋은 때예요',
  },
  {
    id: 'career-coworker-7',
    message: '시간이 해결해줄\n문제일 수 있어요',
    subMessage: '조금 더 지켜보는 게 어떨까요',
  },
  {
    id: 'career-coworker-8',
    message: '서로 진정할\n시간이 필요해요',
    subMessage: '감정이 가라앉길 기다려보세요',
  },
  {
    id: 'career-coworker-9',
    message: '지금은 중립적\n태도를 유지하세요',
    subMessage: '상황을 지켜보는 게 좋겠어요',
  },
  {
    id: 'career-coworker-10',
    message: '먼저 사과하면\n약점이 될 수 있어요',
    subMessage: '입장을 분명히 하는 게 좋겠어요',
  },
  {
    id: 'career-coworker-11',
    message: '지금 사과는\n시기상조일 수 있어요',
    subMessage: '오히려 문제가 커질 수 있어요',
  },
  {
    id: 'career-coworker-12',
    message: '굽히면 더 큰\n갈등이 생길 수 있어요',
    subMessage: '원칙을 지키는 게 현명해요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * CAREER_COWORKER_MESSAGES.length);
  return CAREER_COWORKER_MESSAGES[randomIndex];
};
