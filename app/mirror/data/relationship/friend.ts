export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const FRIEND_MESSAGES: MirrorMessage[] = [
  {
    id: 'friend-1',
    message: '오해가 풀리고\n더 가까워질 거예요',
    subMessage: '더 깊은 우정이 시작될 수 있어요',
  },
  {
    id: 'friend-2',
    message: '서로를 이해하는\n계기가 될 거예요',
    subMessage: '진정한 친구가 될 수 있어요',
  },
  {
    id: 'friend-3',
    message: '대화로 풀 수 있는\n문제일 거예요',
    subMessage: '마음을 열고 이야기해보세요',
  },
  {
    id: 'friend-4',
    message: '갈등이 오히려\n관계를 견고하게 해요',
    subMessage: '시간이 해결해줄 거예요',
  },
  {
    id: 'friend-5',
    message: '진심이 통해서\n화해하게 될 거예요',
    subMessage: '서로의 마음을 이해하게 돼요',
  },
  {
    id: 'friend-6',
    message: '우정이 더욱\n단단해질 것 같아요',
    subMessage: '위기가 기회가 될 수 있어요',
  },
  {
    id: 'friend-7',
    message: '잠시 거리를 두는 게\n좋을 것 같아요',
    subMessage: '시간이 해답이 될 수 있어요',
  },
  {
    id: 'friend-8',
    message: '서로에게 시간이\n필요할 것 같아요',
    subMessage: '천천히 생각해보세요',
  },
  {
    id: 'friend-9',
    message: '지금은 판단하기\n이른 것 같아요',
    subMessage: '감정이 가라앉길 기다려보세요',
  },
  {
    id: 'friend-10',
    message: '관계를 다시\n생각해봐야 할 거예요',
    subMessage: '신중한 판단이 필요해요',
  },
  {
    id: 'friend-11',
    message: '서로에게 상처주는\n관계가 될 수 있어요',
    subMessage: '거리를 두는 게 좋겠어요',
  },
  {
    id: 'friend-12',
    message: '이제는 작별을\n고민할 때가 됐어요',
    subMessage: '모든 만남엔 이별도 있죠',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * FRIEND_MESSAGES.length);
  return FRIEND_MESSAGES[randomIndex];
};
