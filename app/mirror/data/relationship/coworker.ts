export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const COWORKER_MESSAGES: MirrorMessage[] = [
  {
    id: 'coworker-1',
    message: '든든한 동료가\n될 것 같아요',
    subMessage: '서로 의지할 수 있는 사이가 돼요',
  },
  {
    id: 'coworker-2',
    message: '업무적 시너지가\n날 것 같아요',
    subMessage: '함께하면 더 좋은 결과가 있어요',
  },
  {
    id: 'coworker-3',
    message: '서로를 이해하는\n좋은 동료가 돼요',
    subMessage: '신뢰할 수 있는 관계가 될 거예요',
  },
  {
    id: 'coworker-4',
    message: '좋은 친구이자\n동료가 될 거예요',
    subMessage: '의미 있는 인연이 될 것 같아요',
  },
  {
    id: 'coworker-5',
    message: '서로에게 도움이\n되는 사이가 돼요',
    subMessage: '함께 성장할 수 있어요',
  },
  {
    id: 'coworker-6',
    message: '믿을 수 있는\n동료가 생길 거예요',
    subMessage: '서로 의지하며 일할 수 있어요',
  },
  {
    id: 'coworker-7',
    message: '적당한 거리를\n유지하는 게 좋아요',
    subMessage: '업무적인 관계가 좋겠어요',
  },
  {
    id: 'coworker-8',
    message: '지금처럼만\n지내는 게 좋겠어요',
    subMessage: '더 가까워질 필요는 없어요',
  },
  {
    id: 'coworker-9',
    message: '선을 지키면서\n지내야 할 것 같아요',
    subMessage: '동료로만 남는 게 좋겠어요',
  },
  {
    id: 'coworker-10',
    message: '친해지면 후에\n문제가 생길 수 있어요',
    subMessage: '업무에만 집중하세요',
  },
  {
    id: 'coworker-11',
    message: '사적인 친분은\n피하는 게 좋겠어요',
    subMessage: '불필요한 오해가 생길 수 있어요',
  },
  {
    id: 'coworker-12',
    message: '거리를 두지 않으면\n후회할 수 있어요',
    subMessage: 'professional하게 지내세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * COWORKER_MESSAGES.length);
  return COWORKER_MESSAGES[randomIndex];
};
