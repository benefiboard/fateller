export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const MOVING_MESSAGES: MirrorMessage[] = [
  {
    id: 'moving-1',
    message: '좋은 집이\n기다리고 있어요',
    subMessage: '행운이 가득한 보금자리를 만날 거예요',
  },
  {
    id: 'moving-2',
    message: '이사 후에 좋은\n변화가 찾아올 거예요',
    subMessage: '새로운 시작이 행복을 가져와요',
  },
  {
    id: 'moving-3',
    message: '조건에 딱 맞는\n집을 발견할 거예요',
    subMessage: '찾던 조건의 집이 나타날 거예요',
  },
  {
    id: 'moving-4',
    message: '이사와 함께\n운도 좋아질 거예요',
    subMessage: '긍정적인 변화가 시작될 거예요',
  },
  {
    id: 'moving-5',
    message: '지금이 이사하기\n가장 좋은 시기예요',
    subMessage: '망설이지 말고 시작해보세요',
  },
  {
    id: 'moving-6',
    message: '마음에 쏙 드는\n집을 찾을 거예요',
    subMessage: '기대 이상의 결과가 있을 거예요',
  },
  {
    id: 'moving-7',
    message: '시간을 두고\n알아보는 게 좋겠어요',
    subMessage: '서두르지 말고 천천히 결정하세요',
  },
  {
    id: 'moving-8',
    message: '현재 집에서도\n충분히 좋아요',
    subMessage: '지금 이사는 조금 이른 것 같아요',
  },
  {
    id: 'moving-9',
    message: '조금 더 시세를\n지켜보는 게 좋겠어요',
    subMessage: '다음 기회를 노려보세요',
  },
  {
    id: 'moving-10',
    message: '지금 이사하면\n손해볼 수 있어요',
    subMessage: '시기가 좋지 않아요',
  },
  {
    id: 'moving-11',
    message: '예상치 못한 문제가\n생길 수 있어요',
    subMessage: '이사 계획을 재검토해보세요',
  },
  {
    id: 'moving-12',
    message: '지금 이사는\n걱정이 많아요',
    subMessage: '더 나은 때를 기다리세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * MOVING_MESSAGES.length);
  return MOVING_MESSAGES[randomIndex];
};
