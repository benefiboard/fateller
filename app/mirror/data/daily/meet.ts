export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const MEET_MESSAGES: MirrorMessage[] = [
  {
    id: 'meet-1',
    message: '운명같은 만남이\n기다리고 있어요',
    subMessage: '특별한 인연을 만날 수 있어요',
  },
  {
    id: 'meet-2',
    message: '기다리던 그 사람을\n만날 것 같아요',
    subMessage: '오늘은 평소와 다른 길로 가보세요',
  },
  {
    id: 'meet-3',
    message: '새로운 인연이\n다가올 거예요',
    subMessage: '좋은 사람과의 만남이 있어요',
  },
  {
    id: 'meet-4',
    message: '의미있는 만남이\n이루어질 거예요',
    subMessage: '주변을 잘 살펴보세요',
  },
  {
    id: 'meet-5',
    message: '오늘은 좋은 인연이\n생길 것 같아요',
    subMessage: '열린 마음으로 대화해보세요',
  },
  {
    id: 'meet-6',
    message: '특별한 만남이\n준비되어 있어요',
    subMessage: '기대하지 않은 장소에서 만날 수 있어요',
  },
  {
    id: 'meet-7',
    message: '평범한 만남이\n이어질 것 같아요',
    subMessage: '특별한 일은 없을 것 같네요',
  },
  {
    id: 'meet-8',
    message: '오늘은 혼자만의\n시간을 가지세요',
    subMessage: '때로는 홀로 있는 것도 좋아요',
  },
  {
    id: 'meet-9',
    message: '지금은 만남을\n기대하긴 이르네요',
    subMessage: '조금 더 기다려보는 게 좋겠어요',
  },
  {
    id: 'meet-10',
    message: '오늘은 만남이\n좋지 않을 것 같아요',
    subMessage: '약속은 다음으로 미뤄보세요',
  },
  {
    id: 'meet-11',
    message: '원치 않는 만남이\n생길 수 있어요',
    subMessage: '불편한 자리는 피하는 게 좋겠어요',
  },
  {
    id: 'meet-12',
    message: '피하고 싶은 사람과\n마주칠 수 있어요',
    subMessage: '평소 다니지 않는 길로 가보세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * MEET_MESSAGES.length);
  return MEET_MESSAGES[randomIndex];
};
