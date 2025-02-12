export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const TRAVEL_MESSAGES: MirrorMessage[] = [
  {
    id: 'travel-1',
    message: '특별한 추억을\n만들 수 있는 곳이 있어요',
    subMessage: '잊지 못할 여행이 될 거예요',
  },
  {
    id: 'travel-2',
    message: '근교에 숨겨진\n명소를 발견할 거예요',
    subMessage: '색다른 경험이 기다리고 있어요',
  },
  {
    id: 'travel-3',
    message: '여행지에서 행운이\n따를 것 같아요',
    subMessage: '즐거운 일이 가득할 거예요',
  },
  {
    id: 'travel-4',
    message: '새로운 장소에서\n영감을 얻을 거예요',
    subMessage: '기대 이상으로 만족스러울 거예요',
  },
  {
    id: 'travel-5',
    message: '좋은 사람들과\n함께하는 여행이 될 거예요',
    subMessage: '즐거운 동행이 기다려요',
  },
  {
    id: 'travel-6',
    message: '날씨도 좋고\n교통도 편할 거예요',
    subMessage: '모든 것이 순조로울 거예요',
  },
  {
    id: 'travel-7',
    message: '멀리 가기보단\n근처를 둘러보세요',
    subMessage: '가까운 곳에도 볼거리가 많아요',
  },
  {
    id: 'travel-8',
    message: '무리한 계획은\n피하는 게 좋겠어요',
    subMessage: '여유롭게 준비하세요',
  },
  {
    id: 'travel-9',
    message: '다음 주말로\n미뤄보는 건 어때요',
    subMessage: '이번 주는 조금 바쁠 수 있어요',
  },
  {
    id: 'travel-10',
    message: '날씨가 좋지\n않을 것 같아요',
    subMessage: '실내 활동을 추천해요',
  },
  {
    id: 'travel-11',
    message: '교통이 많이\n막힐 것 같아요',
    subMessage: '멀리 가는 건 피하는 게 좋겠어요',
  },
  {
    id: 'travel-12',
    message: '여행 경비가\n부담될 수 있어요',
    subMessage: '지출을 줄이는 게 현명해요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * TRAVEL_MESSAGES.length);
  return TRAVEL_MESSAGES[randomIndex];
};
