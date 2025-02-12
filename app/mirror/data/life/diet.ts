export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const DIET_MESSAGES: MirrorMessage[] = [
  {
    id: 'diet-1',
    message: '오늘 시작하면\n목표 달성할 수 있어요',
    subMessage: '다이어트 성공이 보여요',
  },
  {
    id: 'diet-2',
    message: '결심한 만큼\n효과를 볼 거예요',
    subMessage: '의지가 강한 날이에요',
  },
  {
    id: 'diet-3',
    message: '오늘부터 시작해서\n큰 변화가 생길 거예요',
    subMessage: '꾸준히 할 수 있는 컨디션이에요',
  },
  {
    id: 'diet-4',
    message: '당신의 의지가\n빛을 발할 거예요',
    subMessage: '좋은 습관이 만들어질 거예요',
  },
  {
    id: 'diet-5',
    message: '지금 시작하면\n성과가 더 클 거예요',
    subMessage: '다이어트하기 좋은 날이에요',
  },
  {
    id: 'diet-6',
    message: '작은 실천이\n기적을 만들 거예요',
    subMessage: '긍정적인 변화가 시작될 거예요',
  },
  {
    id: 'diet-7',
    message: '천천히 준비하면서\n시작해보세요',
    subMessage: '서두르지 않아도 돼요',
  },
  {
    id: 'diet-8',
    message: '계획을 세우고\n시작하는 게 어때요',
    subMessage: '철저한 준비가 필요해요',
  },
  {
    id: 'diet-9',
    message: '조금 더 고민하고\n결정해도 좋아요',
    subMessage: '신중하게 생각해보세요',
  },
  {
    id: 'diet-10',
    message: '지금은 다이어트에\n적절한 때가 아니에요',
    subMessage: '컨디션이 좋지 않을 수 있어요',
  },
  {
    id: 'diet-11',
    message: '무리한 다이어트는\n역효과를 부를 거예요',
    subMessage: '지금은 건강관리에 집중하세요',
  },
  {
    id: 'diet-12',
    message: '지금 시작하면\n요요가 올 수 있어요',
    subMessage: '더 나은 타이밍을 기다리세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * DIET_MESSAGES.length);
  return DIET_MESSAGES[randomIndex];
};
