export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const PROMOTION_MESSAGES: MirrorMessage[] = [
  {
    id: 'promotion-1',
    message: '승진의 기회가\n코앞에 있어요',
    subMessage: '당신의 능력을 인정받을 거예요',
  },
  {
    id: 'promotion-2',
    message: '예상보다 빠르게\n기회가 올 거예요',
    subMessage: '준비해온 실력을 보여주세요',
  },
  {
    id: 'promotion-3',
    message: '노력한 만큼\n보상받을 때예요',
    subMessage: '좋은 소식이 기다리고 있어요',
  },
  {
    id: 'promotion-4',
    message: '숨겨진 능력을\n발휘할 기회예요',
    subMessage: '당신의 진가를 보여주세요',
  },
  {
    id: 'promotion-5',
    message: '승진과 함께\n큰 발전이 있을 거예요',
    subMessage: '새로운 도약의 기회예요',
  },
  {
    id: 'promotion-6',
    message: '주변의 추천으로\n기회가 올 수 있어요',
    subMessage: '좋은 평판이 빛을 발할 거예요',
  },
  {
    id: 'promotion-7',
    message: '조금 더 시간이\n필요할 것 같아요',
    subMessage: '차근차근 준비하세요',
  },
  {
    id: 'promotion-8',
    message: '아직은 때가\n아닌 것 같아요',
    subMessage: '현재 위치에서 더 성장하세요',
  },
  {
    id: 'promotion-9',
    message: '큰 기대는\n하지 않는 게 좋겠어요',
    subMessage: '현실적으로 바라보세요',
  },
  {
    id: 'promotion-10',
    message: '이번에는 기회가\n없을 것 같아요',
    subMessage: '다음을 기약하는 게 좋겠어요',
  },
  {
    id: 'promotion-11',
    message: '승진을 기대하면\n실망할 수 있어요',
    subMessage: '지금은 실력을 쌓는 데 집중하세요',
  },
  {
    id: 'promotion-12',
    message: '오히려 불이익이\n생길 수 있어요',
    subMessage: '조급해하지 말고 때를 기다리세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * PROMOTION_MESSAGES.length);
  return PROMOTION_MESSAGES[randomIndex];
};
