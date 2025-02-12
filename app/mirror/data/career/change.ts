export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const CHANGE_MESSAGES: MirrorMessage[] = [
  {
    id: 'change-1',
    message: '기대 이상의\n연봉 상승이 있어요',
    subMessage: '당신의 가치를 인정받을 거예요',
  },
  {
    id: 'change-2',
    message: '더 좋은 조건의\n제안이 올 거예요',
    subMessage: '기회를 놓치지 마세요',
  },
  {
    id: 'change-3',
    message: '실력을 제대로\n인정받을 수 있어요',
    subMessage: '큰 폭의 연봉 상승이 기대돼요',
  },
  {
    id: 'change-4',
    message: '좋은 기회가\n기다리고 있어요',
    subMessage: '지금이 이직하기 좋은 때예요',
  },
  {
    id: 'change-5',
    message: '연봉 협상에서\n우위를 점할 거예요',
    subMessage: '자신감을 가지고 임하세요',
  },
  {
    id: 'change-6',
    message: '노력한 만큼\n보상받을 수 있어요',
    subMessage: '준비한 만큼 결과가 있을 거예요',
  },
  {
    id: 'change-7',
    message: '현재 수준을\n유지할 것 같아요',
    subMessage: '큰 변화는 없을 것 같네요',
  },
  {
    id: 'change-8',
    message: '조금 더 준비가\n필요할 것 같아요',
    subMessage: '서두르지 말고 차근차근 준비하세요',
  },
  {
    id: 'change-9',
    message: '지금은 이직보다\n경험을 쌓으세요',
    subMessage: '때를 기다리는 게 좋겠어요',
  },
  {
    id: 'change-10',
    message: '오히려 손해를\n볼 수도 있어요',
    subMessage: '현재 회사에 남는 게 이로울 수 있어요',
  },
  {
    id: 'change-11',
    message: '지금 이직하면\n후회할 수 있어요',
    subMessage: '시기가 좋지 않아요',
  },
  {
    id: 'change-12',
    message: '예상보다 낮은\n조건일 수 있어요',
    subMessage: '기대가 실망으로 바뀔 수 있어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * CHANGE_MESSAGES.length);
  return CHANGE_MESSAGES[randomIndex];
};
