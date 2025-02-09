// app/dailytalk/types/user.ts

export type PersonalityDimensionType = {
  value: number;
  preference: string;
  percentage: number;
};

export type MBTIDimensionsType = {
  EI: PersonalityDimensionType;
  SN: PersonalityDimensionType;
  TF: PersonalityDimensionType;
  JP: PersonalityDimensionType;
};

export type MBTIDataType = {
  type: string;
  dimensions: MBTIDimensionsType;
  confidence: number;
};

export type BigFiveScoreType = {
  score: number;
  percentile: number;
};

export type BigFiveDataType = {
  openness: BigFiveScoreType;
  conscientiousness: BigFiveScoreType;
  extraversion: BigFiveScoreType;
  agreeableness: BigFiveScoreType;
  neuroticism: BigFiveScoreType;
};

export type UserInfoType = {
  // 기본 사용자 정보
  gender?: string;
  age?: number;
  location?: string;

  // 성격 특성 정보
  mbti?: MBTIDataType;
  bigFive?: BigFiveDataType;
  riskAversion?: string;
};

export type SajuInformation = {
  name: string;
  gender: '남자' | '여자';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  isTimeUnknown?: boolean;
  specialNumber?: number;
};

export interface FortuneData {
  lifelong_fortune: string;
  major_fortune: string;
  prime_time: string;
  caution_period: string;
  health_fortune: string;
  early_years: string;
  middle_age: string;
  senior_years: string;
  spouse_fortune: string;
  wealth_fortune: string;
  career_fortune: string;
  children_fortune: string;
}

export type SaveSajuResponse = {
  success: boolean;
  error?: string;
};
