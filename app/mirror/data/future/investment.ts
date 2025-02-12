export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const INVESTMENT_MESSAGES: MirrorMessage[] = [
  {
    id: 'investment-1',
    message: '지금이 시작하기\n가장 좋은 시기예요',
    subMessage: '투자 감각이 돋보일 거예요',
  },
  {
    id: 'investment-2',
    message: '좋은 수익률을\n기대할 수 있어요',
    subMessage: '현명한 판단력이 빛을 발할 거예요',
  },
  {
    id: 'investment-3',
    message: '재테크의 즐거움을\n알게 될 거예요',
    subMessage: '투자가 취미가 될 수 있어요',
  },
  {
    id: 'investment-4',
    message: '의미있는 수익을\n얻을 수 있어요',
    subMessage: '안정적인 성장이 기대돼요',
  },
  {
    id: 'investment-5',
    message: '전문가의 조언을\n얻을 수 있어요',
    subMessage: '좋은 정보를 접하게 될 거예요',
  },
  {
    id: 'investment-6',
    message: '재무 관리 능력이\n크게 향상될 거예요',
    subMessage: '노하우가 쌓이는 시기예요',
  },
  {
    id: 'investment-7',
    message: '충분히 공부하고\n시작하는 게 좋겠어요',
    subMessage: '기초부터 차근차근 배워보세요',
  },
  {
    id: 'investment-8',
    message: '소액부터 시작하는\n게 안전할 것 같아요',
    subMessage: '리스크 관리가 중요해요',
  },
  {
    id: 'investment-9',
    message: '조금 더 시장을\n지켜보는 게 좋겠어요',
    subMessage: '성급한 결정은 피하세요',
  },
  {
    id: 'investment-10',
    message: '지금 시작하면\n위험할 수 있어요',
    subMessage: '시기가 좋지 않아요',
  },
  {
    id: 'investment-11',
    message: '손실을 볼\n가능성이 커요',
    subMessage: '더 많은 준비가 필요해요',
  },
  {
    id: 'investment-12',
    message: '투자보다 저축이\n안전할 것 같아요',
    subMessage: '보수적으로 접근하는 게 좋겠어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * INVESTMENT_MESSAGES.length);
  return INVESTMENT_MESSAGES[randomIndex];
};
