export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const DINNER_MESSAGES: MirrorMessage[] = [
  {
    id: 'dinner-1',
    message: '좋은 인연이\n만들어질 자리예요',
    subMessage: '특별한 기회가 될 수 있어요',
  },
  {
    id: 'dinner-2',
    message: '팀워크가 한층\n돈독해질 거예요',
    subMessage: '즐거운 시간이 될 것 같아요',
  },
  {
    id: 'dinner-3',
    message: '좋은 정보를\n얻을 수 있어요',
    subMessage: '귀중한 자리가 될 거예요',
  },
  {
    id: 'dinner-4',
    message: '참석하면 좋은\n기회가 생길 거예요',
    subMessage: '인맥을 넓힐 수 있는 자리예요',
  },
  {
    id: 'dinner-5',
    message: '당신의 매력을\n어필할 좋은 기회예요',
    subMessage: '분위기 메이커가 될 수 있어요',
  },
  {
    id: 'dinner-6',
    message: '긍정적인 평가를\n받을 수 있어요',
    subMessage: '좋은 인상을 남길 수 있어요',
  },
  {
    id: 'dinner-7',
    message: '적당한 시간만\n참석해도 좋아요',
    subMessage: '무리하지 않는 선에서 참석하세요',
  },
  {
    id: 'dinner-8',
    message: '컨디션을 봐가며\n결정하세요',
    subMessage: '부담 갖지 않아도 돼요',
  },
  {
    id: 'dinner-9',
    message: '다음 기회를\n기다려보는 게 어때요',
    subMessage: '오늘은 개인 시간을 가지세요',
  },
  {
    id: 'dinner-10',
    message: '참석하면 피곤한\n일이 생길 수 있어요',
    subMessage: '오늘은 조용히 쉬세요',
  },
  {
    id: 'dinner-11',
    message: '불필요한 오해를\n살 수 있어요',
    subMessage: '참석하지 않는 게 현명해요',
  },
  {
    id: 'dinner-12',
    message: '분위기가 좋지\n않을 수 있어요',
    subMessage: '다음 기회를 노리는 게 좋겠어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * DINNER_MESSAGES.length);
  return DINNER_MESSAGES[randomIndex];
};
