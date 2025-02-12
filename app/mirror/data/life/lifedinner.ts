export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const LIFE_DINNER_MESSAGES: MirrorMessage[] = [
  {
    id: 'life-dinner-1',
    message: '밖에서 먹으면\n좋은 인연을 만날 거예요',
    subMessage: '특별한 만남이 기다리고 있어요',
  },
  {
    id: 'life-dinner-2',
    message: '새로 생긴 맛집을\n발견할 수 있어요',
    subMessage: '잊지 못할 맛있는 저녁이 될 거예요',
  },
  {
    id: 'life-dinner-3',
    message: '오늘은 밖에서\n먹는 게 좋을 것 같아요',
    subMessage: '행운이 따르는 저녁이 될 거예요',
  },
  {
    id: 'life-dinner-4',
    message: '배달음식이 특별히\n맛있을 것 같아요',
    subMessage: '편안한 저녁을 즐기세요',
  },
  {
    id: 'life-dinner-5',
    message: '집에서 먹어도\n행복한 저녁이 될 거예요',
    subMessage: '배달음식으로 기분 전환하세요',
  },
  {
    id: 'life-dinner-6',
    message: '혼밥도 오늘은\n특별하게 느껴질 거예요',
    subMessage: '맛있는 음식이 기다리고 있어요',
  },
  {
    id: 'life-dinner-7',
    message: '크게 고민하지 말고\n결정하세요',
    subMessage: '어떤 선택이든 평범한 저녁이 될 거예요',
  },
  {
    id: 'life-dinner-8',
    message: '음식보다 편안함을\n선택하는 게 좋겠어요',
    subMessage: '휴식이 필요한 때예요',
  },
  {
    id: 'life-dinner-9',
    message: '오늘은 가벼운\n저녁을 추천해요',
    subMessage: '소박하게 먹어보세요',
  },
  {
    id: 'life-dinner-10',
    message: '밖에 나가면\n피곤해질 수 있어요',
    subMessage: '배달을 시키는 게 현명해요',
  },
  {
    id: 'life-dinner-11',
    message: '음식점은 사람이\n많을 것 같아요',
    subMessage: '기다리느라 시간을 낭비할 수 있어요',
  },
  {
    id: 'life-dinner-12',
    message: '밖에서 먹으면\n후회할 수 있어요',
    subMessage: '오늘은 집에서 쉬세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * LIFE_DINNER_MESSAGES.length);
  return LIFE_DINNER_MESSAGES[randomIndex];
};
