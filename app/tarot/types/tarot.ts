// types/tarot.ts

// 멀티 운세 종류 (기존)
export type FortuneType = '애정운' | '재물운' | '직업운';

// 싱글 운세 종류 (신규)
export type SingleFortuneType = '연애운' | '직업운' | '금전운' | '짝사랑운';

interface TimingAdvice {
  timing?: string; // "이번 달", "이번 주", "다가오는 주말" 등
  place?: string; // "카페", "문화센터", "친구 모임" 등
  actionItems?: string[]; // 실천 가능한 행동 리스트
}

interface Affirmation {
  message?: string; // 긍정적 자기 암시 메시지
}

// 운세 해석 내용 (공통)
export interface FortuneInterpretation {
  message: string;
  keywords?: string[];
  advice?: string;
  timing?: TimingAdvice;
  affirmation?: Affirmation;
  successRate?: string;
}

// 타로 카드 기본 정보 (공통)
export interface TarotCard {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  imageUrl: string;
  keywords: string[];
  interpretation: {
    love: FortuneInterpretation[];
    money: FortuneInterpretation[];
    business: FortuneInterpretation[];
  };
  defaultScore?: number;
}

// 싱글 타로 카드 정보 (신규)
export interface SingleTarotCard extends Omit<TarotCard, 'interpretation'> {
  interpretation: FortuneInterpretation[]; // 단일 주제에 대한 해석만 포함
}

// 선택된 카드 상태 (멀티용)
export interface SelectedCard extends TarotCard {
  type: FortuneType;
  selected: boolean;
  flipped: boolean;
  selectedInterpretation?: FortuneInterpretation;
}

// 선택된 싱글 카드 상태 (신규)
export interface SelectedSingleCard extends SingleTarotCard {
  type: SingleFortuneType;
  selected: boolean;
  flipped: boolean;
  selectedInterpretation?: FortuneInterpretation;
}

// 멀티 타로 리딩 결과
export interface TarotReading {
  cards: {
    love: SelectedCard | null;
    money: SelectedCard | null;
    business: SelectedCard | null;
  };
}

// 싱글 타로 리딩 결과 (신규)
export interface SingleTarotReading {
  card: SelectedSingleCard | null;
}

/* {
  id: 'fool',
  name: {
    ko: '광대',
    en: 'THE FOOL',
  },
  imageUrl: '/tarot/fool.png',
},
{
  id: 'magician',
  name: {
    ko: '마법사',
    en: 'THE MAGICIAN',
  },
  imageUrl: '/tarot/magician.png',
},
{
  id: 'highpriestess',
  name: {
    ko: '여사제',
    en: 'THE HIGH PRIESTESS',
  },
  imageUrl: '/tarot/highpriestess.png',
},
{
  id: 'empress',
  name: {
    ko: '여황제',
    en: 'THE EMPRESS',
  },
  imageUrl: '/tarot/empress.png',
},
{
  id: 'emperor',
  name: {
    ko: '황제',
    en: 'THE EMPEROR',
  },
  imageUrl: '/tarot/emperor.png',
},
{
  id: 'hierophant',
  name: {
    ko: '교황',
    en: 'THE HIEROPHANT',
  },
  imageUrl: '/tarot/hierophant.png',
},
{
  id: 'lovers',
  name: {
    ko: '연인들',
    en: 'THE LOVERS',
  },
  imageUrl: '/tarot/lovers.png',
},
{
  id: 'chariot',
  name: {
    ko: '전차',
    en: 'THE CHARIOT',
  },
  imageUrl: '/tarot/chariot.png',
},
{
  id: 'strength',
  name: {
    ko: '힘',
    en: 'STRENGTH',
  },
  imageUrl: '/tarot/strength.png',
},
{
  id: 'hermit',
  name: {
    ko: '은둔자',
    en: 'THE HERMIT',
  },
  imageUrl: '/tarot/hermit.png',
},
{
  id: 'wheelOfFortune',
  name: {
    ko: '운명의 수레바퀴',
    en: 'WHEEL OF FORTUNE',
  },
  imageUrl: '/tarot/wheel-of-fortune.png',
},
{
  id: 'justice',
  name: {
    ko: '정의',
    en: 'JUSTICE',
  },
  imageUrl: '/tarot/justice.png',
},
{
  id: 'hangedMan',
  name: {
    ko: '매달린 사람',
    en: 'THE HANGED MAN',
  },
  imageUrl: '/tarot/hanged-man.png',
},
{
  id: 'death',
  name: {
    ko: '죽음',
    en: 'DEATH',
  },
  imageUrl: '/tarot/death.png',
},
{
  id: 'temperance',
  name: {
    ko: '절제',
    en: 'TEMPERANCE',
  },
  imageUrl: '/tarot/temperance.png',
},
{
  id: 'devil',
  name: {
    ko: '악마',
    en: 'THE DEVIL',
  },
  imageUrl: '/tarot/devil.png',
},
{
  id: 'tower',
  name: {
    ko: '탑',
    en: 'THE TOWER',
  },
  imageUrl: '/tarot/tower.png',
},
{
  id: 'star',
  name: {
    ko: '별',
    en: 'THE STAR',
  },
  imageUrl: '/tarot/star.png',
},
{
  id: 'moon',
  name: {
    ko: '달',
    en: 'THE MOON',
  },
  imageUrl: '/tarot/moon.png',
},
{
  id: 'sun',
  name: {
    ko: '태양',
    en: 'THE SUN',
  },
  imageUrl: '/tarot/sun.png',
},
{
  id: 'judgement',
  name: {
    ko: '심판',
    en: 'JUDGEMENT',
  },
  imageUrl: '/tarot/judgement.png',
},
{
  id: 'world',
  name: {
    ko: '세계',
    en: 'THE WORLD',
  },
  imageUrl: '/tarot/world.png',
} */
