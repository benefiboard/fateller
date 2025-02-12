export interface MirrorMessage {
  id: string;
  message: string;
  subMessage?: string;
}

export const CRUSH_MESSAGES: MirrorMessage[] = [
  {
    id: 'crush-1',
    message: '당신의 마음이\n그 사람에게 닿을 거예요',
    subMessage: '서로의 마음이 통할 수 있어요',
  },
  {
    id: 'crush-2',
    message: '그 사람도 몰래\n당신을 보고 있어요',
    subMessage: '용기를 내보는 건 어떨까요?',
  },
  {
    id: 'crush-3',
    message: '이제 곧\n마음이 전해질 거예요',
    subMessage: '조금만 더 기다려보세요',
  },
  {
    id: 'crush-4',
    message: '우연한 마주침이\n기회가 될 거예요',
    subMessage: '자연스러운 만남을 기대해보세요',
  },
  {
    id: 'crush-5',
    message: '서로의 감정이\n통하고 있어요',
    subMessage: '비슷한 마음을 품고 있을 거예요',
  },
  {
    id: 'crush-6',
    message: '당신의 진심이\n전해질 것 같아요',
    subMessage: '표현하기 좋은 날이에요',
  },
  {
    id: 'crush-7',
    message: '지금은 서로\n조금 더 알아가는 중이에요',
    subMessage: '천천히 다가가보세요',
  },
  {
    id: 'crush-8',
    message: '아직은 때가\n아닌 것 같아요',
    subMessage: '조금 더 기다려보는 게 좋겠어요',
  },
  {
    id: 'crush-9',
    message: '서로의 마음을\n확신하기는 이르네요',
    subMessage: '시간을 두고 지켜보세요',
  },
  {
    id: 'crush-10',
    message: '상대방의 마음은\n다를 수 있어요',
    subMessage: '실망하지 마세요',
  },
  {
    id: 'crush-11',
    message: '지금은 마음을\n접어두는 게 좋겠어요',
    subMessage: '때로는 포기도 필요해요',
  },
  {
    id: 'crush-12',
    message: '이 마음이\n상처가 될 수 있어요',
    subMessage: '현실적으로 생각해보세요',
  },
];

export const getRandomMessage = (): MirrorMessage => {
  const randomIndex = Math.floor(Math.random() * CRUSH_MESSAGES.length);
  return CRUSH_MESSAGES[randomIndex];
};
