export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const EXERCISE_MESSAGES: MirrorMessage[] = [
  {
    id: 'exercise-1',
    message: '오늘 운동하면\n특별한 성과가 있어요',
    subMessage: '체중 감량의 기회예요',
  },
  {
    id: 'exercise-2',
    message: '운동하면서 좋은\n인연을 만날 거예요',
    subMessage: '즐거운 시간이 될 것 같아요',
  },
  {
    id: 'exercise-3',
    message: '오늘 체력이\n최상일 것 같아요',
    subMessage: '개인 기록을 깰 수 있어요',
  },
  {
    id: 'exercise-4',
    message: '운동 후의 성취감이\n특별할 것 같아요',
    subMessage: '뿌듯한 하루가 될 거예요',
  },
  {
    id: 'exercise-5',
    message: '가벼운 운동도\n큰 효과가 있을 거예요',
    subMessage: '작은 노력이 큰 변화를 만들어요',
  },
  {
    id: 'exercise-6',
    message: '운동이 활력소가\n될 것 같아요',
    subMessage: '긍정적인 에너지가 넘칠 거예요',
  },
  {
    id: 'exercise-7',
    message: '무리하지 않게\n가볍게 운동하세요',
    subMessage: '적당한 강도로 하는 게 좋아요',
  },
  {
    id: 'exercise-8',
    message: '집에서 간단한\n스트레칭은 어때요',
    subMessage: '꼭 헬스장에 갈 필요는 없어요',
  },
  {
    id: 'exercise-9',
    message: '운동은 내일로\n미뤄도 괜찮아요',
    subMessage: '오늘은 휴식이 필요해요',
  },
  {
    id: 'exercise-10',
    message: '오늘은 컨디션이\n좋지 않을 것 같아요',
    subMessage: '무리한 운동은 피하세요',
  },
  {
    id: 'exercise-11',
    message: '운동하다가 부상을\n당할 수 있어요',
    subMessage: '오늘은 쉬는 게 현명해요',
  },
  {
    id: 'exercise-12',
    message: '과한 운동은\n역효과를 부를 거예요',
    subMessage: '컨디션 회복에 집중하세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * EXERCISE_MESSAGES.length);
  return EXERCISE_MESSAGES[randomIndex];
};
