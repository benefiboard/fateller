export type FortuneGrade = 'best' | 'good' | 'normal' | 'bad' | 'worst';

export interface FortuneResult {
  score: number;
  grade: FortuneGrade;
  message: string;
}

export interface TotalFortune {
  total: FortuneResult;
  money: FortuneResult;
  love: FortuneResult;
  business: FortuneResult;
  health: FortuneResult;
  people: FortuneResult;
  // 추가 데이터
  background_image_url?: string;
  background_image_description?: string;
  lucky_color?: {
    name: string;
    hex: string;
  };
  lucky_number?: string;
  fortune_cards?: {
    crystal: BasicFortuneCardData;
    props: BasicFortuneCardData;
    time: BasicFortuneCardData;
    place: BasicFortuneCardData;
  };
}

interface BasicFortuneCardData {
  title: string;
  image: string;
  description: string;
  timeRange?: string;
}

export interface ApiResponse {
  isFace: boolean;
  description?: string;
  condition: {
    energy: string;
    signs: string;
  };
  advice: string;
}
