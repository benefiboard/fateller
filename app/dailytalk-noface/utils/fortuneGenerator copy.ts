// app/dailytalk/utils/fortuneGenerator.ts

import { FORTUNE_IMAGES } from '../constants/fortuneImages';
import {
  CRYSTAL_BACKGROUNDS,
  LUCKY_PLACES,
  LUCKY_PROPS,
  LUCKY_TIMES,
} from '../constants/fortuneData';
import { combineBlocks } from '../data';
import type { UserInfoType } from '../types/user';
import { FortuneCardItemType, FortuneCardType, FortuneLevel } from '../data/types';

export const LUCKY_COLORS = [
  { name: '루비 레드', hex: '#E0115F' },
  { name: '사파이어 블루', hex: '#0F52BA' },
  { name: '에메랄드 그린', hex: '#50C878' },
  { name: '로열 퍼플', hex: '#7851A9' },
  { name: '선셋 오렌지', hex: '#FD5E53' },
  { name: '골든 옐로우', hex: '#FFD700' },
  { name: '로즈 핑크', hex: '#FF69B4' },
  { name: '터쿼이즈', hex: '#40E0D0' },
  { name: '라벤더', hex: '#E6E6FA' },
  { name: '민트 그린', hex: '#98FF98' },
  { name: '코랄', hex: '#FF7F50' },
  { name: '인디고', hex: '#4B0082' },
];

// 기본 점수 생성 함수 (각 구간별 33.33% 확률)
const generateBaseScore = (): number => {
  const rand = Math.random();
  if (rand < 1 / 3) return 50; // negative (41-60) 구간의 중간값
  if (rand < 2 / 3) return 70; // neutral (61-80) 구간의 중간값
  return 90; // positive (81-100) 구간의 중간값
};

// 변동 점수 생성 함수 (-9 ~ +9 사이의 랜덤값)
const generateVariance = (): number => {
  return Math.floor(Math.random() * 19) - 9;
};

// 점수 보정 함수 (41-100 범위 유지)
const normalizeScore = (score: number): number => {
  if (score > 100) return 100;
  if (score < 41) return 41;
  return Math.floor(score);
};

// Big Five 특성을 고려한 점수 조정
const adjustScoreWithBigFive = (
  baseScore: number,
  bigFive: UserInfoType['bigFive'],
  type: 'fortune' | 'finance' | 'health' | 'love'
): number => {
  if (!bigFive) return baseScore;

  let adjustment = 0;
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

  switch (type) {
    case 'fortune':
      adjustment = ((100 - neuroticism.score) * 0.3 + conscientiousness.score * 0.2) / 10;
      break;
    case 'finance':
      adjustment = (conscientiousness.score * 0.4 + openness.score * 0.1) / 10;
      break;
    case 'health':
      adjustment = (conscientiousness.score * 0.3 + (100 - neuroticism.score) * 0.2) / 10;
      break;
    case 'love':
      adjustment = (extraversion.score * 0.3 + agreeableness.score * 0.2) / 10;
      break;
  }

  return normalizeScore(baseScore + adjustment);
};

// 운세 상태 결정 함수
const determineFortuneState = (score: number): FortuneLevel => {
  if (score >= 81) return 'positive';
  if (score >= 61) return 'neutral';
  return 'negative';
};

// 평균점수 계산 함수
const calculateAverageScore = (scores: {
  fortune: number;
  finance: number;
  health: number;
  love: number;
}): number => {
  const total = scores.fortune + scores.finance + scores.health + scores.love;
  return Math.floor(total / 4);
};

// 운세 카드 정보 생성 함수
const generateFortuneCardInfo = (fortuneState: FortuneLevel) => {
  return {
    crystal:
      CRYSTAL_BACKGROUNDS[fortuneState][
        Math.floor(Math.random() * CRYSTAL_BACKGROUNDS[fortuneState].length)
      ],
    props: LUCKY_PROPS[fortuneState][Math.floor(Math.random() * LUCKY_PROPS[fortuneState].length)],
    time: LUCKY_TIMES[fortuneState][Math.floor(Math.random() * LUCKY_TIMES[fortuneState].length)],
    place:
      LUCKY_PLACES[fortuneState][Math.floor(Math.random() * LUCKY_PLACES[fortuneState].length)],
  } as Record<FortuneCardType, FortuneCardItemType>;
};

