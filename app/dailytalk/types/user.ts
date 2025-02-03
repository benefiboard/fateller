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
