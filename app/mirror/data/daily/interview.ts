export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const INTERVIEW_MESSAGES: MirrorMessage[] = [
  {
    id: 'interview-1',
    message: '합격의 기운이\n가득한 날이에요',
    subMessage: '자신감을 가지고 임하세요',
  },
  {
    id: 'interview-2',
    message: '면접관의 마음을\n사로잡을 거예요',
    subMessage: '당신의 매력이 빛날 거예요',
  },
  {
    id: 'interview-3',
    message: '준비한 만큼\n좋은 결과가 있어요',
    subMessage: '노력이 통할 것 같은 날이에요',
  },
  {
    id: 'interview-4',
    message: '오늘 면접은\n성공적일 거예요',
    subMessage: '당신의 장점이 잘 드러날 거예요',
  },
  {
    id: 'interview-5',
    message: '기회를 잡을\n완벽한 날이에요',
    subMessage: '좋은 인상을 남길 수 있어요',
  },
  {
    id: 'interview-6',
    message: '면접장의 분위기가\n좋을 것 같아요',
    subMessage: '편안한 마음으로 임하세요',
  },
  {
    id: 'interview-7',
    message: '평범한 면접이\n될 것 같아요',
    subMessage: '특별히 걱정할 일은 없어요',
  },
  {
    id: 'interview-8',
    message: '면접 결과는\n예측하기 어려워요',
    subMessage: '최선을 다하고 기다려보세요',
  },
  {
    id: 'interview-9',
    message: '더 많은 준비가\n필요할 것 같아요',
    subMessage: '다음 기회를 위해 공부하세요',
  },
  {
    id: 'interview-10',
    message: '예상치 못한 질문에\n긴장할 수 있어요',
    subMessage: '침착함을 유지하는 게 중요해요',
  },
  {
    id: 'interview-11',
    message: '오늘은 컨디션이\n좋지 않을 수 있어요',
    subMessage: '다음 기회를 노리는 게 좋겠어요',
  },
  {
    id: 'interview-12',
    message: '이번 면접은\n힘들 수 있어요',
    subMessage: '실패해도 좋은 경험이 될 거예요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * INTERVIEW_MESSAGES.length);
  return INTERVIEW_MESSAGES[randomIndex];
};
