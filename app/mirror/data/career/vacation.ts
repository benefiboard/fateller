export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const VACATION_MESSAGES: MirrorMessage[] = [
  {
    id: 'vacation-1',
    message: '지금이 연차 쓰기\n가장 좋은 타이밍이에요',
    subMessage: '눈치 보지 말고 신청하세요',
  },
  {
    id: 'vacation-2',
    message: '휴식이 꼭 필요한\n시기가 왔어요',
    subMessage: '재충전의 기회를 놓치지 마세요',
  },
  {
    id: 'vacation-3',
    message: '당신의 휴가를\n모두가 이해할 거예요',
    subMessage: '마음 편히 쉬다 오세요',
  },
  {
    id: 'vacation-4',
    message: '연차를 쓰면\n좋은 일이 생길 거예요',
    subMessage: '특별한 하루가 될 것 같아요',
  },
  {
    id: 'vacation-5',
    message: '쉬어가는 용기가\n필요한 때예요',
    subMessage: '휴식도 업무의 일부예요',
  },
  {
    id: 'vacation-6',
    message: '휴가 후에 더 큰\n성과가 있을 거예요',
    subMessage: '재충전이 꼭 필요한 시기예요',
  },
  {
    id: 'vacation-7',
    message: '다음 주로\n미뤄보는 건 어떨까요',
    subMessage: '조금 더 고민해보세요',
  },
  {
    id: 'vacation-8',
    message: '팀 일정을 먼저\n체크해보세요',
    subMessage: '동료들과 상의해보는 게 좋겠어요',
  },
  {
    id: 'vacation-9',
    message: '하루만 써도\n충분할 것 같아요',
    subMessage: '길게 쉴 필요는 없어 보여요',
  },
  {
    id: 'vacation-10',
    message: '지금은 휴가보다\n업무가 중요해요',
    subMessage: '나중에 기회가 있을 거예요',
  },
  {
    id: 'vacation-11',
    message: '연차를 쓰면\n오히려 스트레스예요',
    subMessage: '복귀했을 때 일이 쌓여있을 거예요',
  },
  {
    id: 'vacation-12',
    message: '지금 연차는\n불이익이 될 수 있어요',
    subMessage: '중요한 일을 놓칠 수 있어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * VACATION_MESSAGES.length);
  return VACATION_MESSAGES[randomIndex];
};
