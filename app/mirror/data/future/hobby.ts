export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const HOBBY_MESSAGES: MirrorMessage[] = [
  {
    id: 'hobby-1',
    message: '타고난 재능을\n발견할 수 있어요',
    subMessage: '숨겨진 적성을 찾을 거예요',
  },
  {
    id: 'hobby-2',
    message: '새로운 취미로\n인생이 바뀔 거예요',
    subMessage: '특별한 경험이 기다리고 있어요',
  },
  {
    id: 'hobby-3',
    message: '좋은 사람들과\n함께할 수 있어요',
    subMessage: '취미를 통해 인연이 생길 거예요',
  },
  {
    id: 'hobby-4',
    message: '시작하면 빠르게\n실력이 늘 거예요',
    subMessage: '생각보다 재미있을 거예요',
  },
  {
    id: 'hobby-5',
    message: '취미가 수입으로\n이어질 것 같아요',
    subMessage: '특기로 발전할 수 있어요',
  },
  {
    id: 'hobby-6',
    message: '새로운 도전이\n즐거움을 줄 거예요',
    subMessage: '활력이 넘치는 날들이 될 거예요',
  },
  {
    id: 'hobby-7',
    message: '조금 더 알아보고\n결정하는 게 좋겠어요',
    subMessage: '신중한 선택이 필요해요',
  },
  {
    id: 'hobby-8',
    message: '부담 없이 가벼운\n마음으로 시작해보세요',
    subMessage: '천천히 알아가보세요',
  },
  {
    id: 'hobby-9',
    message: '현재 취미를\n더 즐겨보는 건 어때요',
    subMessage: '새로운 것보다 익숙한 게 좋아요',
  },
  {
    id: 'hobby-10',
    message: '지금은 시작하기\n적절한 때가 아니에요',
    subMessage: '다른 걸 먼저 해보세요',
  },
  {
    id: 'hobby-11',
    message: '시작하면 흥미를\n잃기 쉬울 것 같아요',
    subMessage: '돈과 시간이 아까울 수 있어요',
  },
  {
    id: 'hobby-12',
    message: '준비가 부족하면\n실패할 수 있어요',
    subMessage: '더 많은 정보를 찾아보세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * HOBBY_MESSAGES.length);
  return HOBBY_MESSAGES[randomIndex];
};
