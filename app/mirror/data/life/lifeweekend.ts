export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const LIFE_WEEKEND_MESSAGES: MirrorMessage[] = [
  {
    id: 'life-weekend-1',
    message: '특별한 추억을\n만들 수 있는 주말이에요',
    subMessage: '행복한 시간이 기다리고 있어요',
  },
  {
    id: 'life-weekend-2',
    message: '친구들과의 만남이\n즐거울 것 같아요',
    subMessage: '설레는 약속이 생길 거예요',
  },
  {
    id: 'life-weekend-3',
    message: '색다른 경험이\n기다리고 있어요',
    subMessage: '새로운 도전을 시도해보세요',
  },
  {
    id: 'life-weekend-4',
    message: '근교로 떠나면\n행운이 따를 거예요',
    subMessage: '짧은 여행도 특별할 수 있어요',
  },
  {
    id: 'life-weekend-5',
    message: '취미 생활이\n즐거움을 줄 거예요',
    subMessage: '관심 분야를 탐구해보세요',
  },
  {
    id: 'life-weekend-6',
    message: '문화생활이\n영감을 줄 것 같아요',
    subMessage: '전시나 공연을 찾아보세요',
  },
  {
    id: 'life-weekend-7',
    message: '조용한 휴식도\n나쁘지 않아요',
    subMessage: '집에서 보내는 시간도 좋겠어요',
  },
  {
    id: 'life-weekend-8',
    message: '특별한 계획 없이\n즐기는 것도 좋아요',
    subMessage: '여유로운 시간을 가져보세요',
  },
  {
    id: 'life-weekend-9',
    message: '할 일을 미리\n정리해두면 좋겠어요',
    subMessage: '계획적인 주말을 보내세요',
  },
  {
    id: 'life-weekend-10',
    message: '무리한 계획은\n피하는 게 좋겠어요',
    subMessage: '피곤이 쌓일 수 있어요',
  },
  {
    id: 'life-weekend-11',
    message: '약속을 잡으면\n후회할 수 있어요',
    subMessage: '혼자만의 시간이 필요해요',
  },
  {
    id: 'life-weekend-12',
    message: '바쁜 일정은\n스트레스가 될 거예요',
    subMessage: '조용히 쉬는 게 좋겠어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * LIFE_WEEKEND_MESSAGES.length);
  return LIFE_WEEKEND_MESSAGES[randomIndex];
};
