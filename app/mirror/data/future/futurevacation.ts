export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const FUTURE_VACATION_MESSAGES: MirrorMessage[] = [
  {
    id: 'future-vacation-1',
    message: '잊지 못할 추억을\n만들 수 있어요',
    subMessage: '특별한 여행이 될 거예요',
  },
  {
    id: 'future-vacation-2',
    message: '여행지에서 행운이\n가득할 것 같아요',
    subMessage: '기대 이상의 경험을 하게 될 거예요',
  },
  {
    id: 'future-vacation-3',
    message: '새로운 인연이\n기다리고 있어요',
    subMessage: '의미있는 만남이 있을 거예요',
  },
  {
    id: 'future-vacation-4',
    message: '여행 경비가\n예상보다 절약돼요',
    subMessage: '알뜰하게 잘 다녀올 수 있어요',
  },
  {
    id: 'future-vacation-5',
    message: '날씨도 컨디션도\n최상일 거예요',
    subMessage: '완벽한 여행이 될 것 같아요',
  },
  {
    id: 'future-vacation-6',
    message: '인생샷을 건질\n기회가 많아요',
    subMessage: '멋진 순간들이 기다리고 있어요',
  },
  {
    id: 'future-vacation-7',
    message: '국내여행도 충분히\n매력적일 거예요',
    subMessage: '가까운 곳의 즐거움을 찾아보세요',
  },
  {
    id: 'future-vacation-8',
    message: '여행 계획을 더\n구체화해보세요',
    subMessage: '준비가 부족할 수 있어요',
  },
  {
    id: 'future-vacation-9',
    message: '시기를 조금 더\n고민해보세요',
    subMessage: '더 좋은 기회가 있을 거예요',
  },
  {
    id: 'future-vacation-10',
    message: '예상보다 많은\n비용이 들 것 같아요',
    subMessage: '가벼운 여행을 추천해요',
  },
  {
    id: 'future-vacation-11',
    message: '컨디션이 좋지\n않을 수 있어요',
    subMessage: '무리한 일정은 피하세요',
  },
  {
    id: 'future-vacation-12',
    message: '지금은 해외여행이\n위험할 수 있어요',
    subMessage: '안전을 우선으로 생각하세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * FUTURE_VACATION_MESSAGES.length);
  return FUTURE_VACATION_MESSAGES[randomIndex];
};
