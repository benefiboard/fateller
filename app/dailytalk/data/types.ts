// app/dailytalk/data/types.ts
export type BlockPart = 'intro' | 'main' | 'outro';
export type Mood = 'positive' | 'neutral' | 'negative';
export type MBTIGroup = 'IN' | 'EN' | 'IS' | 'ES';

export type ContentBlock = {
  intro: string[];
  main: string[];
  outro: string[];
};

export type MBTIBlock = {
  [key in Mood]: ContentBlock;
};

export type MBTIDependentBlock = {
  [key in MBTIGroup]: MBTIBlock;
};

export type SimpleBlock = {
  [key in Mood]: ContentBlock;
};

export type FinanceContentBlock = {
  conservative: {
    intro: string[];
    main: string[];
    outro: string[];
  };
  moderate: {
    intro: string[];
    main: string[];
    outro: string[];
  };
  aggressive: {
    intro: string[];
    main: string[];
    outro: string[];
  };
};

export type FinanceBlock = {
  [key in Mood]: FinanceContentBlock;
};

export type PersonaType = 'original' | 'influence' | 'philosophy' | 'poetic' | 'manager';

export type FortuneResultType = {
  fortune_content: {
    comprehensive_solution_summary: {
      content: string;
      background_image_url?: string;
      background_image_description?: string;
      fortune_score: number;
      finance_score: number;
      health_score: number;
      love_score: number;
      lucky_color: {
        name: string;
        hex: string;
      };
      lucky_number: string;
      personality_insights?: {
        emotional_stability: number;
        conscientiousness: number;
        extraversion: number;
        openness: number;
        agreeableness: number;
      };
      // 새로 추가하는 부분
      fortune_cards?: Record<FortuneCardType, FortuneCardItemType>;
    };
    daily_fortune: string;
    finance_solution: string;
    health_solution: string;
    love_solution: string;
    fashion_recommendation: string;
    meal_recommendation: string;
    mind_solution?: string;
  };
};

export type FortuneLevel = 'positive' | 'neutral' | 'negative';
export type FortuneCardType = 'crystal' | 'place' | 'time' | 'props';

export type FortuneCardItemType = {
  title: string;
  image: string;
  description: string;
  timeRange?: string;
};

export type CardType = 'character' | 'crystal' | 'props' | 'time' | 'place';

export const FORTUNE_CARD_TYPES: CardType[] = ['character', 'crystal', 'props', 'time', 'place'];

export const FORTUNE_CARD_LABELS: Record<CardType, string> = {
  character: '오늘의 나는?',
  crystal: '행운의 크리스탈',
  props: '행운의 소품',
  time: '행운의 시간',
  place: '행운의 장소',
} as const;

export interface FortuneCardData {
  title: string;
  image?: string;
  description: string;
  timeRange?: string;
  score?: number;
}

/* # 페르소나별 스타일 가이드

## MZ 스타일
- 신조어와 축약어 사용
- 이모티콘 적극 활용
- SNS 용어 사용
- 영한 혼용

## 격식체 스타일
- 정중한 표현 사용
- '-습니다', '-입니다' 활용
- 존댓말 일관성 유지
- 절제된 이모티콘 사용

## 문학체 스타일
- 우아하고 서정적인 표현
- 은유와 직유 활용
- 계절감 표현
- 감성적 어휘 선택

## 친근체 스타일
- 구어체 사용
- '-요' 체 활용
- 친근한 이모티콘
- 일상적 표현 */
