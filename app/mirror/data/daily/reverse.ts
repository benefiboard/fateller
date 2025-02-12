export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const REVERSE_MESSAGES: MirrorMessage[] = [
  {
    id: 'reverse-1',
    message: '위기가 기회로\n바뀔 것 같아요',
    subMessage: '반전의 기회가 찾아올 거예요',
  },
  {
    id: 'reverse-2',
    message: '곧 상황이\n좋아질 거예요',
    subMessage: '긍정적인 변화가 시작될 것 같아요',
  },
  {
    id: 'reverse-3',
    message: '뜻밖의 행운이\n찾아올 거예요',
    subMessage: '실수가 오히려 기회가 될 수 있어요',
  },
  {
    id: 'reverse-4',
    message: '놀라운 반전이\n기다리고 있어요',
    subMessage: '예상치 못한 즐거움이 찾아와요',
  },
  {
    id: 'reverse-5',
    message: '지금의 고난은\n축복이 될 거예요',
    subMessage: '좋은 결과가 기다리고 있어요',
  },
  {
    id: 'reverse-6',
    message: '역전의 기회가\n눈앞에 있어요',
    subMessage: '포기하지 않으면 이룰 수 있어요',
  },
  {
    id: 'reverse-7',
    message: '상황이 크게\n변하진 않아요',
    subMessage: '지금 이대로 유지될 것 같네요',
  },
  {
    id: 'reverse-8',
    message: '아직은 결과를\n알 수 없어요',
    subMessage: '조금 더 지켜봐야 할 것 같아요',
  },
  {
    id: 'reverse-9',
    message: '시간이 좀 더\n필요할 것 같아요',
    subMessage: '당장은 변화가 없을 것 같네요',
  },
  {
    id: 'reverse-10',
    message: '상황이 더\n나빠질 수 있어요',
    subMessage: '마음의 준비가 필요해요',
  },
  {
    id: 'reverse-11',
    message: '지금은 희망적\n결과를 기대하긴 힘들어요',
    subMessage: '현실을 직시해야 할 때예요',
  },
  {
    id: 'reverse-12',
    message: '이번에는 역전이\n어려울 것 같아요',
    subMessage: '다음 기회를 기다려보세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * REVERSE_MESSAGES.length);
  return REVERSE_MESSAGES[randomIndex];
};