export const generatePersonaFortune = async (
  userInfo: UserInfoType,
  persona: string = 'original'
) => {
  console.log('Generating persona fortune for:', userInfo, 'with persona:', persona);

  const mbtiGroup = (userInfo.mbti?.type.slice(0, 2) as 'IN' | 'EN' | 'IS' | 'ES') || 'IS';
  const baseScore = generateBaseScore();
  console.log('Base overall score:', baseScore);

  const scores = {
    fortune: adjustScoreWithBigFive(baseScore, userInfo.bigFive, 'fortune'),
    finance: adjustScoreWithBigFive(
      normalizeScore(baseScore + generateVariance()),
      userInfo.bigFive,
      'finance'
    ),
    health: adjustScoreWithBigFive(
      normalizeScore(baseScore + generateVariance()),
      userInfo.bigFive,
      'health'
    ),
    love: adjustScoreWithBigFive(
      normalizeScore(baseScore + generateVariance()),
      userInfo.bigFive,
      'love'
    ),
  };

  const averageScore = calculateAverageScore(scores);
  const fortuneState = determineFortuneState(averageScore);

  const images = FORTUNE_IMAGES[fortuneState];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  const fortuneStates = {
    overall: determineFortuneState(scores.fortune),
    finance: determineFortuneState(scores.finance),
    health: determineFortuneState(scores.health),
    love: determineFortuneState(scores.love),
  };

  const colorPoolSize =
    userInfo.bigFive?.openness.score && userInfo.bigFive.openness.score > 70
      ? LUCKY_COLORS.length
      : Math.floor(LUCKY_COLORS.length / 2);
  const randomColor = LUCKY_COLORS[Math.floor(Math.random() * colorPoolSize)];

  const gender = userInfo.gender || 'female';

  const result = {
    fortune_content: {
      comprehensive_solution_summary: {
        content: await combineBlocks(
          'summary',
          fortuneStates.overall,
          mbtiGroup,
          undefined,
          undefined,
          gender,
          persona
        ),
        fortune_score: scores.fortune,
        finance_score: scores.finance,
        health_score: scores.health,
        love_score: scores.love,
        background_image_url: randomImage,
        lucky_color: {
          name: randomColor.name,
          hex: randomColor.hex,
        },
        lucky_number: String(Math.floor(Math.random() * 10) + 1),
        // 여기에 fortune_cards 추가
        fortune_cards: generateFortuneCardInfo(fortuneState),
        ...(userInfo.bigFive && {
          personality_insights: {
            emotional_stability: Math.round(100 - userInfo.bigFive.neuroticism.score),
            conscientiousness: Math.round(userInfo.bigFive.conscientiousness.score),
            extraversion: Math.round(userInfo.bigFive.extraversion.score),
            openness: Math.round(userInfo.bigFive.openness.score),
            agreeableness: Math.round(userInfo.bigFive.agreeableness.score),
          },
        }),
      },
      daily_fortune: await combineBlocks(
        'summary',
        fortuneStates.overall,
        mbtiGroup,
        undefined,
        undefined,
        gender,
        persona
      ),
      finance_solution: await combineBlocks(
        'finance',
        fortuneStates.finance,
        mbtiGroup,
        userInfo.bigFive,
        userInfo.riskAversion?.toLowerCase(),
        gender,
        persona
      ),
      health_solution: await combineBlocks(
        'health',
        fortuneStates.health,
        undefined,
        undefined,
        undefined,
        gender,
        persona
      ),
      mind_solution: await combineBlocks(
        'mind',
        fortuneStates.overall,
        mbtiGroup,
        userInfo.bigFive,
        undefined,
        gender,
        persona
      ),
      love_solution: await combineBlocks(
        'love',
        fortuneStates.love,
        mbtiGroup,
        undefined,
        undefined,
        gender,
        persona
      ),
      fashion_recommendation: await combineBlocks(
        'fashion',
        fortuneStates.overall,
        mbtiGroup,
        undefined,
        undefined,
        gender,
        persona
      ),
      meal_recommendation: await combineBlocks(
        'meal',
        fortuneStates.health,
        undefined,
        undefined,
        undefined,
        gender,
        persona
      ),
    },
  };

  console.log('Generated persona result:', result);
  return result;
};
