export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const SOME_MESSAGES: MirrorMessage[] = [
  {
    id: 'some-1',
    message: '은은한 썸이\n사랑이 될 거예요',
    subMessage: '곧 관계가 발전할 것 같아요',
  },
  {
    id: 'some-2',
    message: '서로의 마음이\n통하고 있어요',
    subMessage: '더 가까워질 기회가 올 거예요',
  },
  {
    id: 'some-3',
    message: '용기를 내면\n좋은 결과가 있어요',
    subMessage: '한 걸음 더 다가가보세요',
  },
  {
    id: 'some-4',
    message: '이제 곧 연인으로\n발전할 것 같아요',
    subMessage: '서로의 마음이 확실해질 거예요',
  },
  {
    id: 'some-5',
    message: '특별한 고백이\n기다리고 있어요',
    subMessage: '설레는 순간이 다가오고 있어요',
  },
  {
    id: 'some-6',
    message: '달콤한 연애가\n시작될 것 같아요',
    subMessage: '썸이 사랑으로 바뀔 거예요',
  },
  {
    id: 'some-7',
    message: '서두르면 관계가\n망가질 수 있어요',
    subMessage: '자연스럽게 흘러가도록 하세요',
  },
  {
    id: 'some-8',
    message: '지금은 서로를\n알아가는 시간이에요',
    subMessage: '조급해하지 마세요',
  },
  {
    id: 'some-9',
    message: '상대의 마음을\n확신하긴 이르네요',
    subMessage: '좀 더 지켜보는 게 좋겠어요',
  },
  {
    id: 'some-10',
    message: '이 썸은 그저\n썸으로 끝날 거예요',
    subMessage: '너무 기대하지 않는 게 좋아요',
  },
  {
    id: 'some-11',
    message: '서로 원하는 게\n다른 것 같아요',
    subMessage: '실망하기 전에 멈추세요',
  },
  {
    id: 'some-12',
    message: '더 발전하면\n후회할 수 있어요',
    subMessage: '이대로 정리하는 게 좋겠어요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * SOME_MESSAGES.length);
  return SOME_MESSAGES[randomIndex];
};
