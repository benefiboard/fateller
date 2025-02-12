export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const YOUTUBE_MESSAGES: MirrorMessage[] = [
  {
    id: 'youtube-1',
    message: '당신만의 매력으로\n인기를 얻을 거예요',
    subMessage: '독특한 콘텐츠로 주목받을 수 있어요',
  },
  {
    id: 'youtube-2',
    message: '예상보다 빠르게\n성장할 수 있어요',
    subMessage: '잠재력이 폭발할 것 같아요',
  },
  {
    id: 'youtube-3',
    message: '특별한 재능을\n발견하게 될 거예요',
    subMessage: '숨겨진 끼를 발산할 수 있어요',
  },
  {
    id: 'youtube-4',
    message: '구독자가 꾸준히\n늘어날 것 같아요',
    subMessage: '열심히 하면 좋은 결과가 있어요',
  },
  {
    id: 'youtube-5',
    message: '수익으로 이어질\n기회가 올 거예요',
    subMessage: '취미가 직업이 될 수 있어요',
  },
  {
    id: 'youtube-6',
    message: '팬들과 특별한\n인연이 생길 거예요',
    subMessage: '의미있는 소통이 가능할 거예요',
  },
  {
    id: 'youtube-7',
    message: '철저한 계획이\n필요할 것 같아요',
    subMessage: '준비를 꼼꼼히 하세요',
  },
  {
    id: 'youtube-8',
    message: '가벼운 마음으로\n시작해보세요',
    subMessage: '부담 갖지 말고 시도해보세요',
  },
  {
    id: 'youtube-9',
    message: '콘텐츠 방향을\n더 고민해보세요',
    subMessage: '차별화 전략이 필요해요',
  },
  {
    id: 'youtube-10',
    message: '지금은 시기가\n적절하지 않아요',
    subMessage: '더 많은 준비가 필요해요',
  },
  {
    id: 'youtube-11',
    message: '시작하면 부담감이\n클 것 같아요',
    subMessage: '스트레스를 잘 견딜 수 있을까요?',
  },
  {
    id: 'youtube-12',
    message: '기대만큼 성과가\n나지 않을 수 있어요',
    subMessage: '현실적인 고민이 필요해요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * YOUTUBE_MESSAGES.length);
  return YOUTUBE_MESSAGES[randomIndex];
};
