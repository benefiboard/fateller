export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const WHEN_MESSAGES: MirrorMessage[] = [
  {
    id: 'timing-1',
    message: '지금이 바로 그때입니다',
    subMessage: '당신이 고민하는 그 일, 더 이상 망설이지 마세요',
  },
  {
    id: 'timing-2',
    message: '조금 더 기다려주세요',
    subMessage: '때가 무르익지 않았습니다. 조급해하지 마세요',
  },
  {
    id: 'timing-3',
    message: '다음 달이 좋은 시기가 될 것입니다',
    subMessage: '천천히 준비하면서 기다려보세요',
  },
  {
    id: 'timing-4',
    message: '3일 안에 행동하세요',
    subMessage: '기회는 금방 지나갈 수 있습니다',
  },
  {
    id: 'timing-5',
    message: '일단 한 걸음 물러서보세요',
    subMessage: '거리를 두고 바라보면 새로운 관점이 보일 것입니다',
  },
  {
    id: 'timing-6',
    message: '이번 주말이 적기입니다',
    subMessage: '주말에 맞춰 계획을 세워보세요',
  },
  {
    id: 'timing-7',
    message: '봄이 오면 시작하세요',
    subMessage: '새로운 시작을 위한 완벽한 시기가 될 것입니다',
  },
  {
    id: 'timing-8',
    message: '지금 당장 시작하세요',
    subMessage: '더 이상의 준비는 필요하지 않습니다',
  },
  {
    id: 'timing-9',
    message: '천천히 진행하세요',
    subMessage: '서두르면 실수할 수 있습니다',
  },
  {
    id: 'timing-10',
    message: '다음 보름달을 기다려보세요',
    subMessage: '달이 차오를 때 당신의 운도 차오를 것입니다',
  },
];

// 랜덤 메시지 선택 함수
export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * WHEN_MESSAGES.length);
  return WHEN_MESSAGES[randomIndex];
};
