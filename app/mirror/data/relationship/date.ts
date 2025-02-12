export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const DATE_MESSAGES: MirrorMessage[] = [
  {
    id: 'date-1',
    message: '운명 같은 만남이\n시작될 것 같아요',
    subMessage: '특별한 인연이 될 수 있어요',
  },
  {
    id: 'date-2',
    message: '서로에게 반한\n순간이 있을 거예요',
    subMessage: '첫눈에 호감이 생길 것 같아요',
  },
  {
    id: 'date-3',
    message: '즐거운 대화가\n이어질 것 같아요',
    subMessage: '대화가 잘 통할 거예요',
  },
  {
    id: 'date-4',
    message: '오늘의 만남이\n특별해질 거예요',
    subMessage: '기대 이상으로 좋을 것 같아요',
  },
  {
    id: 'date-5',
    message: '서로의 매력을\n발견하게 될 거예요',
    subMessage: '자연스럽게 마음이 통할 거예요',
  },
  {
    id: 'date-6',
    message: '두근두근한 만남이\n기다리고 있어요',
    subMessage: '설레는 시간이 될 거예요',
  },
  {
    id: 'date-7',
    message: '평범한 만남이\n될 것 같아요',
    subMessage: '너무 큰 기대는 하지 마세요',
  },
  {
    id: 'date-8',
    message: '서로를 판단하기엔\n이른 것 같아요',
    subMessage: '천천히 알아가보세요',
  },
  {
    id: 'date-9',
    message: '가볍게 만남을\n즐기는 게 좋겠어요',
    subMessage: '부담 없이 대화해보세요',
  },
  {
    id: 'date-10',
    message: '서로의 기대가\n다를 수 있어요',
    subMessage: '실망하지 않도록 주의하세요',
  },
  {
    id: 'date-11',
    message: '오늘은 컨디션이\n좋지 않을 수 있어요',
    subMessage: '다음으로 미루는 게 어떨까요?',
  },
  {
    id: 'date-12',
    message: '이번 소개팅은\n맞지 않을 것 같아요',
    subMessage: '억지로 마음 쓰지 마세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * DATE_MESSAGES.length);
  return DATE_MESSAGES[randomIndex];
};
