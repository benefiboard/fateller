export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const FUTURE_MESSAGES: MirrorMessage[] = [
  {
    id: 'future-1',
    message: '관계가 더욱\n깊어질 것 같아요',
    subMessage: '서로에 대한 마음이 커질 거예요',
  },
  {
    id: 'future-2',
    message: '특별한 인연으로\n발전할 수 있어요',
    subMessage: '의미 있는 관계가 될 거예요',
  },
  {
    id: 'future-3',
    message: '서로를 이해하며\n성장할 수 있어요',
    subMessage: '함께하면 더 행복해질 거예요',
  },
  {
    id: 'future-4',
    message: '믿음직한 동반자가\n될 것 같아요',
    subMessage: '서로에게 힘이 되어줄 수 있어요',
  },
  {
    id: 'future-5',
    message: '평생 함께할\n인연이 될 거예요',
    subMessage: '운명 같은 사람일 수 있어요',
  },
  {
    id: 'future-6',
    message: '서로의 부족함을\n채워줄 수 있어요',
    subMessage: '완벽한 파트너가 될 거예요',
  },
  {
    id: 'future-7',
    message: '아직은 결과를\n예측하기 어려워요',
    subMessage: '시간을 두고 지켜보세요',
  },
  {
    id: 'future-8',
    message: '서두르지 말고\n천천히 생각해보세요',
    subMessage: '조급해할 필요 없어요',
  },
  {
    id: 'future-9',
    message: '기대가 너무\n큰 것 같아요',
    subMessage: '현실적으로 바라보세요',
  },
  {
    id: 'future-10',
    message: '지금 이 관계는\n오래가지 못할 거예요',
    subMessage: '마음의 준비를 하는 게 좋겠어요',
  },
  {
    id: 'future-11',
    message: '서로에게 상처만\n남길 것 같아요',
    subMessage: '빨리 정리하는 게 현명해요',
  },
  {
    id: 'future-12',
    message: '더 발전하면\n후회할 수 있어요',
    subMessage: '여기서 멈추는 게 좋겠어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * FUTURE_MESSAGES.length);
  return FUTURE_MESSAGES[randomIndex];
};
