// types/tarot.ts

// 멀티 운세 종류 (기존)
export type FortuneType = '애정운' | '재물운' | '사업 및 직장운';

// 싱글 운세 종류 (신규)
export type SingleFortuneType = '연애운' | '취업운' | '금전운' | '짝사랑운';

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
